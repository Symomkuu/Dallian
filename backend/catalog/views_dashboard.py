"""Dashboard views: staff-only CRUD for categories, brands, products and their images."""

from django.db.models.deletion import ProtectedError
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from catalog.models import Brand, Category, Product, ProductImage
from catalog.serializers import (
    BrandAdminSerializer,
    CategoryAdminSerializer,
    ProductAdminSerializer,
    ProductImageAdminSerializer,
)
from catalog.services import delete_product_image, set_primary_image
from users.permissions import IsStaffRole


class ProtectedDestroyMixin:
    """Turn a ProtectedError from delete() into a clean 400 instead of a 500.

    Category and Brand use PROTECT on their product foreign keys, so
    deleting one that's still in use raises this. The dashboard should show
    a message, not crash.
    """

    protected_error_message = "This item is in use and can't be deleted. Deactivate it instead."

    def destroy(self, request, *args, **kwargs):
        """Delete the object, or return 400 if something still points at it."""
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {"detail": self.protected_error_message}, status=status.HTTP_400_BAD_REQUEST
            )


class CategoryViewSet(ProtectedDestroyMixin, viewsets.ModelViewSet):
    """Full CRUD for categories."""

    queryset = Category.objects.all()
    serializer_class = CategoryAdminSerializer
    permission_classes = [IsStaffRole]


class BrandViewSet(ProtectedDestroyMixin, viewsets.ModelViewSet):
    """Full CRUD for brands."""

    queryset = Brand.objects.all()
    serializer_class = BrandAdminSerializer
    permission_classes = [IsStaffRole]


class ProductViewSet(viewsets.ModelViewSet):
    """Full CRUD for products. The list includes inactive products too."""

    queryset = (
        Product.objects.all().select_related("category", "brand").prefetch_related("images")
    )
    serializer_class = ProductAdminSerializer
    permission_classes = [IsStaffRole]


class ProductImageViewSet(viewsets.ModelViewSet):
    """Manage a product's images. Filter the list with ?product=<id>."""

    queryset = ProductImage.objects.all()
    serializer_class = ProductImageAdminSerializer
    permission_classes = [IsStaffRole]

    def get_queryset(self):
        """Optionally filter to one product's images."""
        queryset = super().get_queryset()
        product_id = self.request.query_params.get("product")
        return queryset.filter(product_id=product_id) if product_id else queryset

    def perform_destroy(self, instance):
        """Delete through the service, so a deleted primary image is replaced."""
        delete_product_image(instance)

    @action(detail=True, methods=["post"], url_path="set-primary")
    def set_primary(self, request, pk=None):  # pylint: disable=unused-argument
        """Make this image its product's primary image."""
        image = self.get_object()
        set_primary_image(image)
        image.refresh_from_db()
        return Response(self.get_serializer(image).data)