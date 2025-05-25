from rest_framework.authentication import SessionAuthentication

class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    Classe d'authentification qui contourne la vérification CSRF.
    À utiliser seulement en développement !
    """
    def enforce_csrf(self, request):
        # Ne pas effectuer la vérification CSRF
        return
