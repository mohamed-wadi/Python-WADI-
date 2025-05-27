"""
Script pour vider toutes les données de test de la base de données
tout en préservant la structure des tables.
"""
import os
import django

# Configurer l'environnement Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

# Importer les modèles après avoir configuré Django
from base.models import (
    Cours, 
    Note, 
    Bulletin, 
    Absence, 
    Statistique, 
    Etudiant, 
    Professeur, 
    Matiere, 
    Classe
)
from django.contrib.auth.models import User, Group
from django.db.models import Q

def clean_database():
    """
    Nettoie la base de données en supprimant toutes les données des tables
    dans un ordre qui respecte les contraintes de clés étrangères.
    """
    print("Nettoyage de la base de données en cours...")
    
    # Supprimer les données dans l'ordre pour respecter les contraintes de clés étrangères
    print("1. Suppression des cours...")
    cours_count = Cours.objects.all().count()
    Cours.objects.all().delete()
    print(f"   {cours_count} cours supprimés.")
    
    print("2. Suppression des notes...")
    notes_count = Note.objects.all().count()
    Note.objects.all().delete()
    print(f"   {notes_count} notes supprimées.")
    
    print("3. Suppression des bulletins...")
    bulletins_count = Bulletin.objects.all().count()
    Bulletin.objects.all().delete()
    print(f"   {bulletins_count} bulletins supprimés.")
    
    print("4. Suppression des absences...")
    absences_count = Absence.objects.all().count()
    Absence.objects.all().delete()
    print(f"   {absences_count} absences supprimées.")
    
    print("5. Suppression des statistiques...")
    stats_count = Statistique.objects.all().count()
    Statistique.objects.all().delete()
    print(f"   {stats_count} statistiques supprimées.")
    
    print("6. Suppression des étudiants...")
    etudiants_count = Etudiant.objects.all().count()
    Etudiant.objects.all().delete()
    print(f"   {etudiants_count} étudiants supprimés.")
    
    print("7. Suppression des professeurs...")
    professeurs_count = Professeur.objects.all().count()
    Professeur.objects.all().delete()
    print(f"   {professeurs_count} professeurs supprimés.")
    
    print("8. Suppression des matières...")
    matieres_count = Matiere.objects.all().count()
    Matiere.objects.all().delete()
    print(f"   {matieres_count} matières supprimées.")
    
    print("9. Suppression des classes...")
    classes_count = Classe.objects.all().count()
    Classe.objects.all().delete()
    print(f"   {classes_count} classes supprimées.")
    
    # Ne pas supprimer l'utilisateur admin, mais supprimer les autres utilisateurs de test
    print("10. Suppression des utilisateurs de test (sauf admin)...")
    # Compter les utilisateurs qui vont être supprimés
    users_to_delete_count = User.objects.filter(~Q(username='admin') & ~Q(is_superuser=True)).count()
    # Supprimer les utilisateurs qui ne sont pas admin et qui ne sont pas superuser
    User.objects.filter(~Q(username='admin') & ~Q(is_superuser=True)).delete()
    print(f"   {users_to_delete_count} utilisateurs supprimés.")
    
    print("\nNettoyage terminé avec succès!")
    print("La base de données a été vidée de toutes les données de test.")
    print("L'utilisateur admin a été conservé.")

if __name__ == "__main__":
    # Procéder sans demander de confirmation (mode automatique)
    print("Lancement du nettoyage automatique de la base de données...")
    clean_database()
