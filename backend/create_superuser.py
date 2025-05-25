from django.contrib.auth.models import User
from django.db import IntegrityError

username = 'admin'
email = 'admin@example.com'
password = 'admin123'

try:
    superuser = User.objects.create_superuser(
        username=username,
        email=email,
        password=password
    )
    superuser.save()
    print(f'Superuser {username} created successfully!')
except IntegrityError:
    print(f'Superuser {username} already exists.')
