FROM python:3.12-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    VIRTUAL_ENV=/opt/venv \
    PATH="/opt/venv/bin:$PATH"

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

RUN python -m venv /opt/venv

COPY requirements.txt /app/requirements.txt

RUN pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r /app/requirements.txt

COPY . /app

RUN SECRET_KEY="$(python -c 'import secrets; print(secrets.token_urlsafe(48))')" \
    DEBUG=False \
    ALLOWED_HOSTS=localhost,127.0.0.1 \
    python manage.py collectstatic --noinput

FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    VIRTUAL_ENV=/opt/venv \
    PATH="/opt/venv/bin:$PATH"

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libpq5 \
    && rm -rf /var/lib/apt/lists/* \
    && addgroup --system appgroup \
    && adduser --system --ingroup appgroup --home /app appuser

COPY --from=builder /opt/venv /opt/venv
COPY --from=builder --chown=appuser:appgroup /app /app
COPY --chown=appuser:appgroup entrypoint.sh /app/entrypoint.sh

RUN chmod +x /app/entrypoint.sh \
    && chown appuser:appgroup /app

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl --fail -H "Host: localhost" http://127.0.0.1:8000/healthz/ || exit 1

ENTRYPOINT ["/app/entrypoint.sh"]
