"""Blog and News models for Dallian Luxe Hair."""

from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.text import slugify


class BlogCategory(models.Model):
    """Category grouping for blog posts (e.g., Wig Care, Styling Tips, Store News)."""

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Blog Category"
        verbose_name_plural = "Blog Categories"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while BlogCategory.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)


class BlogPost(models.Model):
    """Article / Blog / News story published for visitors and SEO optimization."""

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    excerpt = models.TextField(
        blank=True,
        help_text="Catchy summary shown on cards, social previews, and Google snippets.",
    )
    content = models.TextField(
        help_text="Full post content. Supports Markdown or rich formatting.",
    )
    cover_image = models.URLField(
        max_length=500,
        blank=True,
        help_text="Direct image URL or Cloudinary URL for the banner.",
    )
    category = models.ForeignKey(
        BlogCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="posts",
    )
    tags = models.CharField(
        max_length=255,
        blank=True,
        help_text="Comma-separated keywords/tags (e.g. 'wig care, lace maintenance, nairobi salon').",
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="blog_posts",
    )
    author_name = models.CharField(
        max_length=150,
        default="Dallian Luxe Studio",
        help_text="Display name for author if not linked to a specific user account.",
    )
    is_published = models.BooleanField(
        default=False,
        help_text="Tick to publish live to the storefront.",
    )
    is_featured = models.BooleanField(
        default=False,
        help_text="Tick to highlight as hero / top headline on the Latest News page.",
    )
    published_at = models.DateTimeField(null=True, blank=True)
    read_time_minutes = models.PositiveIntegerField(
        default=3,
        help_text="Estimated minutes to read the article.",
    )
    views_count = models.PositiveIntegerField(
        default=0,
        editable=False,
        help_text="Total page views count.",
    )

    # Search Engine Optimization (SEO)
    meta_title = models.CharField(
        max_length=255,
        blank=True,
        help_text="Custom Google page title. Defaults to post title if left empty.",
    )
    meta_description = models.TextField(
        blank=True,
        help_text="SEO description snippet (recommended 140-160 characters).",
    )
    keywords = models.CharField(
        max_length=255,
        blank=True,
        help_text="Comma-separated SEO target keywords for search crawlers.",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Blog Post"
        verbose_name_plural = "Blog Posts"
        ordering = ["-is_featured", "-published_at", "-created_at"]

    def __str__(self) -> str:
        return self.title

    def save(self, *args, **kwargs):
        # Auto slugify title if not specified, and resolve any duplicate collisions
        if not self.slug:
            base_slug = slugify(self.title) or "post"
        else:
            base_slug = slugify(self.slug) or "post"

        slug = base_slug[:190]
        counter = 1
        while BlogPost.objects.filter(slug=slug).exclude(pk=self.pk).exists():
            slug = f"{base_slug[:185]}-{counter}"
            counter += 1
        self.slug = slug

        # Calculate read time based on 200 words per minute if not set or default
        if self.content:
            word_count = len(self.content.split())
            calc_time = max(1, round(word_count / 200))
            if not self.read_time_minutes or self.read_time_minutes == 3:
                self.read_time_minutes = calc_time

        # Auto-set published_at when published
        if self.is_published and not self.published_at:
            self.published_at = timezone.now()

        # Fallback meta fields from title/excerpt, or sync when title/excerpt was renamed
        # and meta fields were not custom overrides
        if self.pk:
            orig = (
                BlogPost.objects.filter(pk=self.pk)
                .values("title", "meta_title", "excerpt", "meta_description")
                .first()
            )
            if orig:
                if not self.meta_title or self.meta_title == orig["title"]:
                    self.meta_title = self.title
                orig_excerpt_160 = (orig["excerpt"] or "")[:160]
                if not self.meta_description or (orig_excerpt_160 and self.meta_description == orig_excerpt_160):
                    self.meta_description = self.excerpt[:160] if self.excerpt else ""
            else:
                if not self.meta_title:
                    self.meta_title = self.title
                if not self.meta_description and self.excerpt:
                    self.meta_description = self.excerpt[:160]
        else:
            if not self.meta_title:
                self.meta_title = self.title
            if not self.meta_description and self.excerpt:
                self.meta_description = self.excerpt[:160]

        # Enforce single top featured story: only published posts can be featured
        if not self.is_published:
            self.is_featured = False
        elif self.is_featured:
            BlogPost.objects.filter(is_featured=True).exclude(pk=self.pk).update(is_featured=False)

        super().save(*args, **kwargs)
