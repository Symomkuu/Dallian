"""Users models: custom User, OTP and their managers."""

import secrets
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.db import models, transaction
from django.utils import timezone


class UserManager(BaseUserManager):
    """Manager for the custom User model."""

    def get_by_natural_key(self, username):
        """Return the user whose email matches `username`, ignoring capitalization.

        Django calls this itself during authenticate(), so it isn't called
        anywhere in our code. The parameter keeps Django's name (`username`),
        but for this project it holds the email, because email is our
        USERNAME_FIELD.
        """
        return self.get(email__iexact=username)

    def create_user(self, email, full_name, password=None, **extra_fields):
        """Create and return a new User. A customer unless told otherwise."""
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email).lower()

        user = self.model(email=email, full_name=full_name, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, full_name="Admin", password=None, **extra_fields):
        """Create a superuser: Django admin access plus dashboard access."""
        extra_fields["is_staff"] = True
        extra_fields["is_superuser"] = True
        extra_fields["is_active"] = True
        extra_fields["is_email_verified"] = True
        extra_fields["role"] = User.ROLE_STAFF
        return self.create_user(email, full_name, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user model that logs in with email."""

    ROLE_CUSTOMER = "customer"
    ROLE_STAFF = "staff"
    ROLE_CHOICES = (
        (ROLE_CUSTOMER, "Customer"),
        (ROLE_STAFF, "Staff"),
    )

    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    role = models.CharField(max_length=16, choices=ROLE_CHOICES, default=ROLE_CUSTOMER)

    phone = models.CharField(max_length=32, blank=True)
    delivery_address = models.CharField(max_length=500, blank=True)
    notify_order_updates = models.BooleanField(default=True)
    notify_promotions_and_deals = models.BooleanField(default=True)

    is_email_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    objects = UserManager()

    def save(self, *args, **kwargs):
        """Lowercase the email before saving, so one address is always stored one way."""
        self.email = self.email.lower()
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return str(self.email)

    def get_full_name(self):
        """Return the customer's full name (used by Django admin)."""
        return self.full_name

    def get_short_name(self):
        """Return a short display name. We only store one name field, so it's the full name."""
        return self.full_name

    @property
    def is_shop_staff(self) -> bool:
        """Can use the dashboard (separate from Django admin access)."""
        return self.role == self.ROLE_STAFF


class OTPManager(models.Manager):
    """Create and verify one-time codes."""

    MAX_ATTEMPTS = 5

    def create_otp(self, user, purpose, ttl_seconds: int = 300):
        """Create an OTP for `user`, cancelling any older unused one for the same purpose."""
        self.filter(user=user, purpose=purpose, is_used=False).update(is_used=True)
        code = f"{secrets.randbelow(10**6):06d}"
        return self.create(
            user=user,
            code=code,
            purpose=purpose,
            expires_at=timezone.now() + timedelta(seconds=ttl_seconds),
        )

    def verify_otp(self, user, code, purpose):
        """Return True and mark the OTP used if the code is right.

        Only the newest unused, unexpired code counts. Wrong guesses are
        counted and the code is burned after MAX_ATTEMPTS, so a 6-digit
        code can't be brute-forced by spreading guesses across IPs.
        """
        with transaction.atomic():
            otp = (
                self.select_for_update()
                .filter(
                    user=user,
                    purpose=purpose,
                    is_used=False,
                    expires_at__gte=timezone.now(),
                )
                .order_by("-created_at")
                .first()
            )
            if otp is None:
                return False
            if otp.code != code:
                otp.attempts += 1
                otp.is_used = otp.attempts >= self.MAX_ATTEMPTS
                otp.save(update_fields=["attempts", "is_used"])
                return False
            otp.is_used = True
            otp.save(update_fields=["is_used"])
            return True


class OTP(models.Model):
    """One-time passcode used for email verification and password resets."""

    PURPOSE_EMAIL = "email_verification"
    PURPOSE_PASSWORD = "password_reset"
    PURPOSE_CHOICES = (
        (PURPOSE_EMAIL, "Email Verification"),
        (PURPOSE_PASSWORD, "Password Reset"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="otps",
    )
    code = models.CharField(max_length=16)
    purpose = models.CharField(max_length=32, choices=PURPOSE_CHOICES)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    attempts = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = OTPManager()

    def __str__(self) -> str:
        return f"OTP({self.purpose}) for {self.user}"