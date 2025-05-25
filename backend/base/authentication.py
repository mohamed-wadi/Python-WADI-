from rest_framework.authentication import SessionAuthentication

class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    Classe d'authentification qui désactive la vérification CSRF pour les API REST.
    À utiliser uniquement pour le développement.
    """
    def enforce_csrf(self, request):
        # Désactiver la vérification CSRF
        return
