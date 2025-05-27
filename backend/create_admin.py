import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from django.contrib.auth.models import User

# Créer un superutilisateur
username = 'admin'
email = 'admin@example.com'
password = 'admin123'

try:
    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(username, email, password)
        print(f"Superutilisateur '{username}' créé avec succès!")
    else:
        user = User.objects.get(username=username)
        user.set_password(password)
        user.save()
        print(f"Mot de passe réinitialisé pour l'utilisateur '{username}'")
except Exception as e:
    print(f"Erreur: {e}")
