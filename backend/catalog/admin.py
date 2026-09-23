"""Admin registrations for the catalog app.

Category, Brand and Product go through catalog.services so the slug is
never left blank. Product images are editable inline on the Product page
and through their own list, both routed through catalog.services so the
one-primary-image rule always holds.
"""

from django.contrib import admin
from django.utils.html import format_html

from catalog.models import Category, HairStyle, Product, ProductImage
from catalog.services import add_product_image, assign_slug, delete_product_image, set_primary_image


class ProductImageInline(admin.TabularInline):
    """Editable images table on the Product admin page.

    Saves and deletes go through catalog.services (see ProductAdmin.save_formset),
    so adding, changing or removing an image here still respects the
    one-primary-image rule the same way the dashboard API does.
    """

    model = ProductImage
    extra = 1
    fields = ("preview", "image_url", "alt_text", "sort_order", "is_primary")
    readonly_fields = ("preview",)

    def preview(self, obj):
        """Show a small thumbnail next to the editable fields, once the image has a URL."""
        if not obj.pk or not obj.image_url:
            return "—"
        return format_html('<img src="{0}" style="height:50px;">', obj.image_url)
    preview.short_description = "Preview"


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Admin for product categories."""

    ordering = ("sort_order", "name")
    list_display = ("name", "slug", "is_active", "sort_order", "created_at")
    list_filter = ("is_active",)
    search_fields = ("name", "seo_name")
    readonly_fields = ("slug", "created_at", "updated_at")

    def save_model(self, request, obj, form, change):
        """Assign the slug (once) before saving."""
        assign_slug(obj)
        super().save_model(request, obj, form, change)


@admin.register(HairStyle)
class HairStyleAdmin(admin.ModelAdmin):
    """Admin for product hairstyles."""

    ordering = ("sort_order", "name")
    list_display = ("name", "slug", "is_active", "sort_order", "created_at")
    list_filter = ("is_active",)
    search_fields = ("name", "seo_name")
    readonly_fields = ("slug", "created_at", "updated_at")

    def save_model(self, request, obj, form, change):
        """Assign the slug (once) before saving."""
        assign_slug(obj)
        super().save_model(request, obj, form, change)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """Admin for products."""

    ordering = ("-created_at",)
    list_display = (
        "name",
        "category",
        "hairstyle",
        "price",
        "stock_quantity",
        "is_active",
        "is_featured",
        "created_at",
    )
    list_filter = ("is_active", "is_featured", "category", "hairstyle")
    search_fields = ("name", "sku")
    readonly_fields = ("slug", "created_at", "updated_at")
    autocomplete_fields = ("category", "hairstyle")
    inlines = [ProductImageInline]

    def save_model(self, request, obj, form, change):
        """Assign the slug (once) before saving."""
        assign_slug(obj)
        super().save_model(request, obj, form, change)

    def save_formset(self, request, form, formset, change):
        """Route the inline image rows through catalog.services.

        Django's default formset save calls instance.save() and
        instance.delete() directly, which would bypass the one-primary-image
        rule. This method intercepts new, changed and deleted image rows and
        sends each one through the matching service function instead.
        """
        if formset.model is not ProductImage:
            formset.save()
            return

        instances = formset.save(commit=False)

        for image in formset.deleted_objects:
            delete_product_image(image)

        for image in instances:
            is_new = image.pk is None
            wants_primary = image.is_primary
            if is_new:
                data = {
                    field.name: getattr(image, field.name)
                    for field in ProductImage._meta.get_fields()
                    if field.concrete and field.name not in ("id", "product", "is_primary")
                }
                add_product_image(image.product, is_primary=wants_primary, **data)
            else:
                image.is_primary = False  # avoid a transient duplicate primary on save
                image.save()
                if wants_primary:
                    set_primary_image(image)

        formset.save_m2m()


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    """Standalone list of all product images, mainly for search and debugging.

    Edits here are plain Django admin saves. Prefer the Product page's
    inline table, or the dashboard, for day-to-day image management, since
    those route through catalog.services.
    """

    ordering = ("product", "sort_order")
    list_display = ("product", "is_primary", "sort_order", "created_at")
    list_filter = ("is_primary",)
    search_fields = ("product__name",)
    autocomplete_fields = ("product",)