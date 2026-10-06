from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from blog.models import BlogCategory, BlogPost

User = get_user_model()


class BlogTests(TestCase):
    def setUp(self):
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

    def test_public_detail_increments_views(self):
        initial_views = self.published_post.views_count
        url = reverse("blog-post-detail", kwargs={"slug": self.published_post.slug})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.published_post.refresh_from_db()
        self.assertEqual(self.published_post.views_count, initial_views + 1)

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
