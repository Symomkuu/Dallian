"""Utility helpers for project-wide HTTP error handling."""

from django.http import HttpResponse, JsonResponse


def render_404_page() -> str:
    """Return a simple styled HTML page for 404 responses."""
    return """<!doctype html>
<html lang=\"en\">
<head>
  <meta charset=\"utf-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
  <title>Page Not Found</title>
  <style>
    body { margin: 0; font-family: Segoe UI, Tahoma, sans-serif; background: #f6f8fb; color: #1f2937; }
    .wrap { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
    .card { max-width: 640px; width: 100%; background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 28px; box-shadow: 0 10px 30px rgba(17,24,39,0.08); }
    .code { display: inline-block; font-size: 12px; letter-spacing: 0.08em; color: #2563eb; background: #dbeafe; border-radius: 999px; padding: 6px 10px; }
    h1 { margin: 14px 0 10px; font-size: 30px; }
    p { margin: 0 0 16px; line-height: 1.6; color: #4b5563; }
    a { color: #2563eb; text-decoration: none; font-weight: 600; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <main class=\"wrap\">
    <section class=\"card\">
      <span class=\"code\">404 NOT FOUND</span>
      <h1>We could not find that page.</h1>
      <p>The link may be broken, or the page may have moved.</p>
      <a href=\"/\">Return to home</a>
    </section>
  </main>
</body>
</html>"""


def render_500_page() -> str:
    """Return a simple styled HTML page for 500 responses."""
    return """<!doctype html>
<html lang=\"en\">
<head>
  <meta charset=\"utf-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
  <title>Server Error</title>
  <style>
    body { margin: 0; font-family: Segoe UI, Tahoma, sans-serif; background: #fff7ed; color: #111827; }
    .wrap { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
    .card { max-width: 640px; width: 100%; background: #fff; border: 1px solid #fed7aa; border-radius: 16px; padding: 28px; box-shadow: 0 10px 30px rgba(124,45,18,0.08); }
    .code { display: inline-block; font-size: 12px; letter-spacing: 0.08em; color: #c2410c; background: #ffedd5; border-radius: 999px; padding: 6px 10px; }
    h1 { margin: 14px 0 10px; font-size: 30px; }
    p { margin: 0 0 16px; line-height: 1.6; color: #4b5563; }
    a { color: #c2410c; text-decoration: none; font-weight: 600; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <main class=\"wrap\">
    <section class=\"card\">
      <span class=\"code\">500 INTERNAL SERVER ERROR</span>
      <h1>Something went wrong on our side.</h1>
      <p>Please try again in a moment. If the issue persists, contact support.</p>
      <a href=\"/\">Go back home</a>
    </section>
  </main>
</body>
</html>"""


def custom_404(request, exception=None):
    """Return JSON 404 for API paths, HTML otherwise using render_404_page."""
    if request.path.startswith("/api/"):
        return JsonResponse({"detail": "Not found"}, status=404)
    return HttpResponse(render_404_page(), status=404)


def custom_500(request, exception=None):
    """Return JSON 500 for API paths, HTML otherwise using render_500_page."""
    if request.path.startswith("/api/"):
        return JsonResponse({"detail": "Something went wrong"}, status=500)
    return HttpResponse(render_500_page(), status=500)
