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
target = 'mail@fiscaltransparency.org'
password = 'Integritas@7$'
try:
    user = User.objects.filter(email=target).first() or User.objects.filter(username=target).first()
    if user:
        user.set_password(password)
        user.is_superuser = True
        user.is_staff = True
        user.role = 'admin'
        user.roles_list = ['admin']
        user.save()
        print('SUCCESS: Existing admin user elevated/verified:', user.username)
    else:
        user = User.objects.create_superuser('admin_fiscal', target, password)
        user.role = 'admin'
        user.roles_list = ['admin']
        user.save()
        print('SUCCESS: Admin user created successfully and role elevated.')
except Exception as e:
    print('ERROR creating/updating admin user:', str(e))
" | python manage.py shell
