"""
Script pour ajouter un étudiant directement à la base de données.
À exécuter avec `python3 manage.py shell < add_student.py`
"""

import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from base.models import Etudiant, Classe
from django.utils import timezone

def add_student(nom, prenom, email, numero_matricule, classe_id=None, 
                date_naissance=None, sexe='M', adresse='', telephone=''):
    """
    Ajoute un étudiant à la base de données
    """
    try:
        # Vérifier si l'étudiant existe déjà
        existing = Etudiant.objects.filter(email=email)
        if existing.exists():
            print(f"ERREUR: Un étudiant avec l'email {email} existe déjà")
            return False
            
        existing = Etudiant.objects.filter(numero_matricule=numero_matricule)
        if existing.exists():
            print(f"ERREUR: Un étudiant avec le numéro de matricule {numero_matricule} existe déjà")
            return False
        
        # Récupérer la classe si spécifiée
        classe = None
        if classe_id:
            try:
                classe = Classe.objects.get(id=classe_id)
            except Classe.DoesNotExist:
                print(f"ERREUR: La classe avec l'ID {classe_id} n'existe pas")
                return False
        
        # Utiliser la date actuelle si non spécifiée
        if not date_naissance:
            date_naissance = timezone.now().date()
        
        # Créer l'étudiant
        etudiant = Etudiant(
            nom=nom,
            prenom=prenom,
            email=email,
            numero_matricule=numero_matricule,
            classe=classe,
            date_naissance=date_naissance,
            sexe=sexe,
            adresse=adresse,
            telephone=telephone
        )
        etudiant.save()
        
        print(f"Étudiant {prenom} {nom} ajouté avec succès!")
        return True
        
    except Exception as e:
        print(f"ERREUR lors de l'ajout de l'étudiant: {str(e)}")
        return False

# Exemple d'utilisation:
# add_student(
#     nom="Dupont",
#     prenom="Jean",
#     email="jean.dupont@example.com",
#     numero_matricule="STD-2023-001",
#     classe_id=1,  # ID d'une classe existante
#     date_naissance="2000-01-01",
#     sexe="M",
#     adresse="123 Rue de la République",
#     telephone="0612345678"
# )

# Pour utiliser ce script, décommentez l'exemple ci-dessus et personnalisez les valeurs
