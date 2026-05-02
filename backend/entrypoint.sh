#!/bin/bash

# Exit immediately if any command fails
set -e

# Run Django migrations
echo 'Running migrations...'
python manage.py makemigrations
python manage.py migrate

# Create super user if env variables exists (only in dev)
if [[ -n "${DJANGO_SUPERUSER_USERNAME:-}" && -n "${DJANGO_SUPERUSER_EMAIL:-}" && -n "${DJANGO_SUPERUSER_PASSWORD:-}" ]]; then
    echo 'Creating super user...'
    python manage.py createsuperuser --noinput || echo 'Super user already created'
fi

# Collect static files in prod
# echo 'Collecting static files...'
# python manage.py collectstatic --noinput

# Execute the main command (passed as arguments)
exec "$@"