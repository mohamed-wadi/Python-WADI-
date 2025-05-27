/**
 * Service pour gérer temporairement les données via localStorage
 * Solution de contournement pour les problèmes d'API
 */

// Préfixes de stockage pour les différentes entités
const STORAGE_KEYS = {
  CLASSES: 'app_classes',
  LAST_ID: 'app_last_id'
};

// Obtenir un nouvel ID unique
const getNextId = () => {
  const lastId = localStorage.getItem(STORAGE_KEYS.LAST_ID) || '0';
  const nextId = parseInt(lastId, 10) + 1;
  localStorage.setItem(STORAGE_KEYS.LAST_ID, nextId.toString());
  return nextId;
};

// Récupérer toutes les données d'un type d'entité
const getAll = (entityKey) => {
  try {
    const data = localStorage.getItem(entityKey);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Erreur lors de la récupération des données ${entityKey}:`, error);
    return [];
  }
};

// Sauvegarder toutes les données d'un type d'entité
const saveAll = (entityKey, data) => {
  try {
    localStorage.setItem(entityKey, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Erreur lors de la sauvegarde des données ${entityKey}:`, error);
    return false;
  }
};

// Récupérer une entité par son ID
const getById = (entityKey, id) => {
  const allItems = getAll(entityKey);
  return allItems.find(item => item.id === parseInt(id, 10) || item.id === id);
};

// Ajouter une nouvelle entité
const add = (entityKey, data) => {
  const allItems = getAll(entityKey);
  const newItem = {
    ...data,
    id: getNextId()
  };
  
  allItems.push(newItem);
  saveAll(entityKey, allItems);
  return newItem;
};

// Mettre à jour une entité existante
const update = (entityKey, id, data) => {
  const allItems = getAll(entityKey);
  const index = allItems.findIndex(item => item.id === parseInt(id, 10) || item.id === id);
  
  if (index === -1) {
    console.error(`Entité avec l'ID ${id} non trouvée`);
    return null;
  }
  
  const updatedItem = {
    ...allItems[index],
    ...data,
    id: allItems[index].id // Conserver l'ID original
  };
  
  allItems[index] = updatedItem;
  saveAll(entityKey, allItems);
  return updatedItem;
};

// Supprimer une entité
const remove = (entityKey, id) => {
  const allItems = getAll(entityKey);
  const filteredItems = allItems.filter(item => item.id !== parseInt(id, 10) && item.id !== id);
  
  if (filteredItems.length === allItems.length) {
    console.error(`Entité avec l'ID ${id} non trouvée`);
    return false;
  }
  
  saveAll(entityKey, filteredItems);
  return true;
};

// Service pour les classes
export const classeLocalService = {
  getAll: () => getAll(STORAGE_KEYS.CLASSES),
  getById: (id) => getById(STORAGE_KEYS.CLASSES, id),
  add: (data) => add(STORAGE_KEYS.CLASSES, data),
  update: (id, data) => update(STORAGE_KEYS.CLASSES, id, data),
  remove: (id) => remove(STORAGE_KEYS.CLASSES, id),
};

// Autres services pour d'autres entités peuvent être ajoutés ici
