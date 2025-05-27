from django.db import connection
import logging

logger = logging.getLogger(__name__)

class DataProtectionMiddleware:
    """
    Middleware qui vérifie le verrouillage des données à chaque requête.
    Optimisé pour ne pas interférer avec les requêtes API.
    """
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Ne pas traiter les requêtes API pour éviter les problèmes de connexion
        if request.path.startswith('/api/'):
            # Laisser passer les requêtes API sans vérification
            response = self.get_response(request)
            return response
            
        # Pour les autres requêtes, appliquer la protection des données
        try:
            # Vérifier si la table de verrouillage existe
            with connection.cursor() as cursor:
                cursor.execute("SHOW TABLES LIKE 'data_protection_lock'")
                if cursor.fetchone():
                    # S'assurer que les verrous sont actifs
                    cursor.execute("UPDATE data_protection_lock SET is_locked = TRUE WHERE entity_type IN ('classe', 'matiere')")
        except Exception as e:
            # Logger l'erreur mais ne pas bloquer la requête
            logger.error(f"Erreur dans DataProtectionMiddleware: {e}")
        
        # Continuer avec la requête
        response = self.get_response(request)
        return response
