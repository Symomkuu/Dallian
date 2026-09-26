"""Data models for customer orders, line items, and fulfillment tracking."""

import random
from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone

from catalog.models import Product


def generate_order_number() -> str:
    """Generate a unique human-friendly order reference like DLH-84291."""
    prefix = "DLH"
    rand_part = random.randint(10000, 99999)
    return f"{prefix}-{rand_part}"


class OrderStatus(models.TextChoices):
    PENDING = "pending", "Pending Confirmation"
    PAYMENT_CONFIRMED = "payment_confirmed", "Payment Confirmed"
    PROCESSING = "processing", "Processing & Customizing"
    READY_FOR_DELIVERY = "ready_for_delivery", "Ready for Delivery / Collection"
    OUT_FOR_DELIVERY = "out_for_delivery", "Out for Delivery"
    DELIVERED = "delivered", "Delivered"
    CANCELLED = "cancelled", "Cancelled"


class PaymentStatus(models.TextChoices):
    AWAITING_PAYMENT = "awaiting_payment", "Awaiting Payment"
    PAID = "paid", "Paid"
    FAILED = "failed", "Failed"
    REFUNDED = "refunded", "Refunded"


class PaymentMethod(models.TextChoices):
    MPESA = "mpesa", "M-Pesa"
    CARD = "card", "Card Payment"
    CASH_ON_DELIVERY = "cash_on_delivery", "Cash on Delivery"


class Order(models.Model):
    """A customer order, supporting both authenticated members and guest checkouts."""

    order_number = models.CharField(
        max_length=32,
        unique=True,
        editable=False,
        db_index=True,
        default=generate_order_number,
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders",
        help_text="Registered user who placed the order (null for guest orders).",
    )

    # Customer Contact Info (always filled, even for guests)
    customer_name = models.CharField(max_length=150)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=50)

    # Delivery & Shipping
    delivery_method = models.CharField(
        max_length=100,
        default="Nairobi Delivery",
        help_text="e.g. Store Collection, Nairobi Delivery, Countrywide Courier",
    )
    delivery_address = models.TextField(blank=True)
    delivery_city = models.CharField(max_length=100, blank=True, default="Nairobi")
    delivery_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )

    # Order Totals
    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    discount_code = models.CharField(max_length=50, blank=True)
    discount_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )

    # Status & Payment
    status = models.CharField(
        max_length=32,
        choices=OrderStatus.choices,
        default=OrderStatus.PENDING,
        db_index=True,
    )
    payment_status = models.CharField(
        max_length=32,
        choices=PaymentStatus.choices,
        default=PaymentStatus.AWAITING_PAYMENT,
        db_index=True,
    )
    payment_method = models.CharField(
        max_length=50,
        choices=PaymentMethod.choices,
        default=PaymentMethod.MPESA,
    )
    payment_reference = models.CharField(
        max_length=100,
        blank=True,
        help_text="M-Pesa transaction code or payment gateway reference.",
    )

    # Notes
    customer_notes = models.TextField(blank=True, help_text="Special instructions from customer.")
    staff_notes = models.TextField(blank=True, help_text="Internal fulfillment notes.")

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["customer_phone", "-created_at"], name="idx_order_cust_phone"),
            models.Index(fields=["customer_email", "-created_at"], name="idx_order_cust_email"),
            models.Index(fields=["status", "-created_at"], name="idx_order_status"),
        ]

    def __str__(self) -> str:
        guest_label = " (Guest)" if not self.user else ""
        return f"{self.order_number} — {self.customer_name}{guest_label} ({self.get_status_display()})"

    @property
    def is_guest(self) -> bool:
        """True if the order was placed without an authenticated user account."""
        return self.user is None

    @property
    def item_count(self) -> int:
        """Total number of items in this order."""
        return sum(item.quantity for item in self.items.all())


class OrderItem(models.Model):
    """Snapshot of a purchased product variant inside an order."""

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="order_items",
        help_text="Reference to the product (may be null if product is later deleted).",
    )

    # Snapshot data at the exact moment of order placement
    product_name = models.CharField(max_length=255)
    product_image = models.URLField(max_length=500, blank=True)
    selected_size = models.CharField(max_length=100, blank=True)
    selected_color = models.CharField(max_length=100, blank=True)
    selected_length = models.PositiveIntegerField(null=True, blank=True)
    selected_cap_type = models.CharField(max_length=100, blank=True)

    unit_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    total_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]

    def __str__(self) -> str:
        return f"{self.quantity}x {self.product_name} in {self.order.order_number}"

    def save(self, *args, **kwargs):
        if not self.total_price:
            self.total_price = self.unit_price * self.quantity
        super().save(*args, **kwargs)
