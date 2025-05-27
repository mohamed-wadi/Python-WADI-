import axios from 'axios';

// API simplifiée sans vérification CSRF pour les opérations d'enregistrement
const directApi = axios.create({
  baseURL: 'http://localhost:8001',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
});

// Fonctions d'enregistrement direct sans restrictions
export const saveClasse = (data) => {
  return directApi.post('/direct/save-classe/', data);
};

export const saveEtudiant = (data) => {
  return directApi.post('/direct/save-etudiant/', data);
};

export const saveProfesseur = (data) => {
  return directApi.post('/direct/save-professeur/', data);
};

export const saveMatiere = (data) => {
  return directApi.post('/direct/save-matiere/', data);
};

export default {
  saveClasse,
  saveEtudiant,
  saveProfesseur,
  saveMatiere
};
