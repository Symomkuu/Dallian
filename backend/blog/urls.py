"""Public storefront URLs for blog / news."""

from django.urls import path
from blog.views import (
    BlogPostViewCountView,
    PublicBlogCategoryListView,
    PublicBlogPostDetailView,
    PublicBlogPostListView,
)


urlpatterns = [
    path("posts/", PublicBlogPostListView.as_view(), name="blog-posts-list"),
    path("posts/<slug:slug>/", PublicBlogPostDetailView.as_view(), name="blog-post-detail"),
    path("posts/<slug:slug>/view/", BlogPostViewCountView.as_view(), name="blog-post-view-count"),
    path("categories/", PublicBlogCategoryListView.as_view(), name="blog-categories-list"),
]
