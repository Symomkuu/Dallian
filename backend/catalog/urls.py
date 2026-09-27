"""Storefront URL patterns for the catalog app (public, read-only)."""

from django.urls import path

from catalog.views import (
    CategoryListView,
    HairStyleListView,
    ProductDetailView,
    ProductListView,
    ProductReviewListCreateView,
)

urlpatterns = [
    path("categories/", CategoryListView.as_view(), name="store-categories"),
    path("hairstyles/", HairStyleListView.as_view(), name="store-hairstyles"),
    path("products/", ProductListView.as_view(), name="store-products"),
    path("products/<slug:slug>/", ProductDetailView.as_view(), name="store-product-detail"),
    path("products/<slug:slug>/reviews/", ProductReviewListCreateView.as_view(), name="store-product-reviews"),
]