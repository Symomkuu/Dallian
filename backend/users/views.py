"""Views for the users app: registration, password reset and profile."""

from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from users.models import OTP
from users.serializers import (
    ChangePasswordSerializer,
    EmailSerializer,
    RegisterSerializer,
    ResetPasswordSerializer,
    UserSerializer,
)
from users.services import (
    get_user_by_email,
    send_password_reset_code,
    send_verification_code,
)


class PublicAPIView(APIView):
    """Base for endpoints anyone can call.

    Skips cookie authentication so a stale or expired cookie can't block
    login, signup or verification. Set `throttle_scope` on subclasses.
    """

    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]


class RegisterView(PublicAPIView):
    """Sign up a new customer and email them a verification code."""

    throttle_scope = "otp"

    def post(self, request):
        """Create an unverified customer account and send the code. Returns 201.

        Registration does not log the customer in. They must verify their
        email first (see CookieVerifyOTPView).
        """
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        send_verification_code(user)
        return Response(
            {
                "email": user.email,
                "message": "Account created. Enter the code we emailed you to verify your email.",
            },
            status=status.HTTP_201_CREATED,
        )


class ResendVerificationView(PublicAPIView):
    """Send a new verification code to an account that isn't verified yet."""

    throttle_scope = "otp"

    def post(self, request):
        """Email a fresh code if the account exists, is active and is unverified.

        The answer is the same in every case, so it can't be used to find out
        which emails are registered.
        """
        serializer = EmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = get_user_by_email(serializer.validated_data["email"])
        if user and user.is_active and not user.is_email_verified:
            send_verification_code(user)
        return Response(
            {
                "message": (
                    "If that account exists and isn't verified yet, "
                    "a new code has been sent."
                )
            }
        )


class ForgotPasswordView(PublicAPIView):
    """Start a password reset by emailing the customer a code."""

    throttle_scope = "otp"

    def post(self, request):
        """Email a reset code if the account exists and is active.

        The answer is the same whether or not the account exists, so it can't
        be used to find out which emails are registered.
        """
        serializer = EmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = get_user_by_email(serializer.validated_data["email"])
        if user and user.is_active:
            send_password_reset_code(user)
        return Response(
            {
                "message": (
                    "If your account exists, a password reset code "
                    "has been sent to your email."
                )
            }
        )


class ResetPasswordView(PublicAPIView):
    """Finish a password reset with the emailed code and a new password."""

    throttle_scope = "otp"

    def post(self, request):
        """Set the new password if the code is right. Otherwise return 400.

        An unknown email, a disabled account, a wrong code and an expired code
        all get the same answer. The new password is already checked by the
        serializer, so a weak password doesn't use up the code.
        """
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        user = get_user_by_email(data["email"])
        if (
            user is None
            or not user.is_active
            or not OTP.objects.verify_otp(user, data["code"], OTP.PURPOSE_PASSWORD)
        ):
            return Response(
                {"detail": "Invalid or expired code."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(data["new_password"])
        user.save(update_fields=["password"])
        return Response({"message": "Password updated."})


class UserMeView(generics.RetrieveUpdateAPIView):
    """GET the profile, PATCH to edit name, phone, address and notification settings."""

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "patch", "head", "options"]

    def get_object(self):
        """Return the logged-in customer, so nobody can read or edit another profile."""
        return self.request.user


class ChangePasswordView(APIView):
    """Let a logged-in customer change their password."""

    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

    def post(self, request):
        """Set the new password if the old one is correct and the new one is strong enough."""
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save(update_fields=["password"])
        return Response({"message": "Password updated."})