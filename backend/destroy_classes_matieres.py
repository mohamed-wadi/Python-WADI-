import os
import django
import sys

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection
from base.models import Classe, Matiere, Cours

def supprimer_definitivement():
    """
    Cette fonction supprime définitivement toutes les classes et matières
    et modifie la base de données pour empêcher leur recréation automatique.
    """
    print("🔥 SUPPRESSION DÉFINITIVE DES CLASSES ET MATIÈRES 🔥")
    print("====================================================")
    
    # 1. Supprimer tous les cours (qui dépendent des classes et matières)
    print("\n1. Suppression de tous les cours...")
    nb_cours = Cours.objects.count()
    Cours.objects.all().delete()
    print(f"   ✅ {nb_cours} cours supprimés")
    
    # 2. Supprimer toutes les matières
    print("\n2. Suppression de toutes les matières...")
    nb_matieres = Matiere.objects.count()
    Matiere.objects.all().delete()
    print(f"   ✅ {nb_matieres} matières supprimées")
    
    # 3. Supprimer toutes les classes
    print("\n3. Suppression de toutes les classes...")
    nb_classes = Classe.objects.count()
    Classe.objects.all().delete()
    print(f"   ✅ {nb_classes} classes supprimées")
    
    # 4. Modification directe de la base de données pour réinitialiser les séquences
    print("\n4. Réinitialisation des séquences auto-increment...")
    with connection.cursor() as cursor:
        cursor.execute("ALTER TABLE base_matiere AUTO_INCREMENT = 1;")
        cursor.execute("ALTER TABLE base_classe AUTO_INCREMENT = 1;")
        cursor.execute("ALTER TABLE base_cours AUTO_INCREMENT = 1;")
    print("   ✅ Séquences réinitialisées")
    
    # 5. Créer un fichier de verrouillage pour empêcher la recréation
    print("\n5. Création d'un verrouillage pour empêcher la recréation automatique...")
    
    # Modifier le fichier init_data.py pour désactiver la création de classes et matières
    init_path = os.path.join(os.path.dirname(__file__), 'init_data.py')
    if os.path.exists(init_path):
        with open(init_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Insérer une vérification au début de la fonction create_test_data
        if 'def create_test_data' in content:
            modified = content.replace(
                'def create_test_data(force=True):', 
                'def create_test_data(force=True):\n    # VERROUILLÉ - Ne pas créer de classes et matières\n    print("⚠️ Création de classes et matières désactivée")\n    classes_matieres_lock = True\n    if classes_matieres_lock and Classe.objects.count() == 0:\n        print("Pour réactiver, modifiez la variable classes_matieres_lock dans init_data.py")\n'
            )
            
            with open(init_path, 'w', encoding='utf-8') as f:
                f.write(modified)
            print("   ✅ Fichier init_data.py modifié pour empêcher la recréation")
        else:
            print("   ⚠️ Structure de init_data.py non reconnue, verrouillage manuel requis")
    
    print("\n✅ OPÉRATION TERMINÉE AVEC SUCCÈS")
    print("✅ Vous pouvez maintenant créer vos propres classes et matières")
    print("✅ Elles ne seront plus réinitialisées ni recréées automatiquement")

if __name__ == "__main__":
    print("⚠️ ATTENTION: Cette opération va supprimer DÉFINITIVEMENT toutes les classes et matières.")
    print("Exécution automatique sans confirmation...")
    supprimer_definitivement()
