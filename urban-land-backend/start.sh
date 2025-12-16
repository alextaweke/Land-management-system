#!/usr/bin/env bash
set -o errexit

echo "=== APPLYING MIGRATIONS ==="
python manage.py makemigrations --noinput
python manage.py migrate --noinput

echo "=== CREATING SUPERUSER (if needed) ==="
python manage.py shell << 'EOF'
from django.contrib.auth import get_user_model
User = get_user_model()
try:
    if not User.objects.filter(username='admin').exists():
        # Try different approaches based on your User model
        try:
            # If your User model needs email field
            User.objects.create_superuser(
                username='admin',
                email='admin@example.com',
                password='admin123'
            )
        except TypeError:
            # If your User model doesn't need email
            User.objects.create_superuser(
                username='admin',
                password='admin123'
            )
        print("✓ Superuser created: admin / admin123")
    else:
        print("✓ Superuser already exists")
except Exception as e:
    print(f"Note: Could not create superuser: {e}")
    print("You can create one manually with: python manage.py createsuperuser")
EOF

echo "=== COLLECTING STATIC FILES ==="
python manage.py collectstatic --noinput

echo "=== CHECKING SETTINGS ==="
python manage.py shell << 'EOF'
import socket
from django.conf import settings

print(f"Hostname: {socket.gethostname()}")
print(f"DEBUG: {settings.DEBUG}")
print(f"ALLOWED_HOSTS: {settings.ALLOWED_HOSTS}")
print(f"Database: {settings.DATABASES['default']['ENGINE']}")
print(f"SECRET_KEY exists: {'Yes' if settings.SECRET_KEY else 'No'}")
EOF

echo "=== STARTING SERVER ==="
gunicorn config.wsgi:application --bind 0.0.0.0:$PORT