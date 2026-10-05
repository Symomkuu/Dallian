"""Serializers for the catalog app: storefront (read-only) and dashboard (staff) views."""

from rest_framework import serializers

from catalog.models import (
    Category,
    HairStyle,
    Product,
    ProductColor,
    ProductImage,
    ProductReview,
    ProductSize,
)
from catalog.services import add_product_image, assign_slug, set_primary_image


# ---------------------------------------------------------------- storefront


class CategorySerializer(serializers.ModelSerializer):
    """Public representation of a category."""

    class Meta:
        model = Category
        fields = ("id", "name", "slug", "image_url")


class HairStyleSerializer(serializers.ModelSerializer):
    """Public representation of a hairstyle."""

    class Meta:
        model = HairStyle
        fields = ("id", "name", "slug", "logo_url")


class ProductImageSerializer(serializers.ModelSerializer):
    """Public representation of one product image."""

    class Meta:
        model = ProductImage
        fields = ("id", "image_url", "alt_text", "is_primary", "sort_order")


class ProductColorSerializer(serializers.ModelSerializer):
    """Public representation of a color variant."""

    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductColor
        fields = (
            "id",
            "name",
            "hex_code",
            "image",
            "image_url",
            "stock_quantity",
            "price",
            "sort_order",
        )

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.image_url
        return obj.image_url or None


class ProductSizeSerializer(serializers.ModelSerializer):
    """Public representation of a size variant."""

    class Meta:
        model = ProductSize
        fields = ("id", "name", "price", "stock_quantity", "sort_order")


class ProductReviewSerializer(serializers.ModelSerializer):
    """Public representation and input for customer reviews."""

    class Meta:
        model = ProductReview
        fields = (
            "id",
            "author_name",
            "location",
            "rating",
            "title",
            "comment",
            "is_verified_buyer",
            "created_at",
        )
        read_only_fields = ("id", "is_verified_buyer", "created_at")


class ProductListSerializer(serializers.ModelSerializer):
    """Product as shown in the storefront list or grid: no description, one image."""

    category = CategorySerializer(read_only=True)
    hairstyle = HairStyleSerializer(read_only=True)
    primary_image = serializers.SerializerMethodField()
    in_stock = serializers.SerializerMethodField()
    colors = ProductColorSerializer(many=True, read_only=True)
    sizes = ProductSizeSerializer(many=True, read_only=True)
    rating = serializers.FloatField(source="average_rating", read_only=True)
    review_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "slug",
            "category",
            "hairstyle",
            "price",
            "previous_price",
            "primary_image",
            "in_stock",
            "stock_quantity",
            "is_featured",
            "rating",
            "review_count",
            "colors",
            "sizes",
        )

    def get_primary_image(self, obj):
        """Return the primary image, or None if the product has no images yet."""
        image = next((img for img in obj.images.all() if img.is_primary), None)
        return ProductImageSerializer(image).data if image else None

    def get_in_stock(self, obj):
        """True when at least one unit is available."""
        return obj.stock_quantity > 0


class ProductDetailSerializer(ProductListSerializer):
    """Product as shown on its own page: adds the description, SKU and full gallery."""

    images = ProductImageSerializer(many=True, read_only=True)
    reviews = serializers.SerializerMethodField()

    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + ("description", "sku", "images", "reviews")

    def get_reviews(self, obj):
        published = obj.reviews.filter(is_published=True).order_by("-created_at")
        return ProductReviewSerializer(published, many=True).data


# ----------------------------------------------------------------- dashboard


class CategoryAdminSerializer(serializers.ModelSerializer):
    """Full category representation for the dashboard. The slug is generated, not typed."""

    class Meta:
        model = Category
        fields = (
            "id",
            "name",
            "slug",
            "image_url",
            "seo_name",
            "seo_description",
            "is_active",
            "sort_order",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "slug", "created_at", "updated_at")

    def create(self, validated_data):
        """Assign the slug before creating."""
        category = Category(**validated_data)
        assign_slug(category)
        category.save()
        return category


class HairStyleAdminSerializer(serializers.ModelSerializer):
    """Full hairstyle representation for the dashboard. The slug is generated, not typed."""

    class Meta:
        model = HairStyle
        fields = (
            "id",
            "name",
            "slug",
            "logo_url",
            "seo_name",
            "seo_description",
            "is_active",
            "sort_order",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "slug", "created_at", "updated_at")

    def create(self, validated_data):
        """Assign the slug before creating."""
        hairstyle = HairStyle(**validated_data)
        assign_slug(hairstyle)
        hairstyle.save()
        return hairstyle


class ProductImageAdminSerializer(serializers.ModelSerializer):
    """Dashboard representation of a product image.

    Creating goes through catalog.services so the primary-image rule is
    respected. To change which image is primary later, POST to the
    `set-primary` action instead of PATCHing is_primary through this
    serializer.
    """

    class Meta:
        model = ProductImage
        fields = (
            "id",
            "product",
            "image_url",
            "public_id",
            "width",
            "height",
            "format",
            "alt_text",
            "sort_order",
            "is_primary",
        )
        read_only_fields = ("id",)

    def create(self, validated_data):
        """Create through the service, so the primary-image rule is respected."""
        is_primary = validated_data.pop("is_primary", False)
        product = validated_data.pop("product")
        return add_product_image(product, is_primary=is_primary, **validated_data)

    def update(self, instance, validated_data):
        """Update everything except is_primary; use the set-primary action for that."""
        validated_data.pop("is_primary", None)
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        return instance


class ProductColorAdminSerializer(serializers.ModelSerializer):
    """Dashboard representation of a product color."""

    class Meta:
        model = ProductColor
        fields = (
            "id",
            "product",
            "name",
            "hex_code",
            "image",
            "image_url",
            "stock_quantity",
            "price",
            "sort_order",
            "is_active",
        )
        read_only_fields = ("id",)
        extra_kwargs = {
            "product": {"required": False},
            "image": {"required": False, "allow_null": True},
            "image_url": {"required": False, "allow_blank": True},
        }


class ProductSizeAdminSerializer(serializers.ModelSerializer):
    """Dashboard representation of a product size."""

    class Meta:
        model = ProductSize
        fields = (
            "id",
            "product",
            "name",
            "price",
            "stock_quantity",
            "sort_order",
            "is_active",
        )
        read_only_fields = ("id",)
        extra_kwargs = {
            "product": {"required": False},
        }


class ProductAdminSerializer(serializers.ModelSerializer):
    """Full product representation for the dashboard."""

    images = ProductImageAdminSerializer(many=True, read_only=True)
    colors = ProductColorAdminSerializer(many=True, required=False)
    sizes = ProductSizeAdminSerializer(many=True, required=False)

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "slug",
            "category",
            "hairstyle",
            "sku",
            "description",
            "price",
            "previous_price",
            "stock_quantity",
            "is_active",
            "is_featured",
            "images",
            "colors",
            "sizes",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "slug", "created_at", "updated_at")

    def validate(self, attrs):
        """previous_price, if set, must be higher than price."""
        price = attrs.get("price", getattr(self.instance, "price", None))
        previous_price = attrs.get(
            "previous_price", getattr(self.instance, "previous_price", None)
        )
        if previous_price is not None and price is not None and previous_price <= price:
            raise serializers.ValidationError({"previous_price": "Must be higher than the price."})
        return attrs

    def create(self, validated_data):
        """Assign the slug and optionally create colors and sizes."""
        colors_data = validated_data.pop("colors", [])
        sizes_data = validated_data.pop("sizes", [])
        product = Product(**validated_data)
        assign_slug(product)
        product.save()

        for c_data in colors_data:
            c_data.pop("product", None)
            ProductColor.objects.create(product=product, **c_data)

        for s_data in sizes_data:
            s_data.pop("product", None)
            ProductSize.objects.create(product=product, **s_data)

        return product

    def update(self, instance, validated_data):
        """Update product and optionally its colors and sizes if provided."""
        colors_data = validated_data.pop("colors", None)
        sizes_data = validated_data.pop("sizes", None)

        product = super().update(instance, validated_data)

        if colors_data is not None:
            product.colors.all().delete()
            for c_data in colors_data:
                c_data.pop("product", None)
                ProductColor.objects.create(product=product, **c_data)

        if sizes_data is not None:
            product.sizes.all().delete()
            for s_data in sizes_data:
                s_data.pop("product", None)
                ProductSize.objects.create(product=product, **s_data)

        return product