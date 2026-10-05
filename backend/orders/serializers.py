"""Serializers for orders: checkout input, customer order view, and admin management."""

from decimal import Decimal
from rest_framework import serializers

from catalog.models import Product
from orders.models import Order, OrderItem, OrderStatus, PaymentMethod, PaymentStatus


class OrderItemSerializer(serializers.ModelSerializer):
    """Read representation of an order item snapshot."""

    product_image = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = (
            "id",
            "product_id",
            "product_name",
            "product_image",
            "selected_size",
            "selected_color",
            "selected_length",
            "selected_cap_type",
            "unit_price",
            "quantity",
            "total_price",
        )

    def get_product_image(self, obj) -> str:
        if obj.product_image and obj.product_image.strip():
            return obj.product_image.strip()
        if obj.product:
            primary = obj.product.images.filter(is_primary=True).first() or obj.product.images.first()
            if primary and primary.image_url:
                return primary.image_url
        return ""


class OrderDetailSerializer(serializers.ModelSerializer):
    """Full detail representation of an order."""

    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    payment_status_display = serializers.CharField(source="get_payment_status_display", read_only=True)
    payment_method_display = serializers.CharField(source="get_payment_method_display", read_only=True)

    class Meta:
        model = Order
        fields = (
            "id",
            "order_number",
            "is_guest",
            "customer_name",
            "customer_email",
            "customer_phone",
            "delivery_method",
            "delivery_address",
            "delivery_city",
            "delivery_fee",
            "subtotal",
            "discount_code",
            "discount_amount",
            "total_amount",
            "status",
            "status_display",
            "payment_status",
            "payment_status_display",
            "payment_method",
            "payment_method_display",
            "payment_reference",
            "customer_notes",
            "staff_notes",
            "items",
            "created_at",
            "updated_at",
        )


class OrderListSerializer(serializers.ModelSerializer):
    """Concise representation of an order for listings and dashboard tables."""

    item_count = serializers.IntegerField(read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    payment_status_display = serializers.CharField(source="get_payment_status_display", read_only=True)

    class Meta:
        model = Order
        fields = (
            "id",
            "order_number",
            "is_guest",
            "customer_name",
            "customer_phone",
            "delivery_method",
            "total_amount",
            "status",
            "status_display",
            "payment_status",
            "payment_status_display",
            "item_count",
            "created_at",
        )


class CheckoutItemInputSerializer(serializers.Serializer):
    """One item from the frontend cart being submitted for checkout."""

    product_id = serializers.CharField(required=True)
    product_name = serializers.CharField(required=False, allow_blank=True, default="")
    product_image = serializers.CharField(required=False, allow_blank=True, default="")
    quantity = serializers.IntegerField(min_value=1, default=1)
    size = serializers.CharField(required=False, allow_blank=True, default="")
    color = serializers.CharField(required=False, allow_blank=True, default="")
    length = serializers.IntegerField(required=False, allow_null=True, default=None)
    cap_type = serializers.CharField(required=False, allow_blank=True, default="")
    price = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)


class CheckoutInputSerializer(serializers.Serializer):
    """Incoming checkout request payload from guest or authenticated user."""

    # Customer info
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=50)

    # Delivery info
    delivery_method = serializers.CharField(max_length=100)
    address = serializers.CharField(required=False, allow_blank=True, default="")
    city = serializers.CharField(max_length=100, required=False, allow_blank=True, default="Nairobi")
    delivery_fee = serializers.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))

    # Payment & Notes
    payment_method = serializers.ChoiceField(choices=PaymentMethod.choices, default=PaymentMethod.MPESA)
    notes = serializers.CharField(required=False, allow_blank=True, default="")
    discount_code = serializers.CharField(required=False, allow_blank=True, default="")

    # Cart items
    items = CheckoutItemInputSerializer(many=True, allow_empty=False)


class OrderAdminUpdateSerializer(serializers.ModelSerializer):
    """Staff serializer to update fulfillment and payment statuses."""

    class Meta:
        model = Order
        fields = (
            "status",
            "payment_status",
            "payment_reference",
            "staff_notes",
        )
