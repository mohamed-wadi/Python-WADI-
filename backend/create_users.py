from django.contrib.auth.models import User, Group

# Create student user
try:
    student_user = User.objects.get(username='etudiant')
    print("L'utilisateur étudiant existe déjà")
except User.DoesNotExist:
    student_user = User.objects.create_user(
        username='etudiant',
        email='etudiant@example.com',
        password='etudiant123',
        first_name='Test',
        last_name='Etudiant'
    )
    
    # Add to Etudiants group if it exists
    try:
        student_group = Group.objects.get(name='Etudiants')
        student_user.groups.add(student_group)
        print("Utilisateur étudiant ajouté au groupe Etudiants")
    except Group.DoesNotExist:
        print("Le groupe Etudiants n'existe pas")
    
    print("Utilisateur étudiant créé avec succès")

# Create teacher user
try:
    teacher_user = User.objects.get(username='professeur')
    print("L'utilisateur professeur existe déjà")
except User.DoesNotExist:
    teacher_user = User.objects.create_user(
        username='professeur',
        email='professeur@example.com',
        password='professeur123',
        first_name='Test',
        last_name='Professeur'
    )
    
    # Add to Professeurs group if it exists
    try:
        teacher_group = Group.objects.get(name='Professeurs')
        teacher_user.groups.add(teacher_group)
        print("Utilisateur professeur ajouté au groupe Professeurs")
    except Group.DoesNotExist:
        print("Le groupe Professeurs n'existe pas")
    
    print("Utilisateur professeur créé avec succès")

print("\nRécapitulatif des utilisateurs :")
print(f"Total utilisateurs : {User.objects.count()}")
