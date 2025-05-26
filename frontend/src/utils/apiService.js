import axios from 'axios';

// Définir l'URL de base de l'API
const API_URL = 'http://localhost:8002/api';

// Configurer axios avec des paramètres par défaut
axios.defaults.withCredentials = true;

// Intercepteur pour gérer les erreurs
axios.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Services pour les étudiants
export const etudiantService = {
  getAll: async () => {
    const response = await axios.get(`${API_URL}/etudiants/`);
    return response.data;
  },
  
  getById: async (id) => {
    const response = await axios.get(`${API_URL}/etudiants/${id}/`);
    return response.data;
  },
  
  create: async (etudiant) => {
    const response = await axios.post(`${API_URL}/etudiants/`, etudiant);
    return response.data;
  },
  
  update: async (id, etudiant) => {
    const response = await axios.put(`${API_URL}/etudiants/${id}/`, etudiant);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/etudiants/${id}/`);
    return response.data;
  },
  
  getByClasse: async (classeId) => {
    const response = await axios.get(`${API_URL}/etudiants/?classe=${classeId}`);
    return response.data;
  }
};

// Services pour les professeurs
export const professeurService = {
  getAll: async () => {
    const response = await axios.get(`${API_URL}/professeurs/`);
    return response.data;
  },
  
  getById: async (id) => {
    const response = await axios.get(`${API_URL}/professeurs/${id}/`);
    return response.data;
  },
  
  create: async (professeur) => {
    const response = await axios.post(`${API_URL}/professeurs/`, professeur);
    return response.data;
  },
  
  update: async (id, professeur) => {
    const response = await axios.put(`${API_URL}/professeurs/${id}/`, professeur);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/professeurs/${id}/`);
    return response.data;
  }
};

// Services pour les classes
export const classeService = {
  getAll: async () => {
    const response = await axios.get(`${API_URL}/classes/`);
    return response.data;
  },
  
  getById: async (id) => {
    const response = await axios.get(`${API_URL}/classes/${id}/`);
    return response.data;
  },
  
  create: async (classe) => {
    const response = await axios.post(`${API_URL}/classes/`, classe);
    return response.data;
  },
  
  update: async (id, classe) => {
    const response = await axios.put(`${API_URL}/classes/${id}/`, classe);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/classes/${id}/`);
    return response.data;
  },
  
  getByNiveau: async (niveau) => {
    const response = await axios.get(`${API_URL}/classes/?niveau=${niveau}`);
    return response.data;
  }
};

// Services pour les matières
export const matiereService = {
  getAll: async () => {
    const response = await axios.get(`${API_URL}/matieres/`);
    return response.data;
  },
  
  getById: async (id) => {
    const response = await axios.get(`${API_URL}/matieres/${id}/`);
    return response.data;
  },
  
  create: async (matiere) => {
    const response = await axios.post(`${API_URL}/matieres/`, matiere);
    return response.data;
  },
  
  update: async (id, matiere) => {
    const response = await axios.put(`${API_URL}/matieres/${id}/`, matiere);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/matieres/${id}/`);
    return response.data;
  },
  
  getByProfesseur: async (professeurId) => {
    const response = await axios.get(`${API_URL}/matieres/?professeur=${professeurId}`);
    return response.data;
  }
};

// Services pour les notes
export const noteService = {
  getAll: async () => {
    const response = await axios.get(`${API_URL}/notes/`);
    return response.data;
  },
  
  getById: async (id) => {
    const response = await axios.get(`${API_URL}/notes/${id}/`);
    return response.data;
  },
  
  create: async (note) => {
    const response = await axios.post(`${API_URL}/notes/`, note);
    return response.data;
  },
  
  update: async (id, note) => {
    const response = await axios.put(`${API_URL}/notes/${id}/`, note);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/notes/${id}/`);
    return response.data;
  },
  
  getByEtudiant: async (etudiantId) => {
    const response = await axios.get(`${API_URL}/notes/?etudiant=${etudiantId}`);
    return response.data;
  },
  
  getByMatiere: async (matiereId) => {
    const response = await axios.get(`${API_URL}/notes/?matiere=${matiereId}`);
    return response.data;
  }
};

// Services pour les cours
export const coursService = {
  getAll: async () => {
    const response = await axios.get(`${API_URL}/cours/`);
    return response.data;
  },
  
  getById: async (id) => {
    const response = await axios.get(`${API_URL}/cours/${id}/`);
    return response.data;
  },
  
  create: async (cours) => {
    const response = await axios.post(`${API_URL}/cours/`, cours);
    return response.data;
  },
  
  update: async (id, cours) => {
    const response = await axios.put(`${API_URL}/cours/${id}/`, cours);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/cours/${id}/`);
    return response.data;
  },
  
  getByClasse: async (classeId) => {
    const response = await axios.get(`${API_URL}/cours/?classe=${classeId}`);
    return response.data;
  },
  
  getByProfesseur: async (professeurId) => {
    const response = await axios.get(`${API_URL}/cours/?professeur=${professeurId}`);
    return response.data;
  },
  
  getByNiveau: async (niveau) => {
    const response = await axios.get(`${API_URL}/cours/?niveau=${niveau}`);
    return response.data;
  }
};

// Services pour les bulletins
export const bulletinService = {
  getAll: async () => {
    const response = await axios.get(`${API_URL}/bulletins/`);
    return response.data;
  },
  
  getById: async (id) => {
    const response = await axios.get(`${API_URL}/bulletins/${id}/`);
    return response.data;
  },
  
  create: async (bulletin) => {
    const response = await axios.post(`${API_URL}/bulletins/`, bulletin);
    return response.data;
  },
  
  update: async (id, bulletin) => {
    const response = await axios.put(`${API_URL}/bulletins/${id}/`, bulletin);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/bulletins/${id}/`);
    return response.data;
  },
  
  getByEtudiant: async (etudiantId) => {
    const response = await axios.get(`${API_URL}/bulletins/?etudiant=${etudiantId}`);
    return response.data;
  },
  
  getByClasse: async (classeId) => {
    const response = await axios.get(`${API_URL}/bulletins/?classe=${classeId}`);
    return response.data;
  },
  
  getByTrimestre: async (trimestre) => {
    const response = await axios.get(`${API_URL}/bulletins/?trimestre=${trimestre}`);
    return response.data;
  }
};

// Service pour les statistiques du tableau de bord
export const dashboardService = {
  getAdminStats: async () => {
    const response = await axios.get(`${API_URL}/dashboard/admin/`);
    return response.data;
  },
  
  getProfesseurStats: async () => {
    const response = await axios.get(`${API_URL}/dashboard/professeur/`);
    return response.data;
  },
  
  getEtudiantStats: async () => {
    const response = await axios.get(`${API_URL}/dashboard/etudiant/`);
    return response.data;
  }
};

// Exporter un objet par défaut qui contient tous les services
export default {
  etudiant: etudiantService,
  professeur: professeurService,
  classe: classeService,
  matiere: matiereService,
  note: noteService,
  cours: coursService,
  bulletin: bulletinService,
  dashboard: dashboardService
};
