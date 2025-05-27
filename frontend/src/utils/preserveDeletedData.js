/**
 * Ce fichier contient des utilitaires pour préserver les données supprimées
 * et empêcher la réinitialisation automatique de ces données
 */

/**
 * Applique la préservation des suppressions pour les entités spécifiées
 * Cette fonction est appelée avant toute tentative de chargement de données
 */
export const preserveDeletedEntities = () => {
  // Liste des entités à surveiller
  const entities = [
    'schoolAppClasses',
    'schoolAppProfesseurs',
    'schoolAppMatieres'
  ];
  
  // Pour chaque entité, vérifier si elle est marquée comme "supprimée"
  entities.forEach(entity => {
    const deletedFlagKey = `${entity}_deleted`;
    const isDeleted = localStorage.getItem(deletedFlagKey) === 'true';
    
    // Si l'entité est marquée comme supprimée, s'assurer qu'elle reste vide
    if (isDeleted) {
      console.log(`Préservation de la suppression pour ${entity}`);
      localStorage.setItem(entity, '[]');
    }
  });
};

/**
 * Marque une entité comme supprimée lorsque l'utilisateur supprime tous ses éléments
 * @param {string} entityKey - Clé de l'entité dans localStorage (ex: 'schoolAppClasses')
 * @param {Array} data - Données actuelles de l'entité
 */
export const checkForEmptyEntity = (entityKey, data) => {
  const deletedFlagKey = `${entityKey}_deleted`;
  
  // Si les données sont vides ou un tableau vide, marquer comme supprimé
  if (!data || data.length === 0 || JSON.stringify(data) === '[]') {
    console.log(`Entité ${entityKey} marquée comme supprimée`);
    localStorage.setItem(deletedFlagKey, 'true');
  } else {
    // Sinon, marquer comme non supprimé
    localStorage.setItem(deletedFlagKey, 'false');
  }
};

/**
 * Fonction utilitaire pour vider complètement une entité et la marquer comme supprimée
 * @param {string} entityKey - Clé de l'entité dans localStorage (ex: 'schoolAppClasses')
 */
export const clearEntity = (entityKey) => {
  localStorage.setItem(entityKey, '[]');
  localStorage.setItem(`${entityKey}_deleted`, 'true');
  console.log(`Entité ${entityKey} vidée et marquée comme supprimée`);
};

// Exporter d'autres fonctions utiles pour la gestion des suppressions
export default {
  preserveDeletedEntities,
  checkForEmptyEntity,
  clearEntity
};
