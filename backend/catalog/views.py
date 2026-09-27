"""Storefront views: public, read-only endpoints for categories, hairstyles and products."""

from decimal import Decimal, InvalidOperation

from django.db.models import Q
from rest_framework import generics
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny

from catalog.models import Category, HairStyle, Product, ProductReview
from catalog.serializers import (
    CategorySerializer,
    HairStyleSerializer,
    ProductDetailSerializer,
    ProductListSerializer,
    ProductReviewSerializer,
)

ORDERING_FIELDS = {
    "newest": "-created_at",
    "price_asc": "price",
    "price_desc": "-price",
    "price-asc": "price",
    "price-desc": "-price",
    "featured": "-is_featured",
    "popular": "-created_at",
}


def _parse_price(value):
    """Return a Decimal for `value`, or None if it isn't a valid price."""
    try:
        return Decimal(value)
    except (InvalidOperation, TypeError):
        return None


class StorefrontPagination(PageNumberPagination):
    """Pagination for public catalog listings."""

    page_size = 24
    page_size_query_param = "page_size"
    max_page_size = 100


class PublicReadOnlyAPIView:
    """Mixin: no login required, and a stale auth cookie can't block a public read."""

    authentication_classes = []
    permission_classes = [AllowAny]


class CategoryListView(PublicReadOnlyAPIView, generics.ListAPIView):
    """List active categories."""

    serializer_class = CategorySerializer
    pagination_class = None
    queryset = Category.objects.filter(is_active=True)


class HairStyleListView(PublicReadOnlyAPIView, generics.ListAPIView):
    """List active hairstyles that have at least one active product."""

    serializer_class = HairStyleSerializer
    pagination_class = None

    def get_queryset(self):
        """Only hairstyles with at least one visible product are worth showing in a filter menu."""
        return HairStyle.objects.filter(is_active=True, products__is_active=True).distinct()


class ProductListView(PublicReadOnlyAPIView, generics.ListAPIView):
    """List active products, with filtering, search and sorting.

    Query params:
      category=<slug>          only products in this category
      hairstyle=<slug>         only products of this hairstyle
      min_price / max_price     price range (inclusive)
      in_stock=true               only products with stock
      q=<text>                      search name, description, sku and hairstyle name
      ordering=newest|price_asc|price_desc   default: newest
    """

    serializer_class = ProductListSerializer
    pagination_class = StorefrontPagination

    def get_queryset(self):
        """Build the filtered, searched and sorted product queryset."""
        params = self.request.query_params
        queryset = (
            Product.objects.filter(is_active=True)
            .select_related("category", "hairstyle")
            .prefetch_related("images", "colors__image", "sizes")
        )

        category_slug = params.get("category")
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)

        hairstyle_slug = params.get("hairstyle") or params.get("brand")
        if hairstyle_slug:
            queryset = queryset.filter(hairstyle__slug=hairstyle_slug)

        min_price = _parse_price(params.get("min_price"))
        if min_price is not None:
            queryset = queryset.filter(price__gte=min_price)

        max_price = _parse_price(params.get("max_price"))
        if max_price is not None:
            queryset = queryset.filter(price__lte=max_price)

        if params.get("in_stock") == "true":
            queryset = queryset.filter(stock_quantity__gt=0)

        featured = params.get("featured") or params.get("is_featured")
        if featured == "true":
            queryset = queryset.filter(is_featured=True)

        color = params.get("color")
        if color:
            queryset = queryset.filter(colors__name__iexact=color, colors__is_active=True)

        size = params.get("size")
        if size:
            queryset = queryset.filter(sizes__name__iexact=size, sizes__is_active=True)

        search = params.get("q")
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(description__icontains=search)
                | Q(sku__icontains=search)
                | Q(hairstyle__name__icontains=search)
            )

        ordering = ORDERING_FIELDS.get(params.get("ordering"), ORDERING_FIELDS["newest"])
        return queryset.order_by(ordering, "-id")


class ProductDetailView(PublicReadOnlyAPIView, generics.RetrieveAPIView):
    """Retrieve one active product by its slug."""

    serializer_class = ProductDetailSerializer
    lookup_field = "slug"

    def get_queryset(self):
        """Only active products are visible on the storefront."""
        return (
            Product.objects.filter(is_active=True)
            .select_related("category", "hairstyle")
            .prefetch_related("images", "colors__image", "sizes", "reviews")
        )


class ProductReviewListCreateView(PublicReadOnlyAPIView, generics.ListCreateAPIView):
    """List published reviews for an active product, or submit a new customer review."""

    serializer_class = ProductReviewSerializer
    pagination_class = None

    def get_queryset(self):
        slug = self.kwargs.get("slug")
        return ProductReview.objects.filter(
            product__slug=slug,
            product__is_active=True,
            is_published=True,
        ).order_by("-created_at")

    def perform_create(self, serializer):
        slug = self.kwargs.get("slug")
        product = generics.get_object_or_404(Product, slug=slug, is_active=True)
        user = self.request.user if getattr(self.request, "user", None) and self.request.user.is_authenticated else None

        author_name = serializer.validated_data.get("author_name")
        if not author_name and user:
            author_name = getattr(user, "full_name", "") or getattr(user, "email", "Verified Customer")

        serializer.save(
            product=product,
            user=user,
            author_name=author_name or "Verified Customer",
            is_published=True,
        )