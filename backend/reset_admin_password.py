from django.contrib.auth.models import User
from django.db.models import Q

# Trouver l'utilisateur admin
admin = User.objects.get(username='admin')

# Définir le mot de passe à 'admin'
admin.set_password('admin')

# Assurez-vous que c'est un superuser avec tous les droits
admin.is_superuser = True
admin.is_staff = True
admin.is_active = True

# Sauvegarder les modifications
admin.save()

print(f"Le mot de passe de l'utilisateur {admin.username} a été réinitialisé à 'admin'")
print(f"Statut superuser: {admin.is_superuser}")
print(f"Statut staff: {admin.is_staff}")
print(f"Compte actif: {admin.is_active}")
