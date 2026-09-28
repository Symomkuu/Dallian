"""Business services for order placement, stock updates, and calculations."""

from decimal import Decimal
from typing import Any, Optional

from django.db import transaction
from django.db.models import F
from collections import defaultdict
from users.models import User

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


def get_unified_customers(
    search_query: str = "",
    customer_type: str = "all",
    ordering: str = "-created_at",
) -> dict[str, Any]:
    """
    Aggregates registered customer accounts and guest checkout customers into a
    unified customer list with order counts, total revenue, and contact details.
    """
    # 1. Fetch all registered customers (excluding staff)
    registered_users = list(
        User.objects.filter(role=User.ROLE_CUSTOMER).order_by("-created_at")
    )
    registered_emails = {u.email.lower(): u for u in registered_users}

    # 2. Fetch all orders with prefetch
    all_orders = list(
        Order.objects.all().order_by("-created_at")
    )

    # Group orders by registered user and by guest email
    user_orders_map = defaultdict(list)
    guest_orders_map = defaultdict(list)

    for order in all_orders:
        email = (order.customer_email or "").strip().lower()
        if order.user_id:
            user_orders_map[order.user_id].append(order)
        elif email in registered_emails:
            # Order placed with registered email even if user FK was null
            reg_user = registered_emails[email]
            user_orders_map[reg_user.id].append(order)
        elif email:
            guest_orders_map[email].append(order)

    customer_list = []

    # Process registered users
    for user in registered_users:
        orders = user_orders_map.get(user.id, [])
        valid_orders = [o for o in orders if o.status != OrderStatus.CANCELLED]
        total_spent = sum(o.total_amount for o in valid_orders)
        latest_order = orders[0] if orders else None

        phone = user.phone or (latest_order.customer_phone if latest_order else "")
        address = user.delivery_address or (latest_order.delivery_address if latest_order else "")
        city = (latest_order.delivery_city if latest_order and latest_order.delivery_city else "Nairobi")

        customer_list.append({
            "id": f"user-{user.id}",
            "user_id": user.id,
            "full_name": user.full_name or (latest_order.customer_name if latest_order else "Customer"),
            "email": user.email,
            "phone": phone,
            "delivery_address": address,
            "city": city,
            "customer_type": "registered",
            "is_registered": True,
            "is_email_verified": user.is_email_verified,
            "orders_count": len(orders),
            "total_spent": float(total_spent),
            "created_at": user.created_at.isoformat(),
            "last_order_at": latest_order.created_at.isoformat() if latest_order else None,
        })

    # Process guest customers
    for email, orders in guest_orders_map.items():
        valid_orders = [o for o in orders if o.status != OrderStatus.CANCELLED]
        total_spent = sum(o.total_amount for o in valid_orders)
        latest_order = orders[0]
        earliest_order = orders[-1]

        customer_list.append({
            "id": f"guest-{abs(hash(email)) % 100000000}",
            "user_id": None,
            "full_name": latest_order.customer_name or "Guest Customer",
            "email": email,
            "phone": latest_order.customer_phone or "",
            "delivery_address": latest_order.delivery_address or "",
            "city": latest_order.delivery_city or "Nairobi",
            "customer_type": "guest",
            "is_registered": False,
            "is_email_verified": False,
            "orders_count": len(orders),
            "total_spent": float(total_spent),
            "created_at": earliest_order.created_at.isoformat(),
            "last_order_at": latest_order.created_at.isoformat(),
        })

    # Overall Global Statistics before query filtering
    total_customers_count = len(customer_list)
    total_registered_count = sum(1 for c in customer_list if c["customer_type"] == "registered")
    total_guest_count = sum(1 for c in customer_list if c["customer_type"] == "guest")
    total_revenue = sum(c["total_spent"] for c in customer_list)
    average_spend = (total_revenue / total_customers_count) if total_customers_count > 0 else 0.0

    filtered_list = customer_list

    # Filter by type (registered / guest)
    if customer_type in ["registered", "guest"]:
        filtered_list = [c for c in filtered_list if c["customer_type"] == customer_type]

    # Filter by search term
    q = search_query.strip().lower()
    if q:
        filtered_list = [
            c for c in filtered_list
            if q in c["full_name"].lower()
            or q in c["email"].lower()
            or q in c["phone"].lower()
            or q in c["delivery_address"].lower()
            or q in c["city"].lower()
        ]

    # Ordering
    def sort_key(item):
        if ordering in ["-total_spent", "total_spent"]:
            return item["total_spent"]
        if ordering in ["-orders_count", "orders_count"]:
            return item["orders_count"]
        if ordering in ["name", "-name"]:
            return item["full_name"].lower()
        if ordering in ["email", "-email"]:
            return item["email"].lower()
        if ordering in ["-last_order_at", "last_order_at"]:
            return item["last_order_at"] or ""
        return item["created_at"]

    reverse = ordering.startswith("-") if ordering else True
    if ordering in ["name", "email"]:
        reverse = False
    filtered_list.sort(key=sort_key, reverse=reverse)

    return {
        "stats": {
            "total_customers": total_customers_count,
            "total_registered": total_registered_count,
            "total_guests": total_guest_count,
            "total_revenue": float(total_revenue),
            "average_spend": float(average_spend),
        },
        "count": len(filtered_list),
        "customers": filtered_list,
    }

