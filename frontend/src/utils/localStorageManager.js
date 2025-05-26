import EventBus from './eventBus';

/**
 * Utilitaire pour gérer le localStorage avec notification automatique
 * Facilite la synchronisation des données dans toute l'application
 */

// Clés utilisées dans localStorage
const STORAGE_KEYS = {
  ETUDIANTS: 'schoolAppEtudiants',
  PROFESSEURS: 'schoolAppProfesseurs',
  CLASSES: 'schoolAppClasses',
  MATIERES: 'schoolAppMatieres',
  NOTES: 'schoolAppNotes',
  COURS: 'schoolAppCours'
};

// Événements pour notifier les composants des changements
const EVENTS = {
  DATA_CHANGED: 'data_changed',
  ETUDIANTS_CHANGED: 'etudiants_changed',
  PROFESSEURS_CHANGED: 'professeurs_changed',
  CLASSES_CHANGED: 'classes_changed',
  MATIERES_CHANGED: 'matieres_changed'
};

/**
 * Sauvegarder des données dans localStorage et notifier les composants
 * @param {string} key - Clé de stockage
 * @param {Array} data - Données à sauvegarder (doit être un tableau)
 */
const saveData = (key, data) => {
  if (!Array.isArray(data)) {
    console.error(`Les données pour ${key} doivent être un tableau`);
    return;
  }
  
  try {
    // Sauvegarder dans localStorage
    localStorage.setItem(key, JSON.stringify(data));
    
    // Pour les classes, maintenir la sauvegarde de sécurité
    if (key === STORAGE_KEYS.CLASSES) {
      localStorage.setItem('schoolAppClasses_backup', JSON.stringify(data));
    }
    
    // Notifier tous les composants qui écoutent les événements
    EventBus.publish(EVENTS.DATA_CHANGED, { key, data });
    
    // Publier un événement spécifique à ce type de données
    switch (key) {
      case STORAGE_KEYS.ETUDIANTS:
        EventBus.publish(EVENTS.ETUDIANTS_CHANGED, data);
        break;
      case STORAGE_KEYS.PROFESSEURS:
        EventBus.publish(EVENTS.PROFESSEURS_CHANGED, data);
        break;
      case STORAGE_KEYS.CLASSES:
        EventBus.publish(EVENTS.CLASSES_CHANGED, data);
        break;
      case STORAGE_KEYS.MATIERES:
        EventBus.publish(EVENTS.MATIERES_CHANGED, data);
        break;
      default:
        break;
    }
    
    console.log(`Données ${key} sauvegardées et notification envoyée`);
    return true;
  } catch (error) {
    console.error(`Erreur lors de la sauvegarde des données ${key}:`, error);
    return false;
  }
};

/**
 * Charger des données depuis localStorage
 * @param {string} key - Clé de stockage
 * @returns {Array} - Données chargées (toujours un tableau)
 */
const loadData = (key) => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return [];
    
    const parsedData = JSON.parse(data);
    return Array.isArray(parsedData) ? parsedData : [];
  } catch (error) {
    console.error(`Erreur lors du chargement des données ${key}:`, error);
    return [];
  }
};

/**
 * Ajouter un élément à un ensemble de données
 * @param {string} key - Clé de stockage
 * @param {Object} item - Élément à ajouter
 */
const addItem = (key, item) => {
  const data = loadData(key);
  data.push(item);
  saveData(key, data);
};

/**
 * Mettre à jour un élément dans un ensemble de données
 * @param {string} key - Clé de stockage
 * @param {string|number} id - ID de l'élément à mettre à jour
 * @param {Object} updatedItem - Nouvelles données de l'élément
 */
const updateItem = (key, id, updatedItem) => {
  const data = loadData(key);
  const index = data.findIndex(item => item.id === id);
  
  if (index !== -1) {
    data[index] = { ...data[index], ...updatedItem };
    saveData(key, data);
    return true;
  }
  return false;
};

/**
 * Supprimer un élément d'un ensemble de données
 * @param {string} key - Clé de stockage
 * @param {string|number} id - ID de l'élément à supprimer
 * @param {boolean} softDelete - Si true, marque l'élément comme supprimé au lieu de l'enlever
 */
const deleteItem = (key, id, softDelete = true) => {
  const data = loadData(key);
  
  if (softDelete) {
    // Soft delete (marquer comme supprimé mais garder dans le tableau)
    const index = data.findIndex(item => item.id === id);
    if (index !== -1) {
      data[index] = { ...data[index], deleted: true };
      saveData(key, data);
      return true;
    }
  } else {
    // Hard delete (enlever complètement de l'array)
    const newData = data.filter(item => item.id !== id);
    if (newData.length !== data.length) {
      saveData(key, newData);
      return true;
    }
  }
  
  return false;
};

/**
 * Récupérer uniquement les éléments actifs (non supprimés)
 * @param {string} key - Clé de stockage
 * @returns {Array} - Éléments actifs uniquement
 */
const getActiveItems = (key) => {
  const data = loadData(key);
  return data.filter(item => !item.deleted);
};

export {
  STORAGE_KEYS,
  EVENTS,
  saveData,
  loadData,
  addItem,
  updateItem,
  deleteItem,
  getActiveItems
};
