import axios from 'axios';

// URL de base de l'API
const API_URL = 'http://localhost:8003';

/**
 * Service utilitaire pour gérer les opérations de création et mise à jour
 * avec une meilleure gestion des erreurs et des tentatives de récupération
 */
export const createService = {
  /**
   * Crée un nouvel élément via l'API avec une gestion améliorée des erreurs
   * @param {string} endpoint - Endpoint de l'API (ex: 'classes', 'etudiants')
   * @param {object} data - Données à envoyer
   * @param {object} options - Options supplémentaires
   * @returns {Promise<object>} - Les données créées
   */
  createItem: async (endpoint, data, options = {}) => {
    const { retryCount = 2, debug = true } = options;
    
    // Assurez-vous que l'endpoint commence par 'api/'
    const apiEndpoint = endpoint.startsWith('api/') ? endpoint : `api/${endpoint}`;
    
    // Construire l'URL
    const url = `${API_URL}/${apiEndpoint}/`;
    
    if (debug) {
      console.log(`Tentative de création dans ${url}:`, data);
    }
    
    try {
      // Configuration pour les requêtes de création
      const config = {
        withCredentials: true,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        // Désactiver la validation des certificats et proxy pour le développement
        validateStatus: (status) => true, // Accepter tous les codes de statut pour déboguer
        timeout: 10000 // Augmenter le timeout à 10 secondes
      };
      
      // Tentative d'obtenir le token CSRF depuis les cookies si disponible
      const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)?.[1];
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
      
      // Log complet des en-têtes pour débogage
      console.log('En-têtes de la requête:', config.headers);
      
      // Tenter la création
      const response = await axios.post(url, data, config);
      
      if (debug) {
        console.log('Création réussie:', response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la création dans ${endpoint}:`, error);
      
      if (error.response) {
        console.log('Statut d\'erreur:', error.response.status);
        console.log('Données d\'erreur:', error.response.data);
      }
      
      // Si des tentatives restent, réessayer après un court délai
      if (retryCount > 0) {
        console.log(`Nouvelle tentative de création restante (${retryCount})...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return createService.createItem(endpoint, data, { 
          ...options, 
          retryCount: retryCount - 1 
        });
      }
      
      // Si toutes les tentatives ont échoué, lancer une erreur explicite
      throw new Error(`Impossible de créer l'élément (${error.response?.status || 'erreur réseau'}): ${error.message}`);
    }
  },
  
  /**
   * Met à jour un élément existant via l'API avec une gestion améliorée des erreurs
   * @param {string} endpoint - Endpoint de l'API (ex: 'classes', 'etudiants')
   * @param {number|string} id - ID de l'élément à mettre à jour
   * @param {object} data - Données à envoyer
   * @param {object} options - Options supplémentaires
   * @returns {Promise<object>} - Les données mises à jour
   */
  updateItem: async (endpoint, id, data, options = {}) => {
    const { retryCount = 2, debug = true } = options;
    
    // Assurez-vous que l'endpoint commence par 'api/'
    const apiEndpoint = endpoint.startsWith('api/') ? endpoint : `api/${endpoint}`;
    
    // Construire l'URL
    const url = `${API_URL}/${apiEndpoint}/${id}/`;
    
    if (debug) {
      console.log(`Tentative de mise à jour dans ${url}:`, data);
    }
    
    try {
      // Configuration pour les requêtes de mise à jour
      const config = {
        withCredentials: true,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        // Désactiver la validation des certificats et proxy pour le développement
        validateStatus: (status) => true, // Accepter tous les codes de statut pour déboguer
        timeout: 10000 // Augmenter le timeout à 10 secondes
      };
      
      // Tentative d'obtenir le token CSRF depuis les cookies si disponible
      const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)?.[1];
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
      
      // Log complet des en-têtes pour débogage
      console.log('En-têtes de la requête de mise à jour:', config.headers);
      
      // Tenter la mise à jour
      const response = await axios.put(url, data, config);
      
      if (debug) {
        console.log('Mise à jour réussie:', response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour dans ${endpoint}/${id}:`, error);
      
      if (error.response) {
        console.log('Statut d\'erreur:', error.response.status);
        console.log('Données d\'erreur:', error.response.data);
      }
      
      // Si des tentatives restent, réessayer après un court délai
      if (retryCount > 0) {
        console.log(`Nouvelle tentative de mise à jour restante (${retryCount})...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return createService.updateItem(endpoint, id, data, { 
          ...options, 
          retryCount: retryCount - 1 
        });
      }
      
      // Si toutes les tentatives ont échoué, lancer une erreur explicite
      throw new Error(`Impossible de mettre à jour l'élément (${error.response?.status || 'erreur réseau'}): ${error.message}`);
    }
  }
};

export default createService;
