/**
 * Gestionnaire de persistance pour l'application
 * Ce fichier assure que les suppressions sont préservées même après actualisation
 */

// Identifiants des entités dans le localStorage
export const ENTITY_KEYS = {
  CLASSES: 'schoolAppClasses',
  PROFESSEURS: 'schoolAppProfesseurs',
  MATIERES: 'schoolAppMatieres',
  ETUDIANTS: 'schoolAppEtudiants'
};

/**
 * Marque une entité comme supprimée
 * @param {string} entityKey - Clé de l'entité (ex: 'schoolAppClasses')
 */
export const markEntityAsDeleted = (entityKey) => {
  localStorage.setItem(`${entityKey}_deleted`, 'true');
  localStorage.setItem(entityKey, '[]');
  
  // Si c'est une classe, mettre à jour la sauvegarde aussi
  if (entityKey === ENTITY_KEYS.CLASSES) {
    localStorage.setItem('schoolAppClasses_backup', '[]');
  }
  
  console.log(`✅ ${entityKey} marqué comme supprimé`);
};

/**
 * Vérifie si une entité est marquée comme supprimée
 * @param {string} entityKey - Clé de l'entité
 * @returns {boolean} - true si l'entité est marquée comme supprimée
 */
export const isEntityDeleted = (entityKey) => {
  return localStorage.getItem(`${entityKey}_deleted`) === 'true';
};

/**
 * Vérifie si les données à charger sont vides et les marque comme supprimées si c'est le cas
 * @param {string} entityKey - Clé de l'entité
 * @param {Array} data - Données chargées
 */
export const checkAndMarkIfEmpty = (entityKey, data) => {
  if (!data || data.length === 0) {
    markEntityAsDeleted(entityKey);
    return true;
  }
  return false;
};

/**
 * Désactive la protection contre la réinitialisation pour une entité
 * @param {string} entityKey - Clé de l'entité
 */
export const resetEntityProtection = (entityKey) => {
  localStorage.removeItem(`${entityKey}_deleted`);
  console.log(`Protection désactivée pour ${entityKey}`);
};

export default {
  ENTITY_KEYS,
  markEntityAsDeleted,
  isEntityDeleted,
  checkAndMarkIfEmpty,
  resetEntityProtection
};
