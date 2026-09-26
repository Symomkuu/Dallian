"""URL configuration for the orders app."""

from django.urls import path

from orders.views import (
    AdminOrderDetailView,
    AdminOrderListView,
    AdminOrderStatsView,
    CheckoutView,
    CustomerOrdersView,
    GuestOrderTrackView,
    OrderDetailView,
)

urlpatterns = [
    # Storefront & Customer endpoints
    path("checkout/", CheckoutView.as_view(), name="order-checkout"),
    path("my-orders/", CustomerOrdersView.as_view(), name="order-my-orders"),
    path("track/", GuestOrderTrackView.as_view(), name="order-track"),
    path("<str:order_number>/", OrderDetailView.as_view(), name="order-detail"),

    # Staff / Admin Dashboard endpoints
    path("admin/list/", AdminOrderListView.as_view(), name="admin-orders-list"),
    path("admin/stats/", AdminOrderStatsView.as_view(), name="admin-orders-stats"),
    path("admin/<int:id>/", AdminOrderDetailView.as_view(), name="admin-order-detail"),
]
