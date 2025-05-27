import axios from 'axios';

// Fonction pour obtenir le cookie CSRF
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Create a base axios instance with configurations
const api = axios.create({
  baseURL: 'http://localhost:8001',  // URL de l'API backend mise à jour
  withCredentials: false, // Désactivé pour le développement
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Augmenter le timeout pour éviter les erreurs prématurées
  timeout: 30000,
});

// Intercepteur de requête simplifié (CSRF désactivé pour le développement)
api.interceptors.request.use(config => {
  // Ajouter un timestamp pour éviter le cache du navigateur
  if (config.method === 'get') {
    config.params = {
      ...config.params,
      _t: Date.now()
    };
  }
  return config;
});

// Dashboard data
export const fetchEtudiantDashboard = () => api.get('/dashboard/etudiant/');
export const fetchProfesseurDashboard = () => api.get('/dashboard/professeur/');
export const fetchAdminDashboard = () => api.get('/dashboard/admin/');

// Students
export const fetchEtudiants = () => api.get('/etudiants/');
export const fetchEtudiant = (id) => api.get(`/etudiants/${id}/`);

// Création d'étudiant avec FormData
export const createEtudiant = (data) => {
  // Convertir l'objet en FormData
  const formData = new FormData();
  for (const key in data) {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  }
  
  // Utiliser FormData pour l'envoi
  return api.post('/etudiants/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Mise à jour d'étudiant avec FormData
export const updateEtudiant = (id, data) => {
  // Convertir l'objet en FormData
  const formData = new FormData();
  for (const key in data) {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  }
  
  // Utiliser FormData pour l'envoi
  return api.put(`/etudiants/${id}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
export const deleteEtudiant = (id) => api.delete(`/etudiants/${id}/`);

// Professors
export const fetchProfesseurs = () => api.get('/professeurs/');
export const fetchProfesseur = (id) => api.get(`/professeurs/${id}/`);
export const createProfesseur = (data) => api.post('/professeurs/', data);
export const updateProfesseur = (id, data) => api.put(`/professeurs/${id}/`, data);
export const deleteProfesseur = (id) => api.delete(`/professeurs/${id}/`);

// Classes
export const fetchClasses = () => api.get('/classes/');
export const fetchClasse = (id) => api.get(`/classes/${id}/`);
export const createClasse = (data) => api.post('/classes/', data);
export const updateClasse = (id, data) => api.put(`/classes/${id}/`, data);
export const deleteClasse = (id) => api.delete(`/classes/${id}/`);

// Étudiants par classe
export const fetchEtudiantsByClasse = (classeId) => {
  console.log(`Appel API pour récupérer les étudiants de la classe ${classeId} : http://localhost:8002/etudiants-par-classe/?classe=${classeId}`);
  return api.get(`/etudiants-par-classe/`, { params: { classe: classeId } });
};

// Cours (Emplois du temps)
export const fetchCours = (params) => api.get('/cours/', { params });
export const fetchCour = (id) => api.get(`/cours/${id}/`);
export const createCour = (data) => api.post('/cours/', data);
export const updateCour = (id, data) => api.put(`/cours/${id}/`, data);
export const deleteCour = (id) => api.delete(`/cours/${id}/`);

// Subjects
export const fetchMatieres = () => api.get('/matieres/');
export const fetchMatiere = (id) => api.get(`/matieres/${id}/`);
export const createMatiere = (data) => api.post('/matieres/', data);
export const updateMatiere = (id, data) => api.put(`/matieres/${id}/`, data);
export const deleteMatiere = (id) => api.delete(`/matieres/${id}/`);

// Notes
export const fetchNotes = () => api.get('/notes/');
export const fetchNote = (id) => api.get(`/notes/${id}/`);
export const createNote = (data) => api.post('/notes/', data);
export const updateNote = (id, data) => api.put(`/notes/${id}/`, data);
export const deleteNote = (id) => api.delete(`/notes/${id}/`);
export const fetchNotesByProfesseur = (professeurId, filters) => api.get(`/professeurs/${professeurId}/notes/`, { params: filters });
export const fetchNotesByClasse = (classeId, trimestre) => api.get(`/classes/${classeId}/notes/`, { params: { trimestre } });

// Bulletins
export const fetchBulletins = () => api.get('/bulletins/');
export const fetchBulletin = (id) => api.get(`/bulletins/${id}/`);
export const createBulletin = (data) => api.post('/bulletins/', data);
export const updateBulletin = (id, data) => api.put(`/bulletins/${id}/`, data);
export const deleteBulletin = (id) => api.delete(`/bulletins/${id}/`);
export const fetchBulletinsByClasse = (classeId, trimestre) => api.get(`/classes/${classeId}/bulletins/`, { params: { trimestre } });
export const generateBulletin = (classeId, trimestre) => api.post(`/classes/${classeId}/bulletins/generate/`, { trimestre });
export const downloadBulletinPdf = (bulletinId) => api.get(`/bulletins/${bulletinId}/pdf/`, { responseType: 'blob' });

// Cours - Déjà défini plus haut avec paramètres

// Absences
export const fetchAbsences = () => api.get('/absences/');
export const fetchAbsence = (id) => api.get(`/absences/${id}/`);
export const createAbsence = (data) => api.post('/absences/', data);
export const updateAbsence = (id, data) => api.put(`/absences/${id}/`, data);
export const deleteAbsence = (id) => api.delete(`/absences/${id}/`);

// Add interceptors for handling errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle session expiration
    if (error.response && error.response.status === 401) {
      // Redirect to login page if session expired
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 