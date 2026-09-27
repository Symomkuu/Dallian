"""Business services for order placement, stock updates, and calculations."""

from decimal import Decimal
from typing import Any, Optional

from django.db import transaction
from django.db.models import F

from catalog.models import Product
from orders.models import Order, OrderItem, OrderStatus, PaymentStatus


def process_checkout(
    validated_data: dict[str, Any],
    user: Optional[Any] = None,
) -> Order:
    """Create an order and its snapshot items inside an atomic transaction."""
    items_data = validated_data["items"]
    delivery_fee = Decimal(str(validated_data.get("delivery_fee") or 0))
    discount_code = validated_data.get("discount_code", "").strip().upper()

    with transaction.atomic():
        # 1. Initialize Order shell
        order = Order(
            user=user if user and user.is_authenticated else None,
            customer_name=validated_data["name"].strip(),
            customer_email=validated_data["email"].strip().lower(),
            customer_phone=validated_data["phone"].strip(),
            delivery_method=validated_data.get("delivery_method") or "Nairobi Delivery",
            delivery_address=validated_data.get("address", "").strip(),
            delivery_city=validated_data.get("city", "Nairobi").strip(),
            delivery_fee=delivery_fee,
            payment_method=validated_data.get("payment_method") or "mpesa",
            customer_notes=validated_data.get("notes", "").strip(),
            status=OrderStatus.PENDING,
            payment_status=PaymentStatus.AWAITING_PAYMENT,
        )
        order.save()

        subtotal = Decimal("0.00")

        # 2. Process line items and snapshot details
        for item_in in items_data:
            product_id = item_in["product_id"]
            qty = int(item_in.get("quantity") or 1)

            # Find matching product from catalog if it exists
            product = None
            try:
                product = Product.objects.filter(id=product_id).first()
            except (ValueError, TypeError):
                # Product id may be slug or mock id
                product = Product.objects.filter(slug=product_id).first()

            # Determine price and snapshot attributes
            if product:
                name_snapshot = product.name
                primary_img = product.images.filter(is_primary=True).first() or product.images.first()
                catalog_img = primary_img.image_url if primary_img else ""
                image_snapshot = (item_in.get("product_image") or "").strip() or catalog_img
                unit_price = product.price

                # Check if variant price override was passed or exists
                passed_price = item_in.get("price")
                if passed_price is not None:
                    unit_price = Decimal(str(passed_price))

                # Decrement stock if product stock is tracked
                if product.stock_quantity > 0:
                    new_stock = max(0, product.stock_quantity - qty)
                    Product.objects.filter(id=product.id).update(stock_quantity=new_stock)
            else:
                # Fallback for demo / custom item
                name_snapshot = item_in.get("product_name") or f"Product #{product_id}"
                image_snapshot = (item_in.get("product_image") or "").strip()
                unit_price = Decimal(str(item_in.get("price") or 0))

            line_total = unit_price * qty
            subtotal += line_total

            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=name_snapshot,
                product_image=image_snapshot,
                selected_size=item_in.get("size") or "",
                selected_color=item_in.get("color") or "",
                selected_length=item_in.get("length"),
                selected_cap_type=item_in.get("cap_type") or "",
                unit_price=unit_price,
                quantity=qty,
                total_price=line_total,
            )

        # 3. Apply discount if valid (e.g. LUXE10 = 10%)
        discount_amount = Decimal("0.00")
        if discount_code == "LUXE10":
            discount_amount = (subtotal * Decimal("0.10")).quantize(Decimal("1.00"))
            order.discount_code = discount_code

        total_amount = max(Decimal("0.00"), subtotal + delivery_fee - discount_amount)

        # 4. Finalize order totals
        order.subtotal = subtotal
        order.discount_amount = discount_amount
        order.total_amount = total_amount
        order.save(update_fields=["subtotal", "discount_code", "discount_amount", "total_amount"])

        return order


def models_stock_decrement(current: int, decrement: int) -> int:
    return max(0, current - decrement)
