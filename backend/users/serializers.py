"""Serializers for the users app."""
# DRF serializers only implement create() or update() when they save something, so
# pylint's abstract-method warning is a false alarm for every class in this module.
# pylint: disable=abstract-method

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from users.models import User
from users.services import GoogleAuthenticationError, verify_google_credential


class RegisterSerializer(serializers.Serializer):
    """Public signup. It only ever creates customers: `role` is not a field here."""

    full_name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
    phone = serializers.CharField(max_length=32, required=False, allow_blank=True)

    def validate_email(self, value):
        """Reject emails that already belong to a real account.

        A verified, disabled or staff account blocks the email. An unverified
        customer account does not: the new signup replaces it (see `create`).
        """
        existing = User.objects.filter(email__iexact=value).first()
        if existing and (
            existing.is_email_verified
            or not existing.is_active
            or existing.role != User.ROLE_CUSTOMER
        ):
            raise serializers.ValidationError(
                "This email is already registered. Please log in or use a different email."
            )
        return value

    def create(self, validated_data):
        """Delete any unverified customer with this email, then create the new customer."""
        with transaction.atomic():
            User.objects.filter(
                email__iexact=validated_data["email"],
                is_email_verified=False,
                role=User.ROLE_CUSTOMER,
            ).delete()
            return User.objects.create_user(
                email=validated_data["email"],
                full_name=validated_data["full_name"],
                password=validated_data["password"],
                phone=validated_data.get("phone", ""),
            )


class EmailSerializer(serializers.Serializer):
    """An email address on its own (resend code, forgot password)."""

    email = serializers.EmailField()


class VerifyOTPSerializer(serializers.Serializer):
    """An email and the 6-digit code sent to it (email verification)."""

    email = serializers.EmailField()
    code = serializers.CharField(max_length=16)


class ResetPasswordSerializer(serializers.Serializer):
    """An email, the code sent to it, and the new password.

    The password is checked here, before the view consumes the code, so a weak
    password doesn't burn a valid code.
    """

    email = serializers.EmailField()
    code = serializers.CharField(max_length=16)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])


class ChangePasswordSerializer(serializers.Serializer):
    """Old and new password for a logged-in customer. Needs `request` in the context."""

    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        """Check the old password, then check the new one against Django's password rules."""
        user = self.context["request"].user
        if not user.check_password(attrs["old_password"]):
            raise serializers.ValidationError({"old_password": "Current password is incorrect."})
        try:
            validate_password(attrs["new_password"], user=user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"new_password": list(exc.messages)}) from exc
        return attrs


class UserSerializer(serializers.ModelSerializer):
    """Profile for `me/`. Role and verification status can't be edited through it."""

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "full_name",
            "role",
            "phone",
            "delivery_address",
            "notify_order_updates",
            "notify_promotions_and_deals",
            "is_email_verified",
            "created_at",
        )
        read_only_fields = ("id", "email", "role", "is_email_verified", "created_at")


class VerifiedTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Login: the password is checked first, then whether the email is verified."""

    default_error_messages = {
        **TokenObtainPairSerializer.default_error_messages,
        "no_active_account": "Incorrect email or password. Please try again.",
    }

    def validate(self, attrs):
        """Return the tokens, or raise 403 `email_not_verified` for an unverified email.

        A wrong password or a disabled account fails first with a 401, so the
        verification status is never revealed to someone without the password.
        """
        data = super().validate(attrs)
        if not self.user.is_email_verified:
            raise PermissionDenied(
                {
                    "detail": "Please verify your email before logging in.",
                    "code": "email_not_verified",
                }
            )
        return data


class GoogleLoginSerializer(serializers.Serializer):
    """Only a Google credential.

    There is no role field, so Google sign-in can only ever create customers.
    """

    credential = serializers.CharField(write_only=True)

    def validate(self, attrs):
        """Verify the credential with Google and store the result as `google_user`."""
        try:
            attrs["google_user"] = verify_google_credential(attrs["credential"])
        except GoogleAuthenticationError as exc:
            raise serializers.ValidationError({"detail": str(exc)}) from exc
        return attrs