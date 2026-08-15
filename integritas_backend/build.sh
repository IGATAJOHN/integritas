#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# Automatically create/update the admin user during deployment build
echo "
from django.contrib.auth import get_user_model
User = get_user_model()
email = 'mail@fiscaltransparency.org'
password = 'Integritas@7$'
username = 'admin_fiscal'

try:
    if User.objects.filter(email=email).exists():
        user = User.objects.get(email=email)
        user.set_password(password)
        user.is_superuser = True
        user.is_staff = True
        user.save()
        print('SUCCESS: Admin user password updated/verified.')
    elif User.objects.filter(username=username).exists():
        user = User.objects.get(username=username)
        user.email = email
        user.set_password(password)
        user.is_superuser = True
        user.is_staff = True
        user.save()
        print('SUCCESS: Admin user updated by username.')
    else:
        User.objects.create_superuser(username, email, password)
        print('SUCCESS: Admin user created successfully.')
except Exception as e:
    print('ERROR creating/updating admin user:', str(e))
" | python manage.py shell

