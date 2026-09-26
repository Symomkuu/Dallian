"""Dashboard views: staff-only CRUD for categories, hairstyles, products and their images."""

from hashlib import sha256
from time import time
from uuid import uuid4

from django.conf import settings
from django.db.models.deletion import ProtectedError
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from catalog.models import Category, HairStyle, Product, ProductColor, ProductImage, ProductSize
from catalog.serializers import (
    CategoryAdminSerializer,
    HairStyleAdminSerializer,
    ProductAdminSerializer,
    ProductColorAdminSerializer,
    ProductImageAdminSerializer,
    ProductSizeAdminSerializer,
)
from catalog.services import delete_product_image, set_primary_image
from users.permissions import IsStaffRole


def build_cloudinary_signature(payload: dict[str, str | int]) -> str:
    """Return Cloudinary SHA256 signature for sorted payload values."""
    message = "&".join(f"{key}={payload[key]}" for key in sorted(payload) if payload[key] not in [None, ""])
    return sha256(f"{message}{settings.CLOUDINARY_API_SECRET}".encode("utf-8")).hexdigest()


class CloudinaryUploadSignatureView(APIView):
    """Issue signed Cloudinary upload payloads for authenticated staff."""

    permission_classes = [IsStaffRole]

    def post(self, request):
        """Return signed upload values for direct Cloudinary upload."""
        if (
            not getattr(settings, "CLOUDINARY_CLOUD_NAME", None)
            or not getattr(settings, "CLOUDINARY_API_KEY", None)
            or not getattr(settings, "CLOUDINARY_API_SECRET", None)
        ):
            return Response(
                {"detail": "Cloudinary signed uploads are not configured."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        timestamp = int(time())
        folder = "dallian/products"
        public_id = f"product-{uuid4().hex}"
        signature_payload = {
            "folder": folder,
            "public_id": public_id,
            "timestamp": timestamp,
        }
        signature = build_cloudinary_signature(signature_payload)

        return Response(
            {
                "cloud_name": settings.CLOUDINARY_CLOUD_NAME,
                "api_key": settings.CLOUDINARY_API_KEY,
                "timestamp": timestamp,
                "folder": folder,
                "public_id": public_id,
                "signature": signature,
            },
            status=status.HTTP_200_OK,
        )


class ProtectedDestroyMixin:
    """Turn a ProtectedError from delete() into a clean 400 instead of a 500.

    Category and HairStyle use PROTECT on their product foreign keys, so
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


class HairStyleViewSet(ProtectedDestroyMixin, viewsets.ModelViewSet):
    """Full CRUD for hairstyles."""

    queryset = HairStyle.objects.all()
    serializer_class = HairStyleAdminSerializer
    permission_classes = [IsStaffRole]


class ProductViewSet(viewsets.ModelViewSet):
    """Full CRUD for products. The list includes inactive products too."""

    queryset = (
        Product.objects.all()
        .select_related("category", "hairstyle")
        .prefetch_related("images", "colors", "sizes")
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


class ProductColorViewSet(viewsets.ModelViewSet):
    """Manage a product's colors. Filter the list with ?product=<id>."""

    queryset = ProductColor.objects.all()
    serializer_class = ProductColorAdminSerializer
    permission_classes = [IsStaffRole]

    def get_queryset(self):
        """Optionally filter to one product's colors."""
        queryset = super().get_queryset()
        product_id = self.request.query_params.get("product")
        return queryset.filter(product_id=product_id) if product_id else queryset


class ProductSizeViewSet(viewsets.ModelViewSet):
    """Manage a product's sizes. Filter the list with ?product=<id>."""

    queryset = ProductSize.objects.all()
    serializer_class = ProductSizeAdminSerializer
    permission_classes = [IsStaffRole]

    def get_queryset(self):
        """Optionally filter to one product's sizes."""
        queryset = super().get_queryset()
        product_id = self.request.query_params.get("product")
        return queryset.filter(product_id=product_id) if product_id else queryset