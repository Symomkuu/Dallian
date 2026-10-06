from rest_framework.routers import SimpleRouter
from blog.views import AdminBlogCategoryViewSet, AdminBlogPostViewSet

router = SimpleRouter()
router.register("categories", AdminBlogCategoryViewSet, basename="dashboard-blog-category")
router.register("", AdminBlogPostViewSet, basename="dashboard-blog-post")

urlpatterns = router.urls
