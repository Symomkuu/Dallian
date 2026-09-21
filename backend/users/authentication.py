"""Cookie-based JWT authentication with CSRF enforcement."""

from django.middleware.csrf import CsrfViewMiddleware
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.authentication import JWTAuthentication

from users.cookies import ACCESS_COOKIE


class CSRFCheck(CsrfViewMiddleware):
    """Django's CSRF middleware, adapted so a failure returns its reason as text.

    The normal middleware answers a failed check with a 403 page. Here we need
    the reason so `enforce_csrf` can raise a proper API error instead. This is
    the same approach DRF's own SessionAuthentication uses.
    """

    def _reject(self, request, reason):
        """Return the failure reason instead of building an HttpResponse."""
        return reason


def enforce_csrf(request):
    """Run Django's CSRF check on `request` and raise PermissionDenied if it fails.

    Safe methods (GET, HEAD, OPTIONS) always pass. For POST, PATCH, PUT and
    DELETE, the request must carry the CSRF cookie plus a matching
    `X-CSRFToken` header, which the frontend gets from the `csrfToken` field
    returned by login, verify-email, Google sign-in and refresh.
    """
    check = CSRFCheck(lambda req: None)
    check.process_request(request)
    reason = check.process_view(request, None, (), {})
    if reason:
        raise PermissionDenied(f"CSRF Failed: {reason}")


class CookieJWTAuthentication(JWTAuthentication):
    """Read the access token from an HttpOnly cookie. CSRF is checked on unsafe methods."""

    def authenticate(self, request):
        """Return (user, token) from the access cookie, or None if there is no cookie.

        Returning None means "not logged in", so the view's permission class
        decides what happens next (usually a 401). An invalid or expired token
        raises an error instead. The CSRF check runs only when a cookie is
        present, since a request without the cookie can't be a forged
        cookie-based request.
        """
        raw_token = request.COOKIES.get(ACCESS_COOKIE)
        if raw_token is None:
            return None
        enforce_csrf(request)
        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token