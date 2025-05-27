from django.contrib.auth.models import User, Group

# Récupérer l'utilisateur admin
admin = User.objects.get(username='admin')

# Vérifier si le groupe Admins existe, sinon le créer
admins_group, created = Group.objects.get_or_create(name='Admins')
if created:
    print(f"Groupe 'Admins' créé avec succès")

# Ajouter l'utilisateur admin au groupe Admins
admin.groups.add(admins_group)
admin.save()

print(f"L'utilisateur {admin.username} a été ajouté au groupe 'Admins'")
print(f"Groupes de l'utilisateur : {[g.name for g in admin.groups.all()]}")
