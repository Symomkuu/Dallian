from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from blog.models import BlogCategory, BlogPost

User = get_user_model()


class BlogTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.staff_user = User.objects.create_user(
            email="staff@dallian.com",
            full_name="Staff Member",
            password="password123",
            role="staff",
        )
        self.regular_user = User.objects.create_user(
            email="client@dallian.com",
            full_name="Client Customer",
            password="password123",
            role="customer",
        )
        self.category = BlogCategory.objects.create(name="Wig Care")
        self.published_post = BlogPost.objects.create(
            title="How to Wash HD Lace Wigs",
            content="Step 1: Use lukewarm water.\nStep 2: Apply gentle shampoo.",
            excerpt="A great guide to washing wigs.",
            category=self.category,
            is_published=True,
        )
        self.draft_post = BlogPost.objects.create(
            title="Draft Secrets for Body Wave",
            content="Coming soon...",
            category=self.category,
            is_published=False,
        )

    def test_post_auto_slug_and_read_time(self):
        self.assertTrue(self.published_post.slug.startswith("how-to-wash-hd-lace-wigs"))
        self.assertGreaterEqual(self.published_post.read_time_minutes, 1)
        self.assertIsNotNone(self.published_post.published_at)

    def test_public_list_shows_only_published(self):
        url = reverse("blog-posts-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get("results", response.data)
        slugs = [p["slug"] for p in results]
        self.assertIn(self.published_post.slug, slugs)
        self.assertNotIn(self.draft_post.slug, slugs)

    def test_public_list_filters_by_category(self):
        cat2 = BlogCategory.objects.create(name="Styling Tips")
        post2 = BlogPost.objects.create(
            title="Heat Styling Secrets",
            content="Use heat protectant spray.",
            category=cat2,
            is_published=True,
        )
        url = reverse("blog-posts-list")
        # Filter by slug
        res_slug = self.client.get(f"{url}?category={self.category.slug}")
        self.assertEqual(res_slug.status_code, status.HTTP_200_OK)
        slugs_by_cat = [p["slug"] for p in res_slug.data["results"]]
        self.assertIn(self.published_post.slug, slugs_by_cat)
        self.assertNotIn(post2.slug, slugs_by_cat)

        # Filter by ID
        res_id = self.client.get(f"{url}?category={cat2.id}")
        self.assertEqual(res_id.status_code, status.HTTP_200_OK)
        slugs_by_id = [p["slug"] for p in res_id.data["results"]]
        self.assertIn(post2.slug, slugs_by_id)
        self.assertNotIn(self.published_post.slug, slugs_by_id)

    def test_public_list_query_count_avoids_n_plus_one(self):
        """Verify serializing multiple posts with categories does not issue an N+1 query."""
        cat2 = BlogCategory.objects.create(name="Lace Melting")
        for i in range(10):
            BlogPost.objects.create(
                title=f"Lace Melting Tip {i}",
                content="Tip details",
                category=cat2 if i % 2 == 0 else self.category,
                is_published=True,
            )


        url = reverse("blog-posts-list")
        # Queries: 1 count for pagination, 1 select posts with select_related category, 1 batch category counts
        with self.assertNumQueries(3):
            res = self.client.get(f"{url}?page_size=20")
            self.assertEqual(res.status_code, status.HTTP_200_OK)
            self.assertEqual(len(res.data["results"]), 11)
            for item in res.data["results"]:
                self.assertIn("posts_count", item["category"])
                self.assertGreater(item["category"]["posts_count"], 0)

    def test_public_detail_and_view_tracking(self):
        initial_views = self.published_post.views_count
        detail_url = reverse("blog-post-detail", kwargs={"slug": self.published_post.slug})
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.published_post.refresh_from_db()
        # GET should be pure/cacheable and not mutate view count
        self.assertEqual(self.published_post.views_count, initial_views)

        # POST increments view count on real reader visits
        view_url = reverse("blog-post-view-count", kwargs={"slug": self.published_post.slug})
        view_res = self.client.post(view_url)
        self.assertEqual(view_res.status_code, status.HTTP_200_OK)
        self.assertEqual(view_res.data["status"], "view_counted")
        self.published_post.refresh_from_db()
        self.assertEqual(self.published_post.views_count, initial_views + 1)

        # Immediate repeat POST from the same visitor is deduplicated
        view_res2 = self.client.post(view_url)
        self.assertEqual(view_res2.status_code, status.HTTP_200_OK)
        self.assertEqual(view_res2.data["status"], "already_counted")
        self.published_post.refresh_from_db()
        self.assertEqual(self.published_post.views_count, initial_views + 1)

    def test_search_length_and_predicates(self):
        url = reverse("blog-posts-list")
        # 1-char search ignored (returns full list)
        res1 = self.client.get(f"{url}?search=a")
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res1.data["results"]), 1)

        # Matching title keyword (>=2 chars)
        res2 = self.client.get(f"{url}?search=Wash")
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res2.data["results"]), 1)

        # Non-matching keyword
        res3 = self.client.get(f"{url}?search=Nonexistent")
        self.assertEqual(res3.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res3.data["results"]), 0)

    def test_staff_dashboard_permissions(self):
        url = reverse("dashboard-blog-post-list")

        # Anonymous cannot access
        resp_anon = self.client.get(url)
        self.assertEqual(resp_anon.status_code, status.HTTP_401_UNAUTHORIZED)

        # Regular customer cannot access
        self.client.force_authenticate(user=self.regular_user)
        resp_customer = self.client.get(url)
        self.assertEqual(resp_customer.status_code, status.HTTP_403_FORBIDDEN)

        # Staff user can access and see both published & drafts
        self.client.force_authenticate(user=self.staff_user)
        resp_staff = self.client.get(url)
        self.assertEqual(resp_staff.status_code, status.HTTP_200_OK)
        self.assertEqual(resp_staff.data["count"], 2)

    def test_create_post_with_category_id(self):
        """Verify submitting category_id correctly links the category."""
        self.client.force_authenticate(user=self.staff_user)
        url = reverse("dashboard-blog-post-list")
        payload = {
            "title": "Frontal Installation 101",
            "content": "Tips on glue application.",
            "category_id": self.category.id,
            "is_published": True,
        }
        res = self.client.post(url, payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        new_post = BlogPost.objects.get(id=res.data["id"])
        self.assertEqual(new_post.category, self.category)
        self.assertEqual(res.data["category"], self.category.id)
        self.assertEqual(res.data["category_details"]["id"], self.category.id)

    def test_duplicate_title_slug_collision_resolution(self):
        """Verify creating a second post with identical title auto-resolves slug without crashing."""
        self.client.force_authenticate(user=self.staff_user)
        url = reverse("dashboard-blog-post-list")
        payload = {
            "title": self.published_post.title,
            "slug": self.published_post.slug,
            "content": "Duplicate content.",
            "is_published": False,
        }
        res = self.client.post(url, payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertNotEqual(res.data["slug"], self.published_post.slug)
        self.assertTrue(res.data["slug"].startswith(self.published_post.slug))

    def test_featuring_draft_does_not_unfeature_live_story(self):
        """A draft cannot be featured, and does not unfeature published hero story."""
        self.published_post.is_featured = True
        self.published_post.save()
        self.published_post.refresh_from_db()
        self.assertTrue(self.published_post.is_featured)

        # Try to feature a draft
        self.draft_post.is_featured = True
        self.draft_post.save()
        self.draft_post.refresh_from_db()
        self.assertFalse(self.draft_post.is_featured)

        # Published post remains featured
        self.published_post.refresh_from_db()
        self.assertTrue(self.published_post.is_featured)

    def test_blog_stats_action(self):
        self.client.force_authenticate(user=self.staff_user)
        url = reverse("dashboard-blog-post-stats")
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["total"], 2)
        self.assertEqual(res.data["published"], 1)
        self.assertEqual(res.data["draft"], 1)

    def test_post_rename_updates_meta_title_and_description_when_default(self):
        post = BlogPost.objects.create(
            title="Original Title",
            excerpt="Original Excerpt",
            content="Some test content.",
            category=self.category,
        )
        self.assertEqual(post.meta_title, "Original Title")
        self.assertEqual(post.meta_description, "Original Excerpt")

        # Renaming title and excerpt without custom overrides updates meta fields
        post.title = "Renamed Title"
        post.excerpt = "Renamed Excerpt"
        post.save()
        post.refresh_from_db()
        self.assertEqual(post.meta_title, "Renamed Title")
        self.assertEqual(post.meta_description, "Renamed Excerpt")

    def test_post_rename_preserves_custom_meta_title_and_description(self):
        post = BlogPost.objects.create(
            title="Original Title",
            meta_title="Custom SEO Title",
            excerpt="Original Excerpt",
            meta_description="Custom SEO Description",
            content="Some test content.",
            category=self.category,
        )
        self.assertEqual(post.meta_title, "Custom SEO Title")
        self.assertEqual(post.meta_description, "Custom SEO Description")

        # Renaming title and excerpt preserves custom SEO fields
        post.title = "Renamed Title"
        post.excerpt = "Renamed Excerpt"
        post.save()
        post.refresh_from_db()
        self.assertEqual(post.meta_title, "Custom SEO Title")
        self.assertEqual(post.meta_description, "Custom SEO Description")

