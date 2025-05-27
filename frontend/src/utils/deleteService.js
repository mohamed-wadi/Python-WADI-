import axios from 'axios';

// URL de base de l'API
const API_URL = 'http://localhost:8003';

/**
 * Service utilitaire pour gérer les opérations de suppression
 * avec une meilleure gestion des erreurs et des tentatives de récupération
 */
export const deleteService = {
  /**
   * Supprime un élément via l'API avec une gestion améliorée des erreurs
   * @param {string} endpoint - Endpoint de l'API (ex: 'classes', 'etudiants')
   * @param {number|string} id - ID de l'élément à supprimer
   * @param {object} options - Options supplémentaires
   * @returns {Promise<boolean>} - true si la suppression a réussi
   */
  deleteItem: async (endpoint, id, options = {}) => {
    const { retryCount = 2, debug = true } = options;
    
    // Assurez-vous que l'endpoint commence par 'api/'
    const apiEndpoint = endpoint.startsWith('api/') ? endpoint : `api/${endpoint}`;
    
    // Construire l'URL
    const url = `${API_URL}/${apiEndpoint}/${id}/`;
    
    if (debug) {
      console.log(`Tentative de suppression: ${url}`);
    }
    
    try {
      // Configuration pour les requêtes de suppression
      const config = {
        withCredentials: true,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json',
        }
      };
      
      // Tentative d'obtenir le token CSRF depuis les cookies si disponible
      const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)?.[1];
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
      
      // Tenter la suppression
      const response = await axios.delete(url, config);
      
      if (debug) {
        console.log('Suppression réussie:', response);
      }
      
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'élément ID=${id} dans ${endpoint}:`, error);
      
      if (error.response) {
        console.log('Statut d\'erreur:', error.response.status);
        console.log('Données d\'erreur:', error.response.data);
      }
      
      // Si des tentatives restent, réessayer après un court délai
      if (retryCount > 0) {
        console.log(`Nouvelle tentative restante (${retryCount})...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return deleteService.deleteItem(endpoint, id, { 
          ...options, 
          retryCount: retryCount - 1 
        });
      }
      
      // Si toutes les tentatives ont échoué, lancer une erreur explicite
      throw new Error(`Impossible de supprimer l'élément (${error.response?.status || 'erreur réseau'}): ${error.message}`);
    }
  }
};

export default deleteService;
