/**
 * Module utilitaire pour effectuer des requêtes HTTP directes avec l'API Fetch
 * Version améliorée avec gestion CORS et diagnostic détaillé
 */

// URL de base de l'API - revenir à l'URL absolue car l'URL relative ne fonctionne pas correctement
const API_URL = 'http://localhost:8002';

// Pour déboggage
console.log('Environnement d\'exécution:', process.env.NODE_ENV);
console.log('URL de base de l\'API:', API_URL);

// Fonction pour simuler un délai (utile pour le débogage)
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Fonction pour vérifier la disponibilité du serveur
export const checkServerAvailability = async () => {
  try {
    console.log('Vérification de la disponibilité du serveur...');
    const response = await fetch(`${API_URL}/api/classes/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store', // Ignorer le cache
      mode: 'cors', // Mode CORS explicite
      credentials: 'include'
    });
    
    console.log('Statut du serveur:', response.status, response.statusText);
    console.log('Headers de réponse:', [...response.headers.entries()]);
    
    return response.ok;
  } catch (error) {
    console.error('Serveur inaccessible:', error);
    return false;
  }
};

/**
 * Effectuer une requête POST simple avec Fetch
 * @param {string} endpoint - Point de terminaison de l'API (ex: 'classes')
 * @param {object} data - Données à envoyer
 * @returns {Promise<object>} - Réponse du serveur
 */
export const postData = async (endpoint, data) => {
  // Désactivation de la vérification de disponibilité qui peut interférer avec les requêtes
  // const serverAvailable = await checkServerAvailability();
  // if (!serverAvailable) {
  //   console.error('Serveur indisponible, impossible d\'envoyer les données');
  //   throw new Error('Serveur indisponible. Veuillez vérifier que le backend Django fonctionne correctement.');
  // }
  console.log('Tentative directe d\'envoi de données...');

  // S'assurer que l'endpoint commence par 'api/'
  const apiEndpoint = endpoint.startsWith('api/') ? endpoint : `api/${endpoint}`;
  
  // Construire l'URL complète
  const url = `${API_URL}/${apiEndpoint}/`;
  
  console.log(`Envoi de requête POST à ${url} avec données:`, data);
  
  try {
    // Obtenir le token CSRF si disponible
    const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)?.[1] || '';
    console.log('Token CSRF trouvé:', csrfToken || 'Aucun');

    // Configuration de la requête
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify(data),
      credentials: 'include', // Inclure les cookies dans la requête
      mode: 'cors', // Mode CORS explicite
      cache: 'no-store' // Ne pas utiliser le cache
    };
    
    // Ajouter le token CSRF si disponible
    if (csrfToken) {
      options.headers['X-CSRFToken'] = csrfToken;
    }
    
    console.log('Options de la requête fetch:', options);
    
    // Effectuer la requête
    const response = await fetch(url, options);
    console.log('Headers de réponse:', [...response.headers.entries()]);
    
    // Vérifier si la requête a réussi
    if (!response.ok) {
      console.error(`Erreur HTTP: ${response.status} ${response.statusText}`);
      
      // Essayer de lire le corps de la réponse d'erreur
      let errorText = '';
      try {
        const errorData = await response.json();
        console.error('Données d\'erreur JSON:', errorData);
        errorText = JSON.stringify(errorData);
      } catch (e) {
        errorText = await response.text();
        console.error('Texte d\'erreur brut:', errorText);
      }
      
      throw new Error(`Erreur HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }
    
    // Lire et retourner les données de la réponse
    const responseData = await response.json();
    console.log('Réponse du serveur:', responseData);
    
    return responseData;
  } catch (error) {
    console.error('Erreur lors de la requête fetch:', error);
    throw error;
  }
};

/**
 * Effectuer une requête PUT simple avec Fetch
 * @param {string} endpoint - Point de terminaison de l'API (ex: 'classes')
 * @param {string|number} id - Identifiant de la ressource
 * @param {object} data - Données à envoyer
 * @returns {Promise<object>} - Réponse du serveur
 */
export const putData = async (endpoint, id, data) => {
  // Désactivation de la vérification de disponibilité qui peut interférer avec les requêtes
  // const serverAvailable = await checkServerAvailability();
  // if (!serverAvailable) {
  //   console.error('Serveur indisponible, impossible d\'envoyer les données');
  //   throw new Error('Serveur indisponible. Veuillez vérifier que le backend Django fonctionne correctement.');
  // }
  console.log('Tentative directe d\'envoi de données en PUT...');

  // S'assurer que l'endpoint commence par 'api/'
  const apiEndpoint = endpoint.startsWith('api/') ? endpoint : `api/${endpoint}`;
  
  // Construire l'URL complète
  const url = `${API_URL}/${apiEndpoint}/${id}/`;
  
  console.log(`Envoi de requête PUT à ${url} avec données:`, data);
  
  try {
    // Obtenir le token CSRF si disponible
    const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)?.[1] || '';
    console.log('Token CSRF trouvé:', csrfToken || 'Aucun');

    // Configuration de la requête
    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify(data),
      credentials: 'include', // Inclure les cookies dans la requête
      mode: 'cors', // Mode CORS explicite
      cache: 'no-store' // Ne pas utiliser le cache
    };
    
    // Ajouter le token CSRF si disponible
    if (csrfToken) {
      options.headers['X-CSRFToken'] = csrfToken;
    }
    
    console.log('Options de la requête fetch PUT:', options);
    
    // Effectuer la requête
    const response = await fetch(url, options);
    console.log('Headers de réponse:', [...response.headers.entries()]);
    
    // Vérifier si la requête a réussi
    if (!response.ok) {
      console.error(`Erreur HTTP: ${response.status} ${response.statusText}`);
      
      // Essayer de lire le corps de la réponse d'erreur
      let errorText = '';
      try {
        const errorData = await response.json();
        console.error('Données d\'erreur JSON:', errorData);
        errorText = JSON.stringify(errorData);
      } catch (e) {
        errorText = await response.text();
        console.error('Texte d\'erreur brut:', errorText);
      }
      
      throw new Error(`Erreur HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }
    
    // Lire et retourner les données de la réponse
    const responseData = await response.json();
    console.log('Réponse du serveur:', responseData);
    
    return responseData;
  } catch (error) {
    console.error('Erreur lors de la requête fetch PUT:', error);
    throw error;
  }
};

/**
 * Effectue une requête DELETE
 * @param {string} endpoint - Point de terminaison de l'API (ex: 'classes')
 * @param {string|number} id - Identifiant de la ressource à supprimer
 * @returns {Promise<void>}
 */
export const deleteData = async (endpoint, id) => {
  // Vérifier d'abord si le serveur est disponible
  const serverAvailable = await checkServerAvailability();
  if (!serverAvailable) {
    console.error('Serveur indisponible, impossible de supprimer la ressource');
    throw new Error('Serveur indisponible. Veuillez vérifier que le backend Django fonctionne correctement.');
  }

  // S'assurer que l'endpoint commence par 'api/'
  const apiEndpoint = endpoint.startsWith('api/') ? endpoint : `api/${endpoint}`;
  
  // Construire l'URL complète
  const url = `${API_URL}/${apiEndpoint}/${id}/`;
  
  console.log(`Envoi de requête DELETE à ${url}`);
  
  try {
    // Obtenir le token CSRF si disponible
    const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)?.[1] || '';
    console.log('Token CSRF trouvé:', csrfToken || 'Aucun');

    // Configuration de la requête
    const options = {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      credentials: 'include', // Inclure les cookies dans la requête
      mode: 'cors', // Mode CORS explicite
      cache: 'no-store' // Ne pas utiliser le cache
    };
    
    // Ajouter le token CSRF si disponible
    if (csrfToken) {
      options.headers['X-CSRFToken'] = csrfToken;
    }
    
    console.log('Options de la requête fetch DELETE:', options);
    
    // Effectuer la requête
    const response = await fetch(url, options);
    console.log('Headers de réponse:', [...response.headers.entries()]);
    
    // Vérifier si la requête a réussi
    if (!response.ok) {
      console.error(`Erreur HTTP: ${response.status} ${response.statusText}`);
      
      // Essayer de lire le corps de la réponse d'erreur
      let errorText = '';
      try {
        const errorData = await response.json();
        console.error('Données d\'erreur JSON:', errorData);
        errorText = JSON.stringify(errorData);
      } catch (e) {
        errorText = await response.text();
        console.error('Texte d\'erreur brut:', errorText);
      }
      
      throw new Error(`Erreur HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }
    
    console.log('Suppression réussie!');
    return true;
  } catch (error) {
    console.error('Erreur lors de la requête fetch DELETE:', error);
    throw error;
  }
};
