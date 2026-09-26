"""Unit and integration tests for the orders app and checkout endpoints."""

from decimal import Decimal
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from catalog.models import Category, Product
from catalog.services import create_category, create_product
from orders.models import Order, OrderStatus
from users.cookies import ACCESS_COOKIE
from users.jwt_tokens import create_token_pair

User = get_user_model()


class CheckoutTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.category = create_category({"name": "Human Hair Wigs"})
        self.product = create_product({
            "name": "Luxury Silk Straight",
            "category_id": self.category.id,
            "price": Decimal("25000.00"),
            "stock_quantity": 10,
            "sku": "WIG-TEST-001",
        })
        self.user = User.objects.create_user(
            email="jane@example.com",
            password="StrongPassword123!",
            full_name="Jane Doe",
            is_active=True,
        )

    def _sample_payload(self):
        return {
            "customer_name": "Amina Mwangi",
            "customer_email": "amina@example.com",
            "customer_phone": "+254712345678",
            "shipping_address": "Kilimani, Argwings Kodhek Rd, Apt 4B",
            "city": "Nairobi",
            "payment_method": "mpesa",
            "items": [
                {
                    "product_id": self.product.id,
                    "product_name": self.product.name,
                    "unit_price": "25000.00",
                    "quantity": 2,
                    "selected_options": {"length": "24 inch", "cap_size": "Medium"},
                }
            ],
        }

    def test_guest_checkout_succeeds(self):
        """Guests can place an order without any session cookie or CSRF token."""
        response = self.client.post(
            "/api/orders/checkout/",
            self._sample_payload(),
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("order_number", response.data)
        self.assertEqual(response.data["customer_name"], "Amina Mwangi")
        self.assertEqual(response.data["status"], OrderStatus.PENDING)

        # Inventory was decremented from 10 to 8
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_quantity, 8)

    def test_authenticated_checkout_links_user(self):
        """Authenticated users have their orders linked to their User account."""
        access_token, _ = create_token_pair(self.user)
        self.client.cookies[ACCESS_COOKIE] = access_token

        # Get CSRF token
        csrf_resp = self.client.get("/api/auth/csrf/")
        csrf_token = csrf_resp.data["csrfToken"]

        payload = self._sample_payload()
        response = self.client.post(
            "/api/orders/checkout/",
            payload,
            format="json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        order = Order.objects.get(order_number=response.data["order_number"])
        self.assertEqual(order.user, self.user)

    def test_cookie_without_csrf_does_not_403(self):
        """If a user has an auth cookie but CSRF is missing or mismatched during checkout,
        it does NOT return 403 Forbidden; it safely processes as a guest order."""
        access_token, _ = create_token_pair(self.user)
        self.client.cookies[ACCESS_COOKIE] = access_token

        payload = self._sample_payload()
        # No HTTP_X_CSRFTOKEN sent!
        response = self.client.post(
            "/api/orders/checkout/",
            payload,
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("order_number", response.data)

    def test_csrf_endpoints(self):
        """Verify /api/auth/csrf/ and /api/auth/me/ return csrfToken."""
        # 1. /api/auth/csrf/
        resp = self.client.get("/api/auth/csrf/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("csrfToken", resp.data)

        # 2. /api/auth/me/
        access_token, _ = create_token_pair(self.user)
        self.client.cookies[ACCESS_COOKIE] = access_token
        me_resp = self.client.get("/api/auth/me/")
        self.assertEqual(me_resp.status_code, status.HTTP_200_OK)
        self.assertIn("csrfToken", me_resp.data)
