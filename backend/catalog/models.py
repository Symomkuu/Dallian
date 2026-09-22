"""Catalog models: categories, brands, products and product images.

This file only defines the data. The rules (slugs, primary images) are in services.py.
"""

from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import F, Q
from django.db.models.functions import Lower

SLUG_MAX_LENGTH = 255


class TimeStampedModel(models.Model):
    """Adds created and updated timestamps to a model."""

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class SluggedModel(TimeStampedModel):
    """A named model with a unique, URL-friendly slug.

    The slug is filled in by `catalog.services.assign_slug`, never typed by hand.
    """

    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=SLUG_MAX_LENGTH, unique=True, editable=False)

    class Meta:
        abstract = True

    def __str__(self) -> str:
        return str(self.name)


class Category(SluggedModel):
    """A group of products, such as Lace Front or Bob."""

    image_url = models.URLField(max_length=500, blank=True)
    seo_name = models.CharField(
        max_length=255, blank=True, help_text="Title shown to search engines."
    )
    seo_description = models.TextField(
        blank=True, help_text="Description shown to search engines."
    )
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name_plural = "categories"
        ordering = ["sort_order", "name"]
        constraints = [
            # "Lace Front" and "lace front" count as the same name
            models.UniqueConstraint(Lower("name"), name="unique_category_name_ci"),
        ]


class Brand(SluggedModel):
    """The label a product is sold under. Optional on products."""

    logo_url = models.URLField(max_length=500, blank=True)
    seo_name = models.CharField(
        max_length=255, blank=True, help_text="Title shown to search engines."
    )
    seo_description = models.TextField(
        blank=True, help_text="Description shown to search engines."
    )
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "name"]
        constraints = [
            models.UniqueConstraint(Lower("name"), name="unique_brand_name_ci"),
        ]


class Product(SluggedModel):
    """A wig listed in the shop. Each colour is its own product for now."""

    category = models.ForeignKey(
        Category, on_delete=models.PROTECT, related_name="products"
    )
    brand = models.ForeignKey(
        Brand, on_delete=models.PROTECT, related_name="products", null=True, blank=True
    )

    sku = models.CharField(max_length=64, blank=True)
    description = models.TextField(blank=True)

    price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
        help_text="Selling price in KES.",
    )
    previous_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Price before the discount, for display only. Must be higher than the price.",
    )
    stock_quantity = models.PositiveIntegerField(default=0)

    is_active = models.BooleanField(default=True, help_text="Visible on the storefront.")
    is_featured = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at", "-id"]
        constraints = [
            # Blank SKUs are allowed and can repeat, real ones must be unique
            models.UniqueConstraint(
                fields=["sku"], condition=~Q(sku=""), name="unique_product_sku"
            ),
            models.CheckConstraint(condition=Q(price__gt=0), name="product_price_gt_zero"),
            models.CheckConstraint(
                condition=Q(previous_price__isnull=True) | Q(previous_price__gt=F("price")),
                name="product_previous_price_gt_price",
            ),
        ]
        indexes = [
            models.Index(fields=["is_active", "category", "-created_at"], name="idx_product_category"),
            models.Index(fields=["is_active", "brand", "-created_at"], name="idx_product_brand"),
            models.Index(fields=["is_active", "price"], name="idx_product_price"),
        ]


class ProductImage(TimeStampedModel):
    """One photo in a product's gallery. The file lives on Cloudinary, we store its URL."""

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image_url = models.URLField(max_length=500)
    public_id = models.CharField(max_length=255, blank=True)
    width = models.PositiveIntegerField(null=True, blank=True)
    height = models.PositiveIntegerField(null=True, blank=True)
    format = models.CharField(max_length=20, blank=True)
    alt_text = models.CharField(max_length=255, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_primary = models.BooleanField(default=False)

    class Meta:
        ordering = ["-is_primary", "sort_order", "id"]
        constraints = [
            # At most one primary image per product
            models.UniqueConstraint(
                fields=["product"],
                condition=Q(is_primary=True),
                name="unique_primary_image_per_product",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.product.name} image"