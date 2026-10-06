from django.db.models import Count
from rest_framework import serializers
from blog.models import BlogCategory, BlogPost


class BatchCategoryCountListSerializer(serializers.ListSerializer):
    """Batches published-post count queries for nested categories across all items in a result page."""

    def to_representation(self, data):
        items = list(data) if not isinstance(data, list) else data
        category_ids = {
            post.category_id
            for post in items
            if getattr(post, "category_id", None)
            and not (
                getattr(post, "category", None)
                and hasattr(post.category, "posts_count")
                and isinstance(post.category.posts_count, int)
            )
        }
        if category_ids:
            counts = dict(
                BlogPost.objects.filter(category_id__in=category_ids, is_published=True)
                .values("category_id")
                .annotate(count=Count("id"))
                .values_list("category_id", "count")
            )
            for post in items:
                cat = getattr(post, "category", None)
                if cat and not (hasattr(cat, "posts_count") and isinstance(cat.posts_count, int)):
                    cat.posts_count = counts.get(post.category_id, 0)
        return super().to_representation(data)


class BlogCategorySerializer(serializers.ModelSerializer):
    posts_count = serializers.SerializerMethodField()

    class Meta:
        model = BlogCategory
        fields = ["id", "name", "slug", "description", "posts_count"]

    def get_posts_count(self, obj) -> int:
        if hasattr(obj, "posts_count") and isinstance(obj.posts_count, int):
            return obj.posts_count
        categories_counts = self.context.get("categories_posts_counts")
        if categories_counts is not None and isinstance(categories_counts, dict) and obj.id in categories_counts:
            return categories_counts[obj.id]
        return obj.posts.filter(is_published=True).count()


class BlogPostListSerializer(serializers.ModelSerializer):
    category = BlogCategorySerializer(read_only=True)

    class Meta:
        model = BlogPost
        list_serializer_class = BatchCategoryCountListSerializer
        fields = [
            "id",
            "title",
            "slug",
            "excerpt",
            "cover_image",
            "category",
            "tags",
            "author_name",
            "is_featured",
            "published_at",
            "read_time_minutes",
            "views_count",
            "created_at",
            "updated_at",
        ]


class BlogPostDetailSerializer(serializers.ModelSerializer):
    category = BlogCategorySerializer(read_only=True)
    related_posts = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            "id",
            "title",
            "slug",
            "excerpt",
            "content",
            "cover_image",
            "category",
            "tags",
            "author_name",
            "is_featured",
            "published_at",
            "read_time_minutes",
            "views_count",
            "meta_title",
            "meta_description",
            "keywords",
            "created_at",
            "updated_at",
            "related_posts",
        ]

    def get_related_posts(self, obj):
        qs = BlogPost.objects.filter(is_published=True).exclude(pk=obj.pk)
        if obj.category:
            cat_qs = qs.filter(category=obj.category)
            if cat_qs.exists():
                posts = list(cat_qs.order_by("-published_at", "-created_at")[:4])
                if len(posts) < 4:
                    existing_ids = [p.pk for p in posts]
                    extra = list(qs.exclude(pk__in=existing_ids).order_by("-published_at", "-created_at")[: 4 - len(posts)])
                    posts.extend(extra)
                return BlogPostListSerializer(posts, many=True).data
        related = qs.order_by("-published_at", "-created_at")[:4]
        return BlogPostListSerializer(related, many=True).data


class AdminBlogPostSerializer(serializers.ModelSerializer):
    """Full read/write serializer used by staff in the Admin Dashboard."""

    category = serializers.PrimaryKeyRelatedField(
        queryset=BlogCategory.objects.all(),
        required=False,
        allow_null=True,
    )
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=BlogCategory.objects.all(),
        source="category",
        required=False,
        allow_null=True,
        write_only=True,
    )
    category_details = BlogCategorySerializer(source="category", read_only=True)

    class Meta:
        model = BlogPost
        list_serializer_class = BatchCategoryCountListSerializer
        fields = [
            "id",
            "title",
            "slug",
            "excerpt",
            "content",
            "cover_image",
            "category",
            "category_id",
            "category_details",
            "tags",
            "author_name",
            "is_published",
            "is_featured",
            "published_at",
            "read_time_minutes",
            "views_count",
            "meta_title",
            "meta_description",
            "keywords",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "views_count", "created_at", "updated_at"]
        extra_kwargs = {
            "slug": {"required": False, "validators": []},
        }

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            validated_data["author"] = request.user
            if not validated_data.get("author_name"):
                validated_data["author_name"] = (
                    request.user.get_full_name() or getattr(request.user, "email", "Dallian Staff")
                )
        return super().create(validated_data)
