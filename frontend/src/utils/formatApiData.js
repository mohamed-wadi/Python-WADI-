/**
 * Utilitaire pour formater les données avant de les envoyer à l'API
 * Assure la compatibilité entre le frontend et le backend
 */

/**
 * Formate les données d'un professeur pour l'envoi à l'API
 * @param {Object} data - Les données du professeur à formater
 * @returns {Object} - Les données formatées pour l'API
 */
export const formatProfesseurData = (data) => {
  const formattedData = { ...data };
  
  // Vérifier que les filières sont présentes et les formater correctement
  if (formattedData.filieres) {
    // Si c'est un tableau, le convertir en chaîne
    if (Array.isArray(formattedData.filieres)) {
      // S'assurer que le tableau n'est pas vide
      if (formattedData.filieres.length > 0) {
        formattedData.filieres = formattedData.filieres.join(',');
      } else {
        // Si le tableau est vide, mettre une valeur par défaut
        formattedData.filieres = 'IIR';
      }
    }
    // Si c'est déjà une chaîne, s'assurer qu'elle n'est pas vide
    else if (typeof formattedData.filieres === 'string' && !formattedData.filieres.trim()) {
      formattedData.filieres = 'IIR';
    }
  } else {
    // Si les filières sont absentes, définir une valeur par défaut
    formattedData.filieres = 'IIR';
  }
  
  // Traiter les niveaux d'enseignement avec la même logique
  if (formattedData.niveaux) {
    if (Array.isArray(formattedData.niveaux)) {
      if (formattedData.niveaux.length > 0) {
        formattedData.niveaux_enseignes = formattedData.niveaux.join(',');
      } else {
        formattedData.niveaux_enseignes = '1,2,3';
      }
    } else if (typeof formattedData.niveaux === 'string') {
      formattedData.niveaux_enseignes = formattedData.niveaux;
    }
  } else {
    formattedData.niveaux_enseignes = '1,2,3';
  }
  
  // S'assurer que le champ niveaux_enseignes existe et supprimer niveaux
  if (!formattedData.niveaux_enseignes) {
    formattedData.niveaux_enseignes = '1,2,3';
  }
  
  // Créer un duplicata des filières et niveaux pour l'affichage dans l'interface
  // Ces champs seront utilisés uniquement pour l'affichage dans le tableau, pas pour l'API
  formattedData.filieres_list = formattedData.filieres;
  
  // Supprimer le champ niveaux car le backend attend niveaux_enseignes
  delete formattedData.niveaux;
  
  console.log('Données formatées pour l\'API:', formattedData);
  return formattedData;
};

/**
 * Transforme les données d'un professeur reçues de l'API pour utilisation dans le frontend
 * @param {Object} professeur - Les données du professeur reçues de l'API
 * @returns {Object} - Les données transformées pour le frontend
 */
export const transformProfesseurFromApi = (professeur) => {
  if (!professeur) return null;
  
  const transformed = { ...professeur };
  
  // Vérifier si nous avons reçu des données de filières du backend
  // Essayer plusieurs sources possibles dans l'ordre de priorité
  let filieresSource = null;
  if (transformed.filieres_list) {
    filieresSource = transformed.filieres_list; // Utiliser la liste préformatée si disponible
  } else if (transformed.filieres) {
    filieresSource = transformed.filieres; // Sinon utiliser le champ standard
  }
  
  // Convertir les filières de chaîne en tableau
  if (typeof filieresSource === 'string' && filieresSource) {
    transformed.filieres = filieresSource.split(',').map(f => f.trim()).filter(f => f);
  } else if (Array.isArray(filieresSource)) {
    // Déjà au bon format
    transformed.filieres = filieresSource.filter(f => f);
  } else {
    // Par défaut, au moins un élément
    transformed.filieres = ['IIR'];
  }
  
  // Traitement similaire pour les niveaux
  let niveauxSource = null;
  if (transformed.niveaux) {
    niveauxSource = transformed.niveaux; // Déjà au bon format pour l'affichage
  } else if (transformed.niveaux_enseignes) {
    niveauxSource = transformed.niveaux_enseignes; // Format du backend
  }
  
  // Convertir les niveaux d'enseignement de chaîne en tableau
  if (typeof niveauxSource === 'string' && niveauxSource) {
    transformed.niveaux = niveauxSource.split(',').map(n => n.trim()).filter(n => n);
  } else if (Array.isArray(niveauxSource)) {
    transformed.niveaux = niveauxSource.filter(n => n);
  } else {
    // Par défaut, quelques niveaux
    transformed.niveaux = ['1', '2', '3'];
  }
  
  // S'assurer que les tableaux sont bien formatés pour éviter les erreurs dans l'interface
  if (!Array.isArray(transformed.filieres) || transformed.filieres.length === 0) {
    transformed.filieres = ['IIR'];
  }
  
  if (!Array.isArray(transformed.niveaux) || transformed.niveaux.length === 0) {
    transformed.niveaux = ['1', '2', '3'];
  }
  
  // Log pour débogage
  console.log('Professeur transformé pour le frontend:', {
    original: professeur,
    transformed: transformed
  });
  
  return transformed;
};

export default {
  formatProfesseurData,
  transformProfesseurFromApi
};
