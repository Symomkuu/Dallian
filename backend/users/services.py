"""Service helpers: user lookup, OTP emails and Google sign-in."""

import time

from django.conf import settings
from django.core.mail import send_mail
from django.db import IntegrityError, transaction
from google.auth.exceptions import GoogleAuthError
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from users.models import OTP, User

EMAIL_OTP_TTL = 15 * 60
PASSWORD_OTP_TTL = 10 * 60


class GoogleAuthenticationError(Exception):
    """Raised when a Google credential can't be verified."""


def get_user_by_email(email):
    """Return the user with this email (any capitalization), or None if there isn't one."""
    return User.objects.filter(email__iexact=email).first()


def send_otp_email(to_email, subject, body, max_attempts=3):
    """Send an email, retrying on failure. Return True on success, False if every attempt fails.

    Only delivery problems are caught: SMTP errors, DNS failures, timeouts and
    connection errors. Django's SMTP backend raises these, and they all inherit
    from OSError. A mail outage must not break signup or password reset, since
    the customer can request a new code instead. Anything else is a bug in our
    code or settings and is allowed to crash, so it can't hide. The pause
    happens only between attempts (0.5s, then 1s), and each attempt is capped
    by EMAIL_TIMEOUT in settings.
    """
    for attempt in range(1, max_attempts + 1):
        try:
            send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [to_email], fail_silently=False)
            return True
        except OSError:
            if attempt < max_attempts:
                time.sleep(0.5 * attempt)
    return False


def send_verification_code(user):
    """Create a fresh email-verification code for `user` and email it.

    Any older unused verification code is cancelled. Returns True if the email
    was sent.
    """
    otp = OTP.objects.create_otp(user, OTP.PURPOSE_EMAIL, ttl_seconds=EMAIL_OTP_TTL)
    return send_otp_email(
        user.email,
        "Verify your email",
        f"Your Dallian verification code is: {otp.code}\n\nIt expires in 15 minutes.",
    )


def send_password_reset_code(user):
    """Create a fresh password-reset code for `user` and email it.

    Any older unused reset code is cancelled. Returns True if the email was sent.
    """
    otp = OTP.objects.create_otp(user, OTP.PURPOSE_PASSWORD, ttl_seconds=PASSWORD_OTP_TTL)
    return send_otp_email(
        user.email,
        "Password reset code",
        f"Your Dallian password reset code is: {otp.code}\n\nIt expires in 10 minutes.",
    )


def verify_google_credential(credential):
    """Validate a Google ID token and return the person's email and name.

    google-auth checks the signature, expiry, issuer and that the token was
    issued for OUR client ID, so a token meant for another app is rejected.
    Raises GoogleAuthenticationError if the token is invalid, can't be checked,
    or belongs to an email Google hasn't verified.
    """
    if not settings.GOOGLE_CLIENT_ID:
        raise GoogleAuthenticationError("Google sign-in is not configured.")

    try:
        token_data = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=10,
        )
    except ValueError as exc:
        raise GoogleAuthenticationError("Invalid Google credential.") from exc
    except GoogleAuthError as exc:
        # Network-level failures talking to Google
        raise GoogleAuthenticationError("Could not verify the credential with Google.") from exc

    email = (token_data.get("email") or "").strip().lower()
    if not email or not token_data.get("email_verified"):
        raise GoogleAuthenticationError("Your Google account email is not verified.")

    return {
        "email": email,
        "full_name": (token_data.get("name") or email.split("@")[0]).strip(),
    }


def get_or_create_google_user(email, full_name):
    """Return (user, created) for an email Google has confirmed belongs to the caller.

    - New email: a customer is created, verified, with no usable password.
    - Existing verified account: returned untouched (name, password, role stay as they are).
    - Existing UNVERIFIED account: someone may have pre-registered this email with a
      password of their own, so that password is wiped and any pending codes are
      cancelled before the account is marked verified.
    """
    user = get_user_by_email(email)
    created = False

    if user is None:
        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    email=email, full_name=full_name, is_email_verified=True
                )
            created = True
        except IntegrityError:
            user = get_user_by_email(email)

    if not user.is_email_verified:
        with transaction.atomic():
            user.set_unusable_password()
            user.is_email_verified = True
            user.save(update_fields=["password", "is_email_verified"])
            OTP.objects.filter(user=user, is_used=False).update(is_used=True)

    return user, created