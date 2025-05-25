// Utilitaire pour gérer les tokens CSRF

// Fonction pour obtenir un token CSRF depuis le backend
export const getCSRFToken = async () => {
  try {
    // Faire une requête GET au endpoint CSRF du backend
    const response = await fetch('http://localhost:8000/api/get-csrf-token/', {
      method: 'GET',
      credentials: 'include', // Important pour que les cookies soient inclus
    });
    
    if (!response.ok) {
      throw new Error('Impossible d\'obtenir le token CSRF');
    }
    
    // Le token est maintenant dans les cookies, on peut l'extraire
    return getCookie('csrftoken');
  } catch (error) {
    console.error('Erreur lors de la récupération du token CSRF:', error);
    return null;
  }
};

// Fonction utilitaire pour extraire un cookie par son nom
export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

// Fonction pour configurer les en-têtes avec le token CSRF
export const getCSRFHeaders = () => {
  const csrfToken = getCookie('csrftoken');
  return {
    'Content-Type': 'application/json',
    'X-CSRFToken': csrfToken || '',
  };
};
