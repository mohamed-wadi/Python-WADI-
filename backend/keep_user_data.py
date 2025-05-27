import os
import django
import sys

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import transaction
from base.models import Classe, Matiere

def securiser_donnees():
    """
    Sécurise les données existantes pour éviter qu'elles ne soient écrasées.
    """
    # Vérifier s'il y a des classes et matières à protéger
    with transaction.atomic():
        nb_classes = Classe.objects.count()
        nb_matieres = Matiere.objects.count()
        
        # S'il y a des données à protéger, on les marque comme non-remplaçables
        if nb_classes > 0 or nb_matieres > 0:
            # Marquer les classes existantes
            for classe in Classe.objects.all():
                # Ajouter un préfixe spécial pour indiquer qu'il s'agit de données utilisateur
                if not classe.nom.startswith('USER_'):
                    classe.nom = f"USER_{classe.nom}"
                    classe.save()
                    print(f"Classe protégée: {classe.nom}")
            
            # Marquer les matières existantes
            for matiere in Matiere.objects.all():
                # Ajouter un préfixe spécial pour indiquer qu'il s'agit de données utilisateur
                if not matiere.nom.startswith('USER_'):
                    matiere.nom = f"USER_{matiere.nom}"
                    matiere.save()
                    print(f"Matière protégée: {matiere.nom}")
            
            print(f"\nProtection terminée: {nb_classes} classes et {nb_matieres} matières sont maintenant protégées")
            print("Les données ne seront plus écrasées au redémarrage du serveur")
        else:
            print("Aucune donnée à protéger")

if __name__ == "__main__":
    securiser_donnees()
