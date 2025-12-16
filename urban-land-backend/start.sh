#!/usr/bin/env bash
set -o errexit

echo "=== 1. Checking current migrations ==="
python manage.py showmigrations

echo "=== 2. Creating migrations ==="
python manage.py makemigrations --noinput

echo "=== 3. Applying migrations ==="
python manage.py migrate --noinput

echo "=== 4. Checking migration status ==="
python manage.py showmigrations

echo "=== 5. Collecting static files ==="
python manage.py collectstatic --noinput

echo "=== 6. Starting server ==="
gunicorn config.wsgi:application --bind 0.0.0.0:$PORT