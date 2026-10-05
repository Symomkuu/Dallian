#!/bin/bash
set -e

# Validate required environment variables
REQUIRED_VARS=(
    "SECRET_KEY"
    "ALLOWED_HOSTS"
    "DEBUG"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: Required environment variable '$var' is not set"
        exit 1
    fi
done

echo "✓ Environment validation passed"

if [ "$#" -gt 0 ]; then
    exec "$@"
fi

# Start Gunicorn
exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers "${WEB_CONCURRENCY:-3}" \
    --threads 2 \
    --timeout 120 \
    --keep-alive 5 \
    --worker-tmp-dir /dev/shm \
    --max-requests 1000 \
    --max-requests-jitter 50 \
    --access-logfile - \
    --error-logfile - \
    --log-level info
