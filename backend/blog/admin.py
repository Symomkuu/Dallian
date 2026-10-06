from django.contrib import admin
from blog.models import BlogCategory, BlogPost


@admin.register(BlogCategory)
class BlogCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "created_at")
    search_fields = ("name", "description")


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "category",
        "is_published",
        "is_featured",
        "views_count",
        "published_at",
        "created_at",
    )
    list_filter = ("is_published", "is_featured", "category", "created_at")
    search_fields = ("title", "excerpt", "content", "tags", "meta_title")
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ("views_count", "created_at", "updated_at")
    date_hierarchy = "published_at"
