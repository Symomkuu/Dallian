"""Cookie-based auth views: login, Google sign-in, verify email, refresh and logout."""

from django.contrib.auth.models import update_last_login
from django.core.exceptions import ObjectDoesNotExist
from django.middleware.csrf import get_token
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from users.cookies import REFRESH_COOKIE, clear_auth_cookies, set_auth_cookies
from users.models import OTP
from users.serializers import (
    GoogleLoginSerializer,
    VerifiedTokenObtainPairSerializer,
    VerifyOTPSerializer,
)
from users.services import get_or_create_google_user, get_user_by_email
from users.views import PublicAPIView


class CookieTokenObtainPairView(TokenObtainPairView):
    """Login. Tokens go into HttpOnly cookies, never into the response body."""

    serializer_class = VerifiedTokenObtainPairSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

    def post(self, request, *args, **kwargs):
        """Check the email and password, then set the auth cookies.

        A wrong password returns 401. A correct password on an unverified
        email returns 403 with the code `email_not_verified`. On success the
        body holds only a message and a CSRF token.
        """
        response = super().post(request, *args, **kwargs)
        set_auth_cookies(
            response,
            access=response.data.get("access"),
            refresh=response.data.get("refresh"),
        )
        response.data = {"message": "Login successful", "csrfToken": get_token(request)}
        return response


class CookieGoogleLoginView(PublicAPIView):
    """Sign in or sign up with Google. Sets the same cookies as a normal login."""

    throttle_scope = "google"

    def post(self, request):
        """Verify the Google credential, then log in or create the customer.

        Returns 201 for a new account and 200 for an existing one, with
        `created` in the body so the frontend can welcome new customers.
        A disabled account gets 403 and no cookies.
        """
        serializer = GoogleLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        google_user = serializer.validated_data["google_user"]

        user, created = get_or_create_google_user(
            google_user["email"], google_user["full_name"]
        )
        if not user.is_active:
            return Response(
                {"detail": "This account has been disabled."},
                status=status.HTTP_403_FORBIDDEN,
            )

        update_last_login(None, user)
        refresh = RefreshToken.for_user(user)
        response = Response(
            {
                "message": "Login successful",
                "created": created,
                "csrfToken": get_token(request),
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )
        set_auth_cookies(response, access=str(refresh.access_token), refresh=str(refresh))
        return response


class CookieVerifyOTPView(PublicAPIView):
    """Verify the email code, then log the customer in."""

    throttle_scope = "otp"

    def post(self, request):
        """Mark the email as verified if the code is right, and set the auth cookies.

        An unknown email, a disabled account, a wrong code and an expired code
        all get the same 400 answer, so nothing is revealed about which emails
        are registered. Keep this message identical to the one in
        ResetPasswordView.
        """
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        user = get_user_by_email(data["email"])
        if (
            user is None
            or not user.is_active
            or not OTP.objects.verify_otp(user, data["code"], OTP.PURPOSE_EMAIL)
        ):
            return Response(
                {"detail": "Invalid or expired code."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_email_verified = True
        user.save(update_fields=["is_email_verified"])

        refresh = RefreshToken.for_user(user)
        response = Response({"message": "Email verified.", "csrfToken": get_token(request)})
        set_auth_cookies(response, access=str(refresh.access_token), refresh=str(refresh))
        return response


class CookieTokenRefreshView(PublicAPIView):
    """Swap the refresh cookie for a new access cookie (and a rotated refresh cookie)."""

    def post(self, request):
        """Issue new cookies from the refresh cookie, or return 401.

        The 401 is returned directly instead of raised, because DRF turns a
        raised 401 into a 403 on views with no authentication classes, and the
        frontend relies on 401 to know it should send the customer to login.
        """
        refresh = request.COOKIES.get(REFRESH_COOKIE)
        if not refresh:
            return Response(
                {"detail": "No refresh token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = TokenRefreshSerializer(data={"refresh": refresh})
        try:
            serializer.is_valid(raise_exception=True)
        except (TokenError, AuthenticationFailed, ObjectDoesNotExist):
            # Expired, blacklisted, or the account is disabled or gone
            response = Response(
                {"detail": "Invalid or expired refresh token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
            clear_auth_cookies(response)
            return response

        response = Response({"message": "Token refreshed", "csrfToken": get_token(request)})
        set_auth_cookies(
            response,
            access=serializer.validated_data["access"],
            refresh=serializer.validated_data.get("refresh"),
        )
        return response


class LogoutView(PublicAPIView):
    """Log out: cancel the refresh token and clear the auth cookies."""

    def post(self, request):
        """Blacklist the refresh token if there is a valid one, and clear both cookies.

        This always returns 200, even when the customer wasn't logged in or
        the token had already expired.
        """
        refresh = request.COOKIES.get(REFRESH_COOKIE)
        if refresh:
            try:
                RefreshToken(refresh).blacklist()
            except TokenError:
                pass  # already expired or blacklisted, nothing more to do
        response = Response({"message": "Logged out"})
        clear_auth_cookies(response)
        return response