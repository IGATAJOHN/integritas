#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# Automatically create the admin user if it does not exist during deployment build
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(email='admin@giaftechnology.com').exists() or User.objects.create_superuser('admin_giaf', 'admin@giaftechnology.com', 'Password123')" | python manage.py shell

