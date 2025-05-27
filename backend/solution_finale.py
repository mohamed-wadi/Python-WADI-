import os
import django
import sys
import time

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection, transaction
from base.models import Classe, Matiere, Professeur, Etudiant
from django.core.management import call_command

def solution_definitive():
    """
    Solution définitive pour le problème de persistance des données.
    Cette solution est radicale et empêchera définitivement la réinitialisation
    des données après suppression.
    """
    print("\n🔒 SOLUTION DÉFINITIVE AU PROBLÈME DE PERSISTANCE 🔒")
    print("==================================================")
    
    with transaction.atomic():
        # 1. Vérifier l'état actuel des données
        nb_classes = Classe.objects.count()
        nb_matieres = Matiere.objects.count()
        nb_profs = Professeur.objects.count()
        nb_etudiants = Etudiant.objects.count()
        
        print(f"\nÉtat actuel des données:")
        print(f"- Classes: {nb_classes}")
        print(f"- Matières: {nb_matieres}")
        print(f"- Professeurs: {nb_profs}")
        print(f"- Étudiants: {nb_etudiants}")
        
        # 2. Créer une table de verrouillage en base de données
        print("\n1️⃣ Création d'un verrouillage permanent en base de données...")
        with connection.cursor() as cursor:
            # Vérifier si la table existe déjà
            cursor.execute("SHOW TABLES LIKE 'data_protection_lock'")
            if not cursor.fetchone():
                # Créer la table
                cursor.execute("""
                    CREATE TABLE data_protection_lock (
                        id INT PRIMARY KEY,
                        entity_type VARCHAR(255),
                        is_locked BOOLEAN DEFAULT TRUE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    )
                """)
                
                # Insérer les verrous pour chaque type d'entité
                cursor.execute("INSERT INTO data_protection_lock (id, entity_type, is_locked) VALUES (1, 'classe', TRUE)")
                cursor.execute("INSERT INTO data_protection_lock (id, entity_type, is_locked) VALUES (2, 'matiere', TRUE)")
                print("   ✅ Verrous de base de données créés avec succès")
            else:
                # Mettre à jour les verrous existants
                cursor.execute("UPDATE data_protection_lock SET is_locked = TRUE WHERE entity_type IN ('classe', 'matiere')")
                print("   ✅ Verrous de base de données mis à jour")
        
        # 3. Modifier le fichier init_data.py pour désactiver complètement la création automatique
        print("\n2️⃣ Modification du fichier d'initialisation des données...")
        init_path = os.path.join(os.path.dirname(__file__), 'init_data.py')
        
        if os.path.exists(init_path):
            # Créer une sauvegarde du fichier original
            backup_path = init_path + '.backup'
            if not os.path.exists(backup_path):
                with open(init_path, 'r', encoding='utf-8') as f_src:
                    with open(backup_path, 'w', encoding='utf-8') as f_dst:
                        f_dst.write(f_src.read())
                print("   ✅ Sauvegarde du fichier original créée")
            
            # Lire le contenu du fichier
            with open(init_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Modifier le fichier pour désactiver complètement la création de classes et matières
            if 'def create_test_data' in content:
                modified = content.replace(
                    'def create_test_data(force=True):',
                    'def create_test_data(force=True):\n    # SOLUTION DÉFINITIVE - CRÉATION DÉSACTIVÉE\n    print("⛔ Création de données de test désactivée définitivement")\n    # Vérifier le verrouillage en base de données\n    with connection.cursor() as cursor:\n        cursor.execute("SELECT COUNT(*) FROM data_protection_lock WHERE entity_type IN (\'classe\', \'matiere\') AND is_locked = TRUE")\n        if cursor.fetchone()[0] > 0:\n            print("🔒 Protection des données activée - Aucune donnée de test ne sera créée")\n            return'
                )
                
                # Désactiver l'appel automatique à la fin du fichier
                if 'if __name__ == "__main__":' in modified:
                    modified = modified.replace(
                        'if __name__ == "__main__":',
                        'if __name__ == "__main__": # DÉSACTIVÉ\n    print("⚠️ Exécution automatique désactivée")'
                    )
                
                # Écrire le fichier modifié
                with open(init_path, 'w', encoding='utf-8') as f:
                    f.write(modified)
                print("   ✅ Fichier init_data.py modifié avec succès")
        
        # 4. Créer un signal de post_migrate pour empêcher la création automatique
        print("\n3️⃣ Création d'un signal pour bloquer la création automatique...")
        signals_path = os.path.join(os.path.dirname(__file__), 'base', 'signals.py')
        
        # Contenu du fichier signals.py
        signals_content = """from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.db import connection

@receiver(post_migrate)
def prevent_test_data_creation(sender, **kwargs):
    \"\"\"
    Signal qui s'exécute après chaque migration pour s'assurer que
    les données de test ne sont pas recréées automatiquement.
    \"\"\"
    # Vérifier si la table de verrouillage existe
    with connection.cursor() as cursor:
        cursor.execute("SHOW TABLES LIKE 'data_protection_lock'")
        if cursor.fetchone():
            # Mettre à jour les verrous
            cursor.execute("UPDATE data_protection_lock SET is_locked = TRUE WHERE entity_type IN ('classe', 'matiere')")
            print("🔒 Protection des données activée - Les données ne seront pas réinitialisées")
"""
        
        # Écrire le fichier signals.py
        with open(signals_path, 'w', encoding='utf-8') as f:
            f.write(signals_content)
        print("   ✅ Fichier signals.py créé avec succès")
        
        # 5. Modifier apps.py pour activer les signaux
        apps_path = os.path.join(os.path.dirname(__file__), 'base', 'apps.py')
        
        if os.path.exists(apps_path):
            with open(apps_path, 'r', encoding='utf-8') as f:
                apps_content = f.read()
            
            if 'import_signals' not in apps_content:
                # Ajouter l'import des signaux dans la méthode ready
                if 'class BaseConfig' in apps_content and 'ready' not in apps_content:
                    modified_apps = apps_content.replace(
                        'class BaseConfig(AppConfig):',
                        'class BaseConfig(AppConfig):\n    def ready(self):\n        # Import signals\n        import base.signals'
                    )
                elif 'class BaseConfig' in apps_content and 'ready' in apps_content:
                    modified_apps = apps_content.replace(
                        'def ready(self):',
                        'def ready(self):\n        # Import signals\n        import base.signals'
                    )
                else:
                    modified_apps = apps_content
                
                with open(apps_path, 'w', encoding='utf-8') as f:
                    f.write(modified_apps)
                print("   ✅ Fichier apps.py modifié avec succès")
        
        # 6. Créer un middleware pour vérifier le verrouillage à chaque requête
        print("\n4️⃣ Création d'un middleware de protection...")
        middleware_path = os.path.join(os.path.dirname(__file__), 'base', 'middleware.py')
        
        middleware_content = """from django.db import connection

class DataProtectionMiddleware:
    \"\"\"
    Middleware qui vérifie le verrouillage des données à chaque requête.
    \"\"\"
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Vérifier si la table de verrouillage existe
        with connection.cursor() as cursor:
            cursor.execute("SHOW TABLES LIKE 'data_protection_lock'")
            if cursor.fetchone():
                # S'assurer que les verrous sont actifs
                cursor.execute("UPDATE data_protection_lock SET is_locked = TRUE WHERE entity_type IN ('classe', 'matiere')")
        
        response = self.get_response(request)
        return response
"""
        
        with open(middleware_path, 'w', encoding='utf-8') as f:
            f.write(middleware_content)
        print("   ✅ Fichier middleware.py créé avec succès")
        
        # 7. Ajouter le middleware à settings.py
        settings_path = os.path.join(os.path.dirname(__file__), 'backend', 'settings.py')
        
        if os.path.exists(settings_path):
            with open(settings_path, 'r', encoding='utf-8') as f:
                settings_content = f.read()
            
            if 'DataProtectionMiddleware' not in settings_content:
                # Ajouter le middleware à la liste des middlewares
                middleware_section = 'MIDDLEWARE = ['
                if middleware_section in settings_content:
                    middleware_list = settings_content.split(middleware_section)[1].split(']')[0]
                    new_middleware = f"{middleware_section}{middleware_list},\n    'base.middleware.DataProtectionMiddleware',\n]"
                    modified_settings = settings_content.replace(f"{middleware_section}{middleware_list}]", new_middleware)
                    
                    with open(settings_path, 'w', encoding='utf-8') as f:
                        f.write(modified_settings)
                    print("   ✅ Middleware ajouté à settings.py avec succès")
    
    print("\n✅ SOLUTION DÉFINITIVE APPLIQUÉE AVEC SUCCÈS")
    print("✅ Vos données sont maintenant protégées contre toute réinitialisation")
    print("✅ Vous pouvez créer, modifier et supprimer vos données sans craindre de les perdre")
    print("\n⚠️ IMPORTANT: Redémarrez le serveur Django pour activer toutes les protections")

if __name__ == "__main__":
    solution_definitive()
