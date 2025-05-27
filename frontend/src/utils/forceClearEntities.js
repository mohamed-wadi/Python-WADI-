/**
 * Utilitaire pour forcer la suppression permanente des entités
 * Cette solution drastique permet d'éviter tout problème de réinitialisation de données
 */

// Liste des entités gérées par l'application
const ENTITY_KEYS = [
  'schoolAppClasses',
  'schoolAppProfesseurs', 
  'schoolAppMatieres',
  'schoolAppEtudiants',
  'schoolAppNotes',
  'schoolAppCours'
];

/**
 * Force la suppression complète d'une entité
 * @param {string} entityKey - Clé de l'entité (ex: 'schoolAppClasses')
 */
export const forceClearEntity = (entityKey) => {
  // Vider l'entité
  localStorage.setItem(entityKey, '[]');
  
  // Marquer comme supprimée
  localStorage.setItem(`${entityKey}_deleted`, 'true');
  
  // Empêcher la réinitialisation
  localStorage.setItem(`${entityKey}_preserve`, 'deleted');
  
  // Créer une sauvegarde vide
  if (entityKey === 'schoolAppClasses') {
    localStorage.setItem('schoolAppClasses_backup', '[]');
  }
  
  console.log(`⚠️ Entité ${entityKey} vidée de façon permanente`);
};

/**
 * Vérifier si une entité a été intentionnellement vidée
 * @param {string} entityKey - Clé de l'entité (ex: 'schoolAppClasses')
 * @returns {boolean} - True si l'entité a été intentionnellement vidée
 */
export const isEntityDeleted = (entityKey) => {
  return localStorage.getItem(`${entityKey}_deleted`) === 'true';
};

/**
 * Désactiver la protection pour permettre la réinitialisation des données
 * @param {string} entityKey - Clé de l'entité (ex: 'schoolAppClasses')
 */
export const resetEntityProtection = (entityKey) => {
  localStorage.removeItem(`${entityKey}_deleted`);
  localStorage.removeItem(`${entityKey}_preserve`);
  console.log(`Protection désactivée pour ${entityKey}`);
};

/**
 * Force l'application à conserver l'état actuel de toutes les entités
 * A utiliser en cas de problème persistant
 */
export const preserveCurrentAppState = () => {
  localStorage.setItem('appStatePreserved', 'true');
  
  // Marquer que l'initialisation a déjà été faite
  localStorage.setItem('schoolAppDataInitialized', 'true');
  
  console.log('État actuel de l\'application préservé');
};

export default {
  forceClearEntity,
  isEntityDeleted,
  resetEntityProtection,
  preserveCurrentAppState,
  ENTITY_KEYS
};
