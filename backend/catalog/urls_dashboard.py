"""Dashboard URL patterns for the catalog app (staff only)."""

from django.urls import path
from rest_framework.routers import DefaultRouter

from catalog.views_dashboard import (
    CategoryViewSet,
    CloudinaryUploadSignatureView,
    HairStyleViewSet,
    ProductColorViewSet,
    ProductImageViewSet,
    ProductSizeViewSet,
    ProductViewSet,
)

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="dashboard-category")
router.register("hairstyles", HairStyleViewSet, basename="dashboard-hairstyle")
router.register("products", ProductViewSet, basename="dashboard-product")
router.register("product-images", ProductImageViewSet, basename="dashboard-product-image")
router.register("product-colors", ProductColorViewSet, basename="dashboard-product-color")
router.register("product-sizes", ProductSizeViewSet, basename="dashboard-product-size")

urlpatterns = [
    path(
        "media/upload-signature/",
        CloudinaryUploadSignatureView.as_view(),
        name="dashboard-cloudinary-upload-signature",
    ),
] + router.urls