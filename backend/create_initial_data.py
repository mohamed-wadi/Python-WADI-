import os
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User, Group
from base.auth_views import create_default_groups
from base.models import Etudiant, Professeur, Classe, Matiere, Cours

# Create default groups
create_default_groups()
print("✅ Groupes de base créés (Etudiants, Professeurs, Admins)")

# Create a superuser (admin) if it doesn't exist
try:
    admin = User.objects.get(username='admin')
    print("⚠️ L'administrateur existe déjà")
except User.DoesNotExist:
    admin = User.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='admin123'
    )
    # Add admin to the Admins group
    admin_group = Group.objects.get(name='Admins')
    admin.groups.add(admin_group)
    print("✅ Superutilisateur 'admin' créé avec mot de passe 'admin123'")

# Create a test student user, if needed
try:
    student_user = User.objects.get(username='etudiant')
    print("⚠️ L'utilisateur étudiant existe déjà")
except User.DoesNotExist:
    # Check if we have at least one student record
    students = Etudiant.objects.all()
    if students.exists():
        student = students.first()
        # Create a user for this student
        student_user = User.objects.create_user(
            username='etudiant',
            email=student.email,
            password='etudiant123',
            first_name=student.prenom,
            last_name=student.nom
        )
        
        # Link the user to the student profile
        student.user = student_user
        student.save()
        
        # Add to Etudiants group
        student_group = Group.objects.get(name='Etudiants')
        student_user.groups.add(student_group)
        
        print(f"✅ Utilisateur étudiant 'etudiant' créé et lié à {student}")
    else:
        print("⚠️ Aucun étudiant n'existe dans la base de données pour créer un utilisateur de test")

# Create a test teacher user, if needed
try:
    teacher_user = User.objects.get(username='professeur')
    print("⚠️ L'utilisateur professeur existe déjà")
except User.DoesNotExist:
    # Check if we have at least one teacher record
    teachers = Professeur.objects.all()
    if teachers.exists():
        teacher = teachers.first()
        # Create a user for this teacher
        teacher_user = User.objects.create_user(
            username='professeur',
            email=teacher.email,
            password='professeur123',
            first_name=teacher.prenom,
            last_name=teacher.nom
        )
        
        # Link the user to the teacher profile
        teacher.user = teacher_user
        teacher.save()
        
        # Add to Professeurs group
        teacher_group = Group.objects.get(name='Professeurs')
        teacher_user.groups.add(teacher_group)
        
        print(f"✅ Utilisateur professeur 'professeur' créé et lié à {teacher}")
    else:
        print("⚠️ Aucun professeur n'existe dans la base de données pour créer un utilisateur de test")

print("\n--- Résumé des utilisateurs ---")
print(f"Total utilisateurs: {User.objects.count()}")
print(f"Administrateurs: {User.objects.filter(is_staff=True).count()}")
print(f"Étudiants: {User.objects.filter(groups__name='Etudiants').count()}")
print(f"Professeurs: {User.objects.filter(groups__name='Professeurs').count()}")
print("\nUtilisez l'application Django Admin pour créer plus d'utilisateurs et les associer aux profils.")
print("URL de connexion: http://localhost:8000/login/") 