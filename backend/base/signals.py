from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.db import connection

@receiver(post_migrate)
def prevent_test_data_creation(sender, **kwargs):
    """
    Signal qui s'exécute après chaque migration pour s'assurer que
    les données de test ne sont pas recréées automatiquement.
    """
    # Vérifier si la table de verrouillage existe
    with connection.cursor() as cursor:
        cursor.execute("SHOW TABLES LIKE 'data_protection_lock'")
        if cursor.fetchone():
            # Mettre à jour les verrous
            cursor.execute("UPDATE data_protection_lock SET is_locked = TRUE WHERE entity_type IN ('classe', 'matiere')")
            print("🔒 Protection des données activée - Les données ne seront pas réinitialisées")
