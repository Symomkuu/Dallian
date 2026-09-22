"""Dashboard URL patterns for the catalog app (staff only)."""

from rest_framework.routers import DefaultRouter

from catalog.views_dashboard import (
    BrandViewSet,
    CategoryViewSet,
    ProductImageViewSet,
    ProductViewSet,
)

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="dashboard-category")
router.register("brands", BrandViewSet, basename="dashboard-brand")
router.register("products", ProductViewSet, basename="dashboard-product")
router.register("product-images", ProductImageViewSet, basename="dashboard-product-image")

urlpatterns = router.urls