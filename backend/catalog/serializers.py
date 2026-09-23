"""Serializers for the catalog app: storefront (read-only) and dashboard (staff) views."""

from rest_framework import serializers

from catalog.models import Category, HairStyle, Product, ProductImage
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


class ProductListSerializer(serializers.ModelSerializer):
    """Product as shown in the storefront list or grid: no description, one image."""

    category = CategorySerializer(read_only=True)
    hairstyle = HairStyleSerializer(read_only=True)
    primary_image = serializers.SerializerMethodField()
    in_stock = serializers.SerializerMethodField()

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
            "is_featured",
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

    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + ("description", "sku", "images")


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


class ProductAdminSerializer(serializers.ModelSerializer):
    """Full product representation for the dashboard."""

    images = ProductImageAdminSerializer(many=True, read_only=True)

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
        """Assign the slug before creating."""
        product = Product(**validated_data)
        assign_slug(product)
        product.save()
        return product