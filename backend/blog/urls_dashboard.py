"""Staff Dashboard URLs for managing blogs and categories."""

from rest_framework.routers import DefaultRouter
from blog.views import AdminBlogCategoryViewSet, AdminBlogPostViewSet

router = DefaultRouter()
router.register("categories", AdminBlogCategoryViewSet, basename="dashboard-blog-category")
router.register("", AdminBlogPostViewSet, basename="dashboard-blog-post")

urlpatterns = router.urls
