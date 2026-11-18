"""Storefront URL patterns for the catalog app (public, read-only)."""

from django.urls import path

from catalog.views import (
    CategoryDetailView,
    CategoryListView,
    HairStyleDetailView,
    HairStyleListView,
    ProductDetailView,
    ProductListView,
    ProductReviewListCreateView,
)

urlpatterns = [
    path("categories/", CategoryListView.as_view(), name="store-categories"),
    path("categories/<slug:slug>/", CategoryDetailView.as_view(), name="store-category-detail"),
    path("hairstyles/", HairStyleListView.as_view(), name="store-hairstyles"),
    path("hairstyles/<slug:slug>/", HairStyleDetailView.as_view(), name="store-hairstyle-detail"),
    path("brands/", HairStyleListView.as_view(), name="store-brands"),
    path("brands/<slug:slug>/", HairStyleDetailView.as_view(), name="store-brand-detail"),
    path("products/", ProductListView.as_view(), name="store-products"),
    path("products/<slug:slug>/", ProductDetailView.as_view(), name="store-product-detail"),
    path("products/<slug:slug>/reviews/", ProductReviewListCreateView.as_view(), name="store-product-reviews"),
]