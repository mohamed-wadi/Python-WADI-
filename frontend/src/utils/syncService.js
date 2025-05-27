// Service de synchronisation pour envoyer les données du localStorage vers le backend Django
import axios from 'axios';

// URL de base de l'API
const API_BASE_URL = 'http://localhost:8002/api';

// Fonction pour synchroniser les professeurs
export const syncProfesseurs = async () => {
  try {
    const professeurs = localStorage.getItem('schoolAppProfesseurs');
    if (!professeurs) return { success: false, message: 'Aucune donnée de professeurs à synchroniser' };
    
    const data = JSON.parse(professeurs);
    const response = await axios.post(`${API_BASE_URL}/sync/professeurs/`, { data });
    
    console.log('Synchronisation des professeurs réussie', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Erreur lors de la synchronisation des professeurs:', error);
    return { success: false, error };
  }
};

// Fonction pour synchroniser les classes
export const syncClasses = async () => {
  try {
    const classes = localStorage.getItem('schoolAppClasses');
    if (!classes) return { success: false, message: 'Aucune donnée de classes à synchroniser' };
    
    const data = JSON.parse(classes);
    const response = await axios.post(`${API_BASE_URL}/sync/classes/`, { data });
    
    console.log('Synchronisation des classes réussie', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Erreur lors de la synchronisation des classes:', error);
    return { success: false, error };
  }
};

// Fonction pour synchroniser les étudiants
export const syncEtudiants = async () => {
  try {
    const etudiants = localStorage.getItem('schoolAppEtudiants');
    if (!etudiants) return { success: false, message: 'Aucune donnée d\'étudiants à synchroniser' };
    
    const data = JSON.parse(etudiants);
    const response = await axios.post(`${API_BASE_URL}/sync/etudiants/`, { data });
    
    console.log('Synchronisation des étudiants réussie', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Erreur lors de la synchronisation des étudiants:', error);
    return { success: false, error };
  }
};

// Fonction pour synchroniser les matières
export const syncMatieres = async () => {
  try {
    const matieres = localStorage.getItem('schoolAppMatieres');
    if (!matieres) return { success: false, message: 'Aucune donnée de matières à synchroniser' };
    
    const data = JSON.parse(matieres);
    const response = await axios.post(`${API_BASE_URL}/sync/matieres/`, { data });
    
    console.log('Synchronisation des matières réussie', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Erreur lors de la synchronisation des matières:', error);
    return { success: false, error };
  }
};

// Fonction pour synchroniser les notes
export const syncNotes = async () => {
  try {
    const notes = localStorage.getItem('saved_notes');
    if (!notes) return { success: false, message: 'Aucune donnée de notes à synchroniser' };
    
    const data = JSON.parse(notes);
    const response = await axios.post(`${API_BASE_URL}/sync/notes/`, { data });
    
    console.log('Synchronisation des notes réussie', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Erreur lors de la synchronisation des notes:', error);
    return { success: false, error };
  }
};

// Fonction pour synchroniser les cours
export const syncCours = async () => {
  try {
    const cours = localStorage.getItem('saved_courses');
    if (!cours) return { success: false, message: 'Aucune donnée de cours à synchroniser' };
    
    const data = JSON.parse(cours);
    const response = await axios.post(`${API_BASE_URL}/sync/cours/`, { data });
    
    console.log('Synchronisation des cours réussie', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Erreur lors de la synchronisation des cours:', error);
    return { success: false, error };
  }
};

// Fonction principale pour synchroniser toutes les données
export const syncAllData = async () => {
  const results = {};
  results.professeurs = await syncProfesseurs();
  results.classes = await syncClasses();
  results.etudiants = await syncEtudiants();
  results.matieres = await syncMatieres();
  results.notes = await syncNotes();
  results.cours = await syncCours();
  
  return results;
};

// Fonction pour vérifier si des données ont changé et nécessitent une synchronisation
export const checkForChanges = () => {
  const lastSync = localStorage.getItem('lastSyncTimestamp');
  const lastModified = localStorage.getItem('lastModifiedTimestamp');
  
  if (!lastSync || !lastModified) return true;
  
  return parseInt(lastModified) > parseInt(lastSync);
};

// Mettre à jour le timestamp de dernière synchronisation
export const updateSyncTimestamp = () => {
  localStorage.setItem('lastSyncTimestamp', Date.now().toString());
};

// Mettre à jour le timestamp de dernière modification (à appeler après chaque modification du localStorage)
export const updateModifiedTimestamp = () => {
  localStorage.setItem('lastModifiedTimestamp', Date.now().toString());
};
