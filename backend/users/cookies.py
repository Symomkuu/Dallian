"""Helpers to set and clear the auth cookies."""

from django.conf import settings

ACCESS_COOKIE = "dallian_access_token"
REFRESH_COOKIE = "dallian_refresh_token"


def _options():
    """Return the cookie settings shared by both auth cookies.

    The cookies are HttpOnly, so JavaScript can't read them. `secure` and
    `samesite` come from settings, so production (HTTPS) and development
    (plain HTTP) can differ without changing this code.
    """
    return {
        "httponly": True,
        "secure": settings.AUTH_COOKIE_SECURE,
        "samesite": settings.AUTH_COOKIE_SAMESITE,
        "path": "/",
    }


def set_auth_cookies(response, access=None, refresh=None):
    """Set the access and/or refresh token cookies on `response`.

    Only the tokens you pass in are set, so a refresh that returns just a new
    access token leaves the refresh cookie alone. Each cookie's lifetime is
    read from the JWT lifetimes in settings, so a cookie can't outlive its
    token or expire before it.
    """
    if access:
        max_age = int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds())
        response.set_cookie(ACCESS_COOKIE, access, max_age=max_age, **_options())
    if refresh:
        max_age = int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds())
        response.set_cookie(REFRESH_COOKIE, refresh, max_age=max_age, **_options())


def clear_auth_cookies(response):
    """Delete both auth cookies from the browser (used on logout and failed refresh).

    The path and samesite values must match how the cookies were set, or the
    browser may ignore the deletion.
    """
    for name in (ACCESS_COOKIE, REFRESH_COOKIE):
        response.delete_cookie(name, path="/", samesite=settings.AUTH_COOKIE_SAMESITE)