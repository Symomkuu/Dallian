"""Views for the blog app: public storefront and staff dashboard."""

from django.db.models import F, Q
from rest_framework import generics, permissions, status, viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from blog.models import BlogCategory, BlogPost
from blog.serializers import (
    AdminBlogPostSerializer,
    BlogCategorySerializer,
    BlogPostDetailSerializer,
    BlogPostListSerializer,
)
from users.permissions import IsStaffRole


class BlogPagination(PageNumberPagination):
    page_size = 9
    page_size_query_param = "page_size"
    max_page_size = 50


# ==========================================
# Public Storefront Views (Read-Only)
# ==========================================


class PublicBlogPostListView(generics.ListAPIView):
    """List published blog posts for visitors with search and category filtering."""

    serializer_class = BlogPostListSerializer
    pagination_class = BlogPagination
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = BlogPost.objects.filter(is_published=True).select_related("category")
        category_slug = self.request.query_params.get("category")
        if category_slug:
            qs = qs.filter(category__slug=category_slug)

        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(title__icontains=search)
                | Q(excerpt__icontains=search)
                | Q(tags__icontains=search)
                | Q(content__icontains=search)
            )

        return qs.order_by("-is_featured", "-published_at", "-created_at")


class PublicBlogPostDetailView(APIView):
    """Retrieve full blog post by slug and increment views count."""

    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        try:
            post = BlogPost.objects.select_related("category").get(slug=slug, is_published=True)
        except BlogPost.DoesNotExist:
            return Response({"detail": "Post not found."}, status=status.HTTP_404_NOT_FOUND)

        # Increment view counter efficiently
        BlogPost.objects.filter(pk=post.pk).update(views_count=F("views_count") + 1)
        post.refresh_from_db(fields=["views_count"])

        serializer = BlogPostDetailSerializer(post, context={"request": request})
        return Response(serializer.data)


class PublicBlogCategoryListView(generics.ListAPIView):
    """List all categories that have published posts."""

    serializer_class = BlogCategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        return BlogCategory.objects.filter(posts__is_published=True).distinct().order_by("name")


# ==========================================
# Staff Dashboard Views (Admin Only)
# ==========================================


class AdminBlogPostViewSet(viewsets.ModelViewSet):
    """Staff CRUD for all blog posts (drafts and published)."""

    queryset = BlogPost.objects.all().select_related("category").order_by("-published_at", "-created_at")
    serializer_class = AdminBlogPostSerializer
    permission_classes = [IsStaffRole]
    pagination_class = BlogPagination

    def get_queryset(self):
        qs = super().get_queryset()
        category_id = self.request.query_params.get("category")
        if category_id:
            qs = qs.filter(category_id=category_id)

        status_filter = self.request.query_params.get("status")
        if status_filter == "published":
            qs = qs.filter(is_published=True)
        elif status_filter == "draft":
            qs = qs.filter(is_published=False)

        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(title__icontains=search)
                | Q(slug__icontains=search)
                | Q(excerpt__icontains=search)
                | Q(tags__icontains=search)
            )
        return qs.order_by("-published_at", "-created_at")


class AdminBlogCategoryViewSet(viewsets.ModelViewSet):
    """Staff CRUD for blog categories."""

    queryset = BlogCategory.objects.all().order_by("name")
    serializer_class = BlogCategorySerializer
    permission_classes = [IsStaffRole]
    pagination_class = None
