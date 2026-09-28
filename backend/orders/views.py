"""Views for order checkout, customer order tracking, and staff management."""

import csv
from django.db.models import Count, Q, Sum
from django.http import HttpResponse
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from catalog.models import Product
from orders.models import Order, OrderItem, OrderStatus
from orders.serializers import (
    CheckoutInputSerializer,
    OrderAdminUpdateSerializer,
    OrderDetailSerializer,
    OrderListSerializer,
)
from orders.services import get_unified_customers, process_checkout
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


class AdminCustomerListView(APIView):
    """Unified list of registered members and guest checkout customers for staff dashboard."""

    permission_classes = [IsStaffRole]

    def get(self, request):
        search_query = request.query_params.get("q", "").strip()
        customer_type = request.query_params.get("type", "all").strip().lower()
        ordering = request.query_params.get("ordering", "-created_at").strip()
        page = int(request.query_params.get("page", 1))
        page_size = int(request.query_params.get("page_size", 25))

        data = get_unified_customers(
            search_query=search_query,
            customer_type=customer_type,
            ordering=ordering,
        )

        all_customers = data["customers"]
        total_count = len(all_customers)

        # Pagination
        start = (page - 1) * page_size
        end = start + page_size
        paginated = all_customers[start:end]

        return Response({
            "stats": data["stats"],
            "count": total_count,
            "page": page,
            "page_size": page_size,
            "results": paginated,
        })


class AdminCustomerExportView(APIView):
    """Export unified customer records (members + guests) as a CSV file for Excel / Sheets."""

    permission_classes = [IsStaffRole]

    def get(self, request):
        search_query = request.query_params.get("q", "").strip()
        customer_type = request.query_params.get("type", "all").strip().lower()
        ordering = request.query_params.get("ordering", "-created_at").strip()

        data = get_unified_customers(
            search_query=search_query,
            customer_type=customer_type,
            ordering=ordering,
        )

        response = HttpResponse(content_type="text/csv; charset=utf-8-sig")
        response["Content-Disposition"] = 'attachment; filename="dallian_luxe_customers.csv"'

        writer = csv.writer(response)
        # Header Row
        writer.writerow([
            "Customer ID",
            "Customer Type",
            "Full Name",
            "Email Address",
            "Phone Number",
            "Delivery Address",
            "City / Town",
            "Orders Placed",
            "Total Spend (KSh)",
            "Account / First Order Date",
            "Last Order Date",
            "Email Verified",
        ])

        for c in data["customers"]:
            writer.writerow([
                c["id"],
                "Registered Member" if c["customer_type"] == "registered" else "Guest Customer",
                c["full_name"],
                c["email"],
                c["phone"],
                c["delivery_address"],
                c["city"],
                c["orders_count"],
                f"{c['total_spent']:.2f}",
                c["created_at"][:10] if c["created_at"] else "",
                c["last_order_at"][:10] if c["last_order_at"] else "N/A",
                "Yes" if c["is_email_verified"] else "No",
            ])

        return response


class AdminTopProductsAnalyticsView(APIView):
    """Returns top 10 most viewed products and top 10 most ordered products for dashboard analytics."""

    permission_classes = [IsStaffRole]

    def get(self, request):
        # 1. Top 10 Most Viewed Products
        viewed_products = (
            Product.objects.filter(is_active=True)
            .select_related("category", "hairstyle")
            .prefetch_related("images")
            .order_by("-views_count", "-created_at")[:10]
        )

        most_viewed_list = []
        for p in viewed_products:
            primary_img = p.images.filter(is_primary=True).first() or p.images.first()
            img_url = primary_img.image_url if primary_img else ""

            order_stats = OrderItem.objects.filter(
                product_id=p.id,
                order__status__in=[
                    OrderStatus.PENDING,
                    OrderStatus.PAYMENT_CONFIRMED,
                    OrderStatus.PROCESSING,
                    OrderStatus.READY_FOR_DELIVERY,
                    OrderStatus.OUT_FOR_DELIVERY,
                    OrderStatus.DELIVERED,
                ],
            ).aggregate(
                units_sold=Sum("quantity"),
                orders_count=Count("order_id", distinct=True),
                total_revenue=Sum("total_price"),
            )

            most_viewed_list.append({
                "id": p.id,
                "name": p.name,
                "slug": p.slug,
                "category_name": p.category.name if p.category else "Wigs",
                "price": float(p.price),
                "previous_price": float(p.previous_price) if p.previous_price else None,
                "primary_image": img_url,
                "views_count": p.views_count,
                "stock_quantity": p.stock_quantity,
                "is_in_stock": p.stock_quantity > 0,
                "is_featured": p.is_featured,
                "average_rating": p.average_rating,
                "review_count": p.review_count,
                "units_sold": order_stats["units_sold"] or 0,
                "orders_count": order_stats["orders_count"] or 0,
                "total_revenue": float(order_stats["total_revenue"] or 0),
            })

        # 2. Top 10 Most Ordered Products
        ordered_aggregated = list(
            OrderItem.objects.filter(
                order__status__in=[
                    OrderStatus.PENDING,
                    OrderStatus.PAYMENT_CONFIRMED,
                    OrderStatus.PROCESSING,
                    OrderStatus.READY_FOR_DELIVERY,
                    OrderStatus.OUT_FOR_DELIVERY,
                    OrderStatus.DELIVERED,
                ]
            )
            .values("product_id", "product_name")
            .annotate(
                units_sold=Sum("quantity"),
                total_revenue=Sum("total_price"),
                orders_count=Count("order_id", distinct=True),
            )
            .order_by("-units_sold", "-total_revenue")[:10]
        )

        product_ids = [item["product_id"] for item in ordered_aggregated if item["product_id"]]
        product_map = {
            p.id: p
            for p in Product.objects.filter(id__in=product_ids)
            .select_related("category")
            .prefetch_related("images")
        }

        most_ordered_list = []
        for idx, item in enumerate(ordered_aggregated):
            p = product_map.get(item["product_id"])
            if p:
                primary_img = p.images.filter(is_primary=True).first() or p.images.first()
                img_url = primary_img.image_url if primary_img else ""
                name = p.name
                slug = p.slug
                cat_name = p.category.name if p.category else "Wigs"
                price = float(p.price)
                stock = p.stock_quantity
                views = p.views_count
                in_stock = p.stock_quantity > 0
                prod_id = p.id
            else:
                sample_item = OrderItem.objects.filter(product_name=item["product_name"]).first()
                img_url = sample_item.product_image if sample_item else ""
                name = item["product_name"]
                slug = ""
                cat_name = "Wigs"
                price = float(item["total_revenue"] / item["units_sold"]) if item["units_sold"] else 0.0
                stock = 0
                views = 0
                in_stock = False
                prod_id = item["product_id"] or f"ordered-{idx}"

            most_ordered_list.append({
                "id": prod_id,
                "name": name,
                "slug": slug,
                "category_name": cat_name,
                "price": price,
                "primary_image": img_url,
                "units_sold": item["units_sold"] or 0,
                "total_revenue": float(item["total_revenue"] or 0),
                "orders_count": item["orders_count"] or 0,
                "views_count": views,
                "stock_quantity": stock,
                "is_in_stock": in_stock,
            })

        return Response({
            "most_viewed": most_viewed_list,
            "most_ordered": most_ordered_list,
        })


