"""URL patterns for the users app API endpoints."""

from django.urls import path

from users.views import (
    ChangePasswordView,
    ForgotPasswordView,
    RegisterView,
    ResendVerificationView,
    ResetPasswordView,
    UserMeView,
)
from users.views_cookie_auth import (
    CookieGoogleLoginView,
    CookieTokenObtainPairView,
    CookieTokenRefreshView,
    CookieVerifyOTPView,
    LogoutView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("verify-email/", CookieVerifyOTPView.as_view(), name="verify-email"),
    path("resend-code/", ResendVerificationView.as_view(), name="resend-code"),
    path("login/", CookieTokenObtainPairView.as_view(), name="login"),
    path("google/", CookieGoogleLoginView.as_view(), name="google-login"),
    path("refresh/", CookieTokenRefreshView.as_view(), name="refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("me/", UserMeView.as_view(), name="me"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("password/forgot/", ForgotPasswordView.as_view(), name="password-forgot"),
    path("password/reset/", ResetPasswordView.as_view(), name="password-reset"),
]