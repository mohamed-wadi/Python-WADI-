"""
Script pour tester l'ajout d'un étudiant
"""

import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from base.models import Etudiant, Classe
from django.utils import timezone
import random

# Récupérer toutes les classes disponibles
classes = list(Classe.objects.all())
if not classes:
    print("Aucune classe n'existe dans la base de données. Veuillez en créer une d'abord.")
    sys.exit(1)

# Choisir une classe aléatoire
classe = random.choice(classes)

# Générer un numéro matricule unique
numero = random.randint(1000, 9999)
matricule = f"ETU-{timezone.now().year}-{numero}"

# Créer un étudiant test
try:
    etudiant = Etudiant(
        nom="Test",
        prenom="Etudiant",
        email=f"test.etudiant{numero}@example.com",
        numero_matricule=matricule,
        classe=classe,
        date_naissance=timezone.now().date() - timezone.timedelta(days=365*20),  # ~20 ans
        sexe="M",
        adresse="123 Rue de Test",
        telephone="0612345678"
    )
    etudiant.save()
    print(f"Étudiant test créé avec succès! ID: {etudiant.id}")
    print(f"Nom: {etudiant.prenom} {etudiant.nom}")
    print(f"Email: {etudiant.email}")
    print(f"Matricule: {etudiant.numero_matricule}")
    print(f"Classe: {etudiant.classe.nom}")
except Exception as e:
    print(f"ERREUR lors de la création de l'étudiant test: {str(e)}")
