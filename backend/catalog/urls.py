"""Storefront URL patterns for the catalog app (public, read-only)."""

from django.urls import path

from catalog.views import BrandListView, CategoryListView, ProductDetailView, ProductListView

urlpatterns = [
    path("categories/", CategoryListView.as_view(), name="store-categories"),
    path("brands/", BrandListView.as_view(), name="store-brands"),
    path("products/", ProductListView.as_view(), name="store-products"),
    path("products/<slug:slug>/", ProductDetailView.as_view(), name="store-product-detail"),
]