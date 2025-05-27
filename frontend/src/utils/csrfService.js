import axios from 'axios';

// Service pour gérer les jetons CSRF
const csrfService = {
  // Stocker le jeton CSRF
  token: null,

  // Fonction pour récupérer un jeton CSRF du serveur
  fetchToken: async () => {
    try {
      const response = await axios.get('http://localhost:8002/csrf-token/', {
        withCredentials: true
      });
      
      if (response.data && response.data.csrfToken) {
        csrfService.token = response.data.csrfToken;
        return response.data.csrfToken;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du jeton CSRF:', error);
      return null;
    }
  },

  // Fonction pour récupérer le jeton stocké ou en obtenir un nouveau
  getToken: async () => {
    if (!csrfService.token) {
      return await csrfService.fetchToken();
    }
    return csrfService.token;
  }
};

export default csrfService;
