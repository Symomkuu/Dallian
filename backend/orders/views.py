"""Views for order checkout, customer order tracking, and staff management."""

from django.db.models import Q, Sum
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from catalog.models import Product
from orders.models import Order, OrderStatus
from orders.serializers import (
    CheckoutInputSerializer,
    OrderAdminUpdateSerializer,
    OrderDetailSerializer,
    OrderListSerializer,
)
from orders.services import process_checkout
from users.authentication import CookieJWTAuthentication, enforce_csrf
from users.cookies import ACCESS_COOKIE
from users.models import User
from users.permissions import IsStaffRole


class OptionalCookieJWTAuthentication(CookieJWTAuthentication):
    """Authenticate user via cookie JWT if valid, but never hard-fail on public guest endpoints."""

    def authenticate(self, request):
        raw_token = request.COOKIES.get(ACCESS_COOKIE)
        if raw_token is None:
            return None
        try:
            enforce_csrf(request)
            validated_token = self.get_validated_token(raw_token)
            return self.get_user(validated_token), validated_token
        except Exception:
            # If CSRF or token validation fails on a public guest-friendly endpoint,
            # allow the request to proceed as guest instead of throwing a 403 Forbidden error.
            return None


class CheckoutView(APIView):
    """Public checkout endpoint: creates an order for guests or authenticated customers."""

    authentication_classes = [OptionalCookieJWTAuthentication]
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CheckoutInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user if getattr(request, "user", None) and request.user.is_authenticated else None
        order = process_checkout(serializer.validated_data, user=user)

        response_data = OrderDetailSerializer(order).data
        return Response(response_data, status=status.HTTP_201_CREATED)


class CustomerOrdersView(generics.ListAPIView):
    """List all orders placed by the currently logged-in customer."""

    serializer_class = OrderListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Order.objects.filter(
            Q(user=user) | Q(customer_email__iexact=user.email)
        ).prefetch_related("items").order_by("-created_at")


class GuestOrderTrackView(APIView):
    """Public order tracking endpoint for guest customers (by order number + phone or email)."""

    authentication_classes = [OptionalCookieJWTAuthentication]
    permission_classes = [AllowAny]

    def get(self, request):
        order_number = request.query_params.get("order_number", "").strip().upper()
        contact = request.query_params.get("contact", "").strip()

        if not order_number:
            return Response(
                {"detail": "Please provide an order number."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        query = Q(order_number__iexact=order_number)
        if not order_number.startswith("DAL-"):
            query |= Q(order_number__iexact=f"DAL-{order_number}")

        if contact:
            clean_contact = contact.replace(" ", "").replace("-", "")
            query &= (
                Q(customer_email__iexact=contact)
                | Q(customer_phone__icontains=clean_contact)
            )

        order = Order.objects.filter(query).prefetch_related("items").first()
        if not order:
            return Response(
                {"detail": "We could not find an order matching those details."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(OrderDetailSerializer(order).data)


class OrderDetailView(APIView):
    """Retrieve details of an order by its unique order number."""

    permission_classes = [AllowAny]

    def get(self, request, order_number):
        order = Order.objects.filter(order_number__iexact=order_number).prefetch_related("items").first()
        if not order:
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        # If user is logged in and not staff, verify ownership
        user = request.user if getattr(request, "user", None) and request.user.is_authenticated else None
        if user and user.role != "staff" and order.user and order.user != user:
            return Response({"detail": "Unauthorized to view this order."}, status=status.HTTP_403_FORBIDDEN)

        return Response(OrderDetailSerializer(order).data)


# ----------------------------------------------------------------- Staff / Admin Views


class AdminOrderListView(generics.ListAPIView):
    """List orders with filtering and search for staff dashboard."""

    serializer_class = OrderListSerializer
    permission_classes = [IsStaffRole]

    def get_queryset(self):
        params = self.request.query_params
        queryset = Order.objects.all().prefetch_related("items").order_by("-created_at")

        status_filter = params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        payment_status = params.get("payment_status")
        if payment_status:
            queryset = queryset.filter(payment_status=payment_status)

        search = params.get("q")
        if search:
            queryset = queryset.filter(
                Q(order_number__icontains=search)
                | Q(customer_name__icontains=search)
                | Q(customer_phone__icontains=search)
                | Q(customer_email__icontains=search)
            )

        return queryset


class AdminOrderDetailView(generics.RetrieveUpdateAPIView):
    """Retrieve full order details or update status/notes for staff."""

    permission_classes = [IsStaffRole]
    queryset = Order.objects.all().prefetch_related("items")
    lookup_field = "id"

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return OrderAdminUpdateSerializer
        return OrderDetailSerializer


class AdminOrderStatsView(APIView):
    """Summary metrics of revenue, pending orders, and total counts for the admin dashboard."""

    permission_classes = [IsStaffRole]

    def get(self, request):
        total_revenue = Order.objects.exclude(status=OrderStatus.CANCELLED).aggregate(
            sum=Sum("total_amount")
        )["sum"] or 0

        pending_count = Order.objects.filter(status=OrderStatus.PENDING).count()
        processing_count = Order.objects.filter(status=OrderStatus.PROCESSING).count()
        delivered_count = Order.objects.filter(status=OrderStatus.DELIVERED).count()
        total_orders = Order.objects.count()
        total_customers = User.objects.filter(role=User.ROLE_CUSTOMER).count()
        total_products = Product.objects.count()

        return Response({
            "total_revenue": float(total_revenue),
            "pending_orders": pending_count,
            "processing_orders": processing_count,
            "delivered_orders": delivered_count,
            "total_orders": total_orders,
            "total_customers": total_customers,
            "total_products": total_products,
        })
