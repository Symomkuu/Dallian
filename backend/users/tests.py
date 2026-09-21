"""Database-backed tests for the users app.

Requests go through the real URLs, serializers, views and an in-memory
SQLite database. The only thing faked is Google's token verification.

Run with:  python manage.py test users
"""

import re
from datetime import timedelta
from unittest.mock import patch

from django.core import mail
from django.core.cache import cache
from django.db import IntegrityError, transaction
from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient, APITestCase
from rest_framework.throttling import SimpleRateThrottle

from users.cookies import ACCESS_COOKIE, REFRESH_COOKIE
from users.models import OTP, User


PASSWORD = "S3cure!Pass99"
NEW_PASSWORD = "N3w!Secure#Pass7"
EMAIL = "ann@example.com"


GOOGLE_VERIFY = "users.services.id_token.verify_oauth2_token"
GOOGLE_TOKEN = {"email": "Gina@Example.com", "email_verified": True, "name": "Gina Google"}
GOOGLE_EMAIL = "gina@example.com"


def make_user(email=EMAIL, password=PASSWORD, verified=True, **extra):
    """Create a user directly in the database (skips the API)."""
    return User.objects.create_user(
        email=email,
        full_name=extra.pop("full_name", "Ann Customer"),
        password=password,
        is_email_verified=verified,
        **extra,
    )


def last_code():
    """Return the 6-digit code from the most recently sent email."""
    return re.search(r"\b(\d{6})\b", mail.outbox[-1].body).group(1)


class AuthTestCase(APITestCase):
    """Base class: clean throttle counters, and generous rate limits by default."""

    def setUp(self):
        """Clear the throttle cache and raise the rate limits for this test."""
        cache.clear()
        rates = patch.object(
            SimpleRateThrottle,
            "THROTTLE_RATES",
            {"login": "1000/minute", "otp": "1000/minute", "google": "1000/minute"},
        )
        rates.start()
        self.addCleanup(rates.stop)

    def post(self, name, data=None, client=None, **extra):
        """POST JSON to the URL called `name`, using `client` or the default test client."""
        return (client or self.client).post(reverse(name), data or {}, format="json", **extra)

    def register(self, **overrides):
        """Register the default customer, with any field overridden."""
        payload = {"full_name": "Ann Customer", "email": EMAIL, "password": PASSWORD, **overrides}
        return self.post("register", payload)

    def verify(self, code, email=EMAIL):
        """Submit an email verification code."""
        return self.post("verify-email", {"email": email, "code": code})

    def login(self, email=EMAIL, password=PASSWORD, client=None):
        """Log in with an email and password."""
        return self.post("login", {"email": email, "password": password}, client=client)


# ---------------------------------------------------------------- models


class UserModelTests(TestCase):
    """The User model and its manager."""

    def test_create_user_defaults_to_unverified_customer(self):
        """A new user is an unverified customer with no staff or superuser rights."""
        user = User.objects.create_user("Ann@Example.com", "Ann", password=PASSWORD)
        self.assertEqual(user.email, "ann@example.com")
        self.assertEqual(user.role, User.ROLE_CUSTOMER)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertFalse(user.is_email_verified)

    def test_no_password_means_unusable_password(self):
        """A user created without a password can't log in with one."""
        user = User.objects.create_user("g@example.com", "G")
        self.assertFalse(user.has_usable_password())

    def test_create_superuser_gets_staff_role_and_is_verified(self):
        """A superuser gets the staff role and a verified email."""
        admin = User.objects.create_superuser("boss@example.com", password=PASSWORD)
        self.assertEqual(admin.role, User.ROLE_STAFF)
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)
        self.assertTrue(admin.is_email_verified)

    def test_email_lookup_is_case_insensitive(self):
        """Django's natural-key lookup ignores email capitalization."""
        user = make_user()
        self.assertEqual(User.objects.get_by_natural_key("ANN@EXAMPLE.COM"), user)

    def test_save_lowercases_email(self):
        """Saving a user stores the email in lowercase."""
        user = make_user()
        user.email = "MIXED@Example.com"
        user.save()
        user.refresh_from_db()
        self.assertEqual(user.email, "mixed@example.com")

    def test_emails_differing_only_in_case_are_duplicates(self):
        """The database rejects a second account whose email differs only in case."""
        make_user()
        with self.assertRaises(IntegrityError), transaction.atomic():
            make_user(email="ANN@example.com")

    def test_is_shop_staff_follows_role(self):
        """`is_shop_staff` is true only for the staff role."""
        self.assertFalse(make_user().is_shop_staff)
        self.assertTrue(make_user("staff@example.com", role=User.ROLE_STAFF).is_shop_staff)


class OTPModelTests(TestCase):
    """One-time codes: creating, expiring and verifying them."""

    def setUp(self):
        """Create an unverified user to own the codes."""
        self.user = make_user(verified=False)

    def verify(self, code, purpose=OTP.PURPOSE_EMAIL):
        """Check `code` for this test's user."""
        return OTP.objects.verify_otp(self.user, code, purpose)

    def test_new_code_cancels_older_one(self):
        """Creating a code marks the previous unused one as used."""
        old = OTP.objects.create_otp(self.user, OTP.PURPOSE_EMAIL)
        new = OTP.objects.create_otp(self.user, OTP.PURPOSE_EMAIL)
        old.refresh_from_db()
        self.assertTrue(old.is_used)
        self.assertFalse(new.is_used)

    def test_code_burns_after_max_wrong_attempts(self):
        """After MAX_ATTEMPTS wrong guesses even the right code stops working."""
        otp = OTP.objects.create_otp(self.user, OTP.PURPOSE_EMAIL)
        wrong = "000000" if otp.code != "000000" else "111111"
        for _ in range(OTP.objects.MAX_ATTEMPTS):
            self.assertFalse(self.verify(wrong))
        self.assertFalse(self.verify(otp.code))

    def test_code_works_only_once(self):
        """A correct code is accepted the first time and rejected after that."""
        otp = OTP.objects.create_otp(self.user, OTP.PURPOSE_EMAIL)
        self.assertTrue(self.verify(otp.code))
        self.assertFalse(self.verify(otp.code))

    def test_expired_code_is_rejected(self):
        """A code past its expiry time is rejected."""
        otp = OTP.objects.create_otp(self.user, OTP.PURPOSE_EMAIL)
        otp.expires_at = timezone.now() - timedelta(minutes=1)
        otp.save()
        self.assertFalse(self.verify(otp.code))

    def test_code_only_works_for_its_own_purpose(self):
        """A password-reset code can't be used as an email-verification code."""
        otp = OTP.objects.create_otp(self.user, OTP.PURPOSE_PASSWORD)
        self.assertFalse(self.verify(otp.code, purpose=OTP.PURPOSE_EMAIL))


# ---------------------------------------------------------- registration


class RegistrationTests(AuthTestCase):
    """Public signup."""

    def test_creates_unverified_customer_and_emails_a_code(self):
        """Signup creates an unverified account, emails a code and sets no cookies."""
        resp = self.register(email="Ann@Example.com")
        self.assertEqual(resp.status_code, 201)
        user = User.objects.get(email=EMAIL)
        self.assertFalse(user.is_email_verified)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, [EMAIL])
        self.assertNotIn(ACCESS_COOKIE, resp.cookies)  # no login until verified

    def test_cannot_register_as_staff_or_superuser(self):
        """`role`, `is_staff` and `is_superuser` in the request are ignored."""
        resp = self.register(role="staff", is_staff=True, is_superuser=True)
        self.assertEqual(resp.status_code, 201)
        user = User.objects.get(email=EMAIL)
        self.assertEqual(user.role, User.ROLE_CUSTOMER)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_weak_password_is_rejected(self):
        """A password that fails Django's validators is rejected and no user is created."""
        resp = self.register(password="password")
        self.assertEqual(resp.status_code, 400)
        self.assertIn("password", resp.data)
        self.assertFalse(User.objects.exists())

    def test_verified_email_is_taken_in_any_capitalization(self):
        """A verified account blocks the email, however it is capitalized."""
        make_user()
        self.assertEqual(self.register(email="ANN@example.com").status_code, 400)

    def test_new_signup_replaces_unverified_account(self):
        """Signing up again over an unverified account replaces it."""
        make_user(verified=False, password="Old!Passw0rd#1")
        self.assertEqual(self.register().status_code, 201)
        self.assertEqual(User.objects.filter(email__iexact=EMAIL).count(), 1)
        self.assertTrue(User.objects.get(email=EMAIL).check_password(PASSWORD))

    def test_unverified_staff_account_is_never_replaced(self):
        """Signup can't overwrite a staff account, even an unverified one."""
        make_user(verified=False, role=User.ROLE_STAFF)
        self.assertEqual(self.register().status_code, 400)
        self.assertEqual(User.objects.get(email=EMAIL).role, User.ROLE_STAFF)

    def test_disabled_account_is_never_replaced(self):
        """Signup can't overwrite a disabled account, even an unverified one."""
        make_user(verified=False, is_active=False)
        self.assertEqual(self.register().status_code, 400)


# ---------------------------------------------------- email verification


class EmailVerificationTests(AuthTestCase):
    """Verifying an email with the emailed code."""

    def test_correct_code_verifies_and_logs_in(self):
        """A correct code verifies the email and sets the auth cookies."""
        self.register()
        resp = self.verify(last_code())
        self.assertEqual(resp.status_code, 200)
        self.assertIn(ACCESS_COOKIE, resp.cookies)
        self.assertIn(REFRESH_COOKIE, resp.cookies)
        self.assertIn("csrfToken", resp.data)
        self.assertTrue(User.objects.get(email=EMAIL).is_email_verified)
        self.assertEqual(self.client.get(reverse("me")).status_code, 200)

    def test_wrong_code_and_unknown_email_look_identical(self):
        """A wrong code and an unknown email get the same answer."""
        self.register()
        wrong_code = self.verify("000000" if last_code() != "000000" else "111111")
        unknown = self.verify("123456", email="nobody@example.com")
        self.assertEqual(wrong_code.status_code, 400)
        self.assertEqual(unknown.status_code, 400)
        self.assertEqual(wrong_code.data, unknown.data)

    def test_code_is_burned_after_five_wrong_guesses(self):
        """Five wrong guesses burn the code, and resending gives a working one."""
        self.register()
        code = last_code()
        wrong = "000000" if code != "000000" else "111111"
        for _ in range(5):
            self.assertEqual(self.verify(wrong).status_code, 400)
        self.assertEqual(self.verify(code).status_code, 400)  # even the right one now fails

        self.post("resend-code", {"email": EMAIL})
        self.assertEqual(self.verify(last_code()).status_code, 200)

    def test_resending_invalidates_the_previous_code(self):
        """Once a new code is sent, the old one stops working."""
        with patch("users.models.secrets.randbelow", side_effect=[111111, 222222]):
            self.register()
            self.post("resend-code", {"email": EMAIL})
        self.assertEqual(self.verify("111111").status_code, 400)
        self.assertEqual(self.verify("222222").status_code, 200)

    def test_expired_code_is_rejected(self):
        """A code past its expiry time is rejected."""
        self.register()
        OTP.objects.update(expires_at=timezone.now() - timedelta(minutes=1))
        self.assertEqual(self.verify(last_code()).status_code, 400)

    def test_password_reset_code_cannot_verify_an_email(self):
        """A password-reset code can't be used to verify an email."""
        make_user(verified=False)
        self.post("password-forgot", {"email": EMAIL})
        self.assertEqual(self.verify(last_code()).status_code, 400)
        self.assertFalse(User.objects.get(email=EMAIL).is_email_verified)

    def test_resend_for_unknown_or_verified_email_sends_nothing(self):
        """Resend answers 200 for unknown or verified emails, but sends no email."""
        make_user()
        for email in ("nobody@example.com", EMAIL):
            resp = self.post("resend-code", {"email": email})
            self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(mail.outbox), 0)


# ----------------------------------------------------------------- login


class LoginTests(AuthTestCase):
    """Logging in with email and password."""

    def test_login_sets_cookies_and_keeps_tokens_out_of_the_body(self):
        """Login sets HttpOnly cookies and returns no tokens in the body."""
        make_user()
        resp = self.login()
        self.assertEqual(resp.status_code, 200)
        self.assertIn(ACCESS_COOKIE, resp.cookies)
        self.assertIn(REFRESH_COOKIE, resp.cookies)
        self.assertTrue(resp.cookies[ACCESS_COOKIE]["httponly"])
        self.assertNotIn("access", resp.data)
        self.assertNotIn("refresh", resp.data)
        self.assertIn("csrfToken", resp.data)

    def test_unverified_email_gets_403_with_a_code(self):
        """A correct password on an unverified email returns 403 `email_not_verified`."""
        make_user(verified=False)
        resp = self.login()
        self.assertEqual(resp.status_code, 403)
        self.assertEqual(resp.data["code"], "email_not_verified")
        self.assertNotIn(ACCESS_COOKIE, resp.cookies)

    def test_wrong_password_never_reveals_verification_status(self):
        """A wrong password or unknown email gets 401, never the verification error."""
        make_user(verified=False)
        self.assertEqual(self.login(password="Wrong!Pass123").status_code, 401)
        self.assertEqual(self.login(email="nobody@example.com").status_code, 401)

    def test_login_ignores_email_capitalization(self):
        """The email can be typed in any capitalization."""
        make_user()
        self.assertEqual(self.login(email="ANN@EXAMPLE.COM").status_code, 200)

    def test_disabled_account_cannot_log_in(self):
        """A disabled account gets the same 401 as a wrong password."""
        make_user(is_active=False)
        self.assertEqual(self.login().status_code, 401)


# --------------------------------------------------------------- profile


class ProfileTests(AuthTestCase):
    """Reading and editing the logged-in customer's profile."""

    def test_me_requires_login(self):
        """The profile endpoint returns 401 without a login."""
        self.assertEqual(self.client.get(reverse("me")).status_code, 401)

    def test_me_returns_the_profile(self):
        """The profile contains the customer's details and never the password."""
        make_user()
        self.login()
        resp = self.client.get(reverse("me"))
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["email"], EMAIL)
        self.assertEqual(resp.data["role"], "customer")
        self.assertNotIn("password", resp.data)

    def test_patch_updates_allowed_fields_and_ignores_protected_ones(self):
        """PATCH edits name, phone and notifications, but not role, email or verification."""
        user = make_user()
        self.login()
        resp = self.client.patch(
            reverse("me"),
            {
                "full_name": "New Name",
                "phone": "0700000000",
                "notify_promotions_and_deals": False,
                "role": "staff",
                "email": "hacker@example.com",
                "is_email_verified": False,
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        user.refresh_from_db()
        self.assertEqual(user.full_name, "New Name")
        self.assertEqual(user.phone, "0700000000")
        self.assertFalse(user.notify_promotions_and_deals)
        self.assertEqual(user.role, User.ROLE_CUSTOMER)
        self.assertEqual(user.email, EMAIL)
        self.assertTrue(user.is_email_verified)


# ------------------------------------------------------------------ CSRF


class CSRFTests(AuthTestCase):
    """CSRF protection for cookie-authenticated requests."""

    def test_cookie_authenticated_writes_need_the_csrf_token(self):
        """A write without the CSRF header is refused, and accepted with it."""
        make_user()
        client = APIClient(enforce_csrf_checks=True)
        token = self.login(client=client).data["csrfToken"]
        payload = {"old_password": PASSWORD, "new_password": NEW_PASSWORD}

        without = self.post("change-password", payload, client=client)
        self.assertEqual(without.status_code, 403)

        with_token = self.post("change-password", payload, client=client, HTTP_X_CSRFTOKEN=token)
        self.assertEqual(with_token.status_code, 200)

    def test_reads_do_not_need_the_csrf_token(self):
        """GET requests work without the CSRF header."""
        make_user()
        client = APIClient(enforce_csrf_checks=True)
        self.login(client=client)
        self.assertEqual(client.get(reverse("me")).status_code, 200)


# ---------------------------------------------------------- refresh/logout


class TokenTests(AuthTestCase):
    """Refreshing and ending a session."""

    def stale_client_with(self, refresh_token):
        """Return a fresh client that only holds the given refresh cookie."""
        client = APIClient()
        client.cookies[REFRESH_COOKIE] = refresh_token
        return client

    def test_refresh_rotates_the_refresh_cookie_and_blacklists_the_old_one(self):
        """Refresh issues a new refresh cookie, and the old token can't be reused."""
        make_user()
        self.login()
        old = self.client.cookies[REFRESH_COOKIE].value

        resp = self.post("refresh")
        self.assertEqual(resp.status_code, 200)
        self.assertIn(ACCESS_COOKIE, resp.cookies)
        self.assertNotEqual(self.client.cookies[REFRESH_COOKIE].value, old)

        replay = self.post("refresh", client=self.stale_client_with(old))
        self.assertEqual(replay.status_code, 401)

    def test_refresh_without_a_cookie_is_401(self):
        """Refresh returns 401 when there is no refresh cookie."""
        self.assertEqual(self.post("refresh").status_code, 401)

    def test_logout_clears_cookies_and_blacklists_the_refresh_token(self):
        """Logout empties both cookies, and the old refresh token stops working."""
        make_user()
        self.login()
        old = self.client.cookies[REFRESH_COOKIE].value

        resp = self.post("logout")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.cookies[ACCESS_COOKIE].value, "")
        self.assertEqual(resp.cookies[REFRESH_COOKIE].value, "")

        replay = self.post("refresh", client=self.stale_client_with(old))
        self.assertEqual(replay.status_code, 401)


# -------------------------------------------------------- password reset


class PasswordResetTests(AuthTestCase):
    """The forgot-password and reset-password flow."""

    def reset(self, code, new_password=NEW_PASSWORD, email=EMAIL):
        """Submit a code and a new password to the reset endpoint."""
        return self.post(
            "password-reset", {"email": email, "code": code, "new_password": new_password}
        )

    def test_forgot_password_gives_the_same_answer_for_unknown_emails(self):
        """Forgot-password answers identically for known and unknown emails."""
        make_user()
        known = self.post("password-forgot", {"email": EMAIL})
        unknown = self.post("password-forgot", {"email": "nobody@example.com"})
        self.assertEqual(known.status_code, 200)
        self.assertEqual(known.status_code, unknown.status_code)
        self.assertEqual(known.data, unknown.data)
        self.assertEqual(len(mail.outbox), 1)  # only the real account got an email

    def test_full_reset_flow(self):
        """After a reset, the old password stops working and the new one works."""
        make_user()
        self.post("password-forgot", {"email": EMAIL})
        self.assertEqual(self.reset(last_code()).status_code, 200)
        self.assertEqual(self.login(password=PASSWORD).status_code, 401)
        self.assertEqual(self.login(password=NEW_PASSWORD).status_code, 200)

    def test_weak_new_password_does_not_burn_the_code(self):
        """A weak new password is rejected without using up the code."""
        make_user()
        self.post("password-forgot", {"email": EMAIL})
        code = last_code()
        self.assertEqual(self.reset(code, new_password="abc").status_code, 400)
        self.assertEqual(self.reset(code).status_code, 200)

    def test_wrong_code_leaves_the_password_alone(self):
        """A wrong code changes nothing."""
        make_user()
        self.post("password-forgot", {"email": EMAIL})
        wrong = "000000" if last_code() != "000000" else "111111"
        self.assertEqual(self.reset(wrong).status_code, 400)
        self.assertEqual(self.login(password=PASSWORD).status_code, 200)

    def test_code_can_only_be_used_once(self):
        """A reset code can't be used a second time."""
        make_user()
        self.post("password-forgot", {"email": EMAIL})
        code = last_code()
        self.assertEqual(self.reset(code).status_code, 200)
        self.assertEqual(self.reset(code, new_password="An0ther!Pass88").status_code, 400)


# ------------------------------------------------------- change password


class ChangePasswordTests(AuthTestCase):
    """Changing the password while logged in."""

    def test_requires_login(self):
        """Change-password returns 401 without a login."""
        payload = {"old_password": PASSWORD, "new_password": NEW_PASSWORD}
        self.assertEqual(self.post("change-password", payload).status_code, 401)

    def test_wrong_old_password_is_rejected(self):
        """A wrong current password is rejected."""
        make_user()
        self.login()
        payload = {"old_password": "Wrong!Pass123", "new_password": NEW_PASSWORD}
        resp = self.post("change-password", payload)
        self.assertEqual(resp.status_code, 400)
        self.assertIn("old_password", resp.data)

    def test_success_changes_the_password(self):
        """After a change, the old password stops working and the new one works."""
        make_user()
        self.login()
        payload = {"old_password": PASSWORD, "new_password": NEW_PASSWORD}
        self.assertEqual(self.post("change-password", payload).status_code, 200)
        self.assertEqual(self.login(password=PASSWORD).status_code, 401)
        self.assertEqual(self.login(password=NEW_PASSWORD).status_code, 200)

    def test_weak_new_password_is_rejected(self):
        """A weak new password is rejected."""
        make_user()
        self.login()
        payload = {"old_password": PASSWORD, "new_password": "abc"}
        resp = self.post("change-password", payload)
        self.assertEqual(resp.status_code, 400)
        self.assertIn("new_password", resp.data)


# ---------------------------------------------------------- Google login


@override_settings(GOOGLE_CLIENT_ID="test-client-id")
class GoogleLoginTests(AuthTestCase):
    """Google sign-in and sign-up, with Google's token check faked."""

    def google(self, token=None, **extra):
        """Sign in with Google, with Google's verification faked."""
        with patch(GOOGLE_VERIFY, return_value=token or GOOGLE_TOKEN):
            return self.post("google-login", {"credential": "fake-credential", **extra})

    def test_first_sign_in_creates_a_verified_customer(self):
        """A first sign-in creates a verified customer with no password."""
        resp = self.google()
        self.assertEqual(resp.status_code, 201)
        self.assertTrue(resp.data["created"])
        self.assertIn(ACCESS_COOKIE, resp.cookies)
        user = User.objects.get(email=GOOGLE_EMAIL)  # lowercased
        self.assertEqual(user.full_name, "Gina Google")
        self.assertEqual(user.role, User.ROLE_CUSTOMER)
        self.assertTrue(user.is_email_verified)
        self.assertFalse(user.has_usable_password())

    def test_role_in_the_request_is_ignored(self):
        """`role` and `is_staff` in the request are ignored."""
        self.google(role="staff", is_staff=True)
        user = User.objects.get(email=GOOGLE_EMAIL)
        self.assertEqual(user.role, User.ROLE_CUSTOMER)
        self.assertFalse(user.is_staff)

    def test_second_sign_in_logs_into_the_same_account(self):
        """Signing in again reuses the account and returns 200."""
        self.google()
        resp = self.google()
        self.assertEqual(resp.status_code, 200)
        self.assertFalse(resp.data["created"])
        self.assertEqual(User.objects.count(), 1)

    def test_existing_verified_account_is_left_untouched(self):
        """An existing verified account keeps its name and password."""
        user = make_user(email=GOOGLE_EMAIL, full_name="Name I Chose")
        resp = self.google()
        self.assertEqual(resp.status_code, 200)
        user.refresh_from_db()
        self.assertEqual(user.full_name, "Name I Chose")  # not overwritten by Google's name
        self.assertTrue(user.check_password(PASSWORD))

    def test_pre_registration_takeover_is_blocked(self):
        """Google sign-in wipes the password of an unverified pre-registered account."""
        # An attacker signs up with the victim's email and never verifies it...
        self.register(email=GOOGLE_EMAIL)
        user = User.objects.get(email=GOOGLE_EMAIL)
        self.assertEqual(OTP.objects.filter(user=user, is_used=False).count(), 1)

        # ...then the real owner signs in with Google.
        resp = self.google()
        self.assertEqual(resp.status_code, 200)
        user.refresh_from_db()
        self.assertTrue(user.is_email_verified)
        self.assertFalse(user.has_usable_password())  # attacker's password is gone
        self.assertEqual(OTP.objects.filter(user=user, is_used=False).count(), 0)
        self.assertEqual(self.login(email=GOOGLE_EMAIL, password=PASSWORD).status_code, 401)

    def test_disabled_account_gets_403_and_no_cookies(self):
        """A disabled account gets 403 and no cookies."""
        make_user(email=GOOGLE_EMAIL, is_active=False)
        resp = self.google()
        self.assertEqual(resp.status_code, 403)
        self.assertNotIn(ACCESS_COOKIE, resp.cookies)

    def test_invalid_credential_is_rejected(self):
        """A credential Google rejects returns 400 and creates no user."""
        with patch(GOOGLE_VERIFY, side_effect=ValueError("bad")):
            resp = self.post("google-login", {"credential": "garbage"})
        self.assertEqual(resp.status_code, 400)
        self.assertFalse(User.objects.exists())

    def test_google_email_that_is_not_verified_is_rejected(self):
        """A Google account with an unverified email is rejected."""
        resp = self.google(token={**GOOGLE_TOKEN, "email_verified": False})
        self.assertEqual(resp.status_code, 400)
        self.assertFalse(User.objects.exists())

    def test_missing_credential_is_rejected(self):
        """A request with no credential returns 400."""
        self.assertEqual(self.post("google-login", {}).status_code, 400)

    @override_settings(GOOGLE_CLIENT_ID="")
    def test_rejected_when_google_is_not_configured(self):
        """Google sign-in is refused when no client ID is configured."""
        self.assertEqual(self.google().status_code, 400)


# -------------------------------------------------------------- throttling


class ThrottleTests(AuthTestCase):
    """Rate limiting."""

    def test_otp_endpoints_are_rate_limited(self):
        """The third request in a minute gets 429 when the limit is 2 per minute."""
        rates = {"login": "1000/minute", "otp": "2/minute", "google": "1000/minute"}
        with patch.object(SimpleRateThrottle, "THROTTLE_RATES", rates):
            statuses = [
                self.post("resend-code", {"email": "a@example.com"}).status_code
                for _ in range(3)
            ]
        self.assertEqual(statuses, [200, 200, 429])