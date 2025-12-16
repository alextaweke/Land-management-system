#!/usr/bin/env bash
set -o errexit

echo "=== CLEAN MIGRATION RESET ==="

# OPTION A: Clear migration history completely (if no important data)
python manage.py shell << EOF
from django.db import connection
try:
    with connection.cursor() as cursor:
        cursor.execute("DROP TABLE IF EXISTS django_migrations CASCADE;")
        print("Dropped django_migrations table")
except Exception as e:
    print(f"Error: {e}")
EOF

# OPTION B: Or use Django's migrate --fake-zero
python manage.py migrate --fake-zero 2>/dev/null || true

echo "=== CREATE AND APPLY MIGRATIONS ==="
python manage.py makemigrations --noinput
python manage.py migrate --noinput

echo "=== CREATE SUPERUSER (optional) ==="
python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print("Superuser created: admin/admin123")
else:
    print("Superuser already exists")
EOF

echo "=== COLLECT STATIC ==="
python manage.py collectstatic --noinput

echo "=== START SERVER ==="
gunicorn config.wsgi:application --bind 0.0.0.0:$PORT