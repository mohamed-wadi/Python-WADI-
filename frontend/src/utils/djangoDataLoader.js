import axios from 'axios';

const API_URL = 'http://localhost:8002/api';

/**
 * Charge les données depuis le backend Django et les stocke dans localStorage
 * Priorité aux données locales si elles existent (pour conserver les modifications non synchronisées)
 */
export const loadDjangoData = async () => {
    try {
        console.log('Chargement des données depuis Django...');
        await Promise.all([
            loadProfesseurs(),
            loadClasses(),
            loadEtudiants(),
            loadMatieres(),
            loadNotes(),
            loadCours()
        ]);
        console.log('Données Django chargées avec succès');
        return true;
    } catch (error) {
        console.error('Erreur lors du chargement des données Django:', error);
        return false;
    }
};

const loadProfesseurs = async () => {
    try {
        // Vérifier si des données locales existent déjà
        const localData = localStorage.getItem('schoolAppProfesseurs');
        
        // Récupérer les données depuis Django
        const response = await axios.get(`${API_URL}/professeurs/`);
        if (response.data && Array.isArray(response.data)) {
            // Si aucune donnée locale n'existe, utiliser les données Django
            if (!localData) {
                localStorage.setItem('schoolAppProfesseurs', JSON.stringify(response.data));
                console.log('Professeurs chargés depuis Django');
            } else {
                // Fusionner les données Django avec les données locales (priorité locale)
                mergeData('schoolAppProfesseurs', response.data);
            }
        }
    } catch (error) {
        console.error('Erreur lors du chargement des professeurs:', error);
    }
};

const loadClasses = async () => {
    try {
        const localData = localStorage.getItem('schoolAppClasses');
        const response = await axios.get(`${API_URL}/classes/`);
        if (response.data && Array.isArray(response.data)) {
            if (!localData) {
                localStorage.setItem('schoolAppClasses', JSON.stringify(response.data));
                localStorage.setItem('schoolAppClasses_backup', JSON.stringify(response.data));
                console.log('Classes chargées depuis Django');
            } else {
                mergeData('schoolAppClasses', response.data);
            }
        }
    } catch (error) {
        console.error('Erreur lors du chargement des classes:', error);
    }
};

const loadEtudiants = async () => {
    try {
        const localData = localStorage.getItem('schoolAppEtudiants');
        const response = await axios.get(`${API_URL}/etudiants/`);
        if (response.data && Array.isArray(response.data)) {
            if (!localData) {
                localStorage.setItem('schoolAppEtudiants', JSON.stringify(response.data));
                console.log('Etudiants chargés depuis Django');
            } else {
                mergeData('schoolAppEtudiants', response.data);
            }
        }
    } catch (error) {
        console.error('Erreur lors du chargement des étudiants:', error);
    }
};

const loadMatieres = async () => {
    try {
        const localData = localStorage.getItem('schoolAppMatieres');
        const response = await axios.get(`${API_URL}/matieres/`);
        if (response.data && Array.isArray(response.data)) {
            if (!localData) {
                localStorage.setItem('schoolAppMatieres', JSON.stringify(response.data));
                console.log('Matières chargées depuis Django');
            } else {
                mergeData('schoolAppMatieres', response.data);
            }
        }
    } catch (error) {
        console.error('Erreur lors du chargement des matières:', error);
    }
};

const loadNotes = async () => {
    try {
        const localData = localStorage.getItem('schoolAppNotes');
        const response = await axios.get(`${API_URL}/notes/`);
        if (response.data && Array.isArray(response.data)) {
            if (!localData) {
                localStorage.setItem('schoolAppNotes', JSON.stringify(response.data));
                console.log('Notes chargées depuis Django');
            } else {
                mergeData('schoolAppNotes', response.data);
            }
        }
    } catch (error) {
        console.error('Erreur lors du chargement des notes:', error);
    }
};

const loadCours = async () => {
    try {
        const localData = localStorage.getItem('schoolAppCours');
        const response = await axios.get(`${API_URL}/cours/`);
        if (response.data && Array.isArray(response.data)) {
            if (!localData) {
                localStorage.setItem('schoolAppCours', JSON.stringify(response.data));
                console.log('Cours chargés depuis Django');
            } else {
                mergeData('schoolAppCours', response.data);
            }
        }
    } catch (error) {
        console.error('Erreur lors du chargement des cours:', error);
    }
};

/**
 * Fusion intelligente des données Django avec les données locales
 * Les données locales ont la priorité, mais les nouvelles données Django sont ajoutées
 */
const mergeData = (storageKey, djangoData) => {
    try {
        const localData = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const localIds = new Set(localData.map(item => item.id));
        
        // Identifier les éléments Django qui n'existent pas localement
        const newDjangoItems = djangoData.filter(item => !localIds.has(item.id));
        
        // Fusionner les données locales avec les nouvelles données Django
        const mergedData = [...localData, ...newDjangoItems];
        
        // Enregistrer les données fusionnées
        localStorage.setItem(storageKey, JSON.stringify(mergedData));
        
        // Pour les classes, maintenir la sauvegarde
        if (storageKey === 'schoolAppClasses') {
            localStorage.setItem('schoolAppClasses_backup', JSON.stringify(mergedData));
        }
        
        console.log(`${storageKey} fusionné: ${newDjangoItems.length} nouveaux éléments ajoutés`);
    } catch (error) {
        console.error(`Erreur lors de la fusion des données ${storageKey}:`, error);
    }
};

/**
 * Synchronisation automatique des données locales vers Django
 */
export const setupAutoSync = () => {
    // Synchroniser au démarrage
    syncLocalDataToDjango();
    
    // Puis toutes les 5 minutes
    setInterval(syncLocalDataToDjango, 5 * 60 * 1000);
    
    // Ajouter un écouteur pour synchroniser avant de quitter la page
    window.addEventListener('beforeunload', syncLocalDataToDjango);
};

const syncLocalDataToDjango = async () => {
    try {
        // Importer dynamiquement le service de synchronisation
        const syncService = await import('./syncService');
        
        // Synchroniser toutes les entités
        await Promise.all([
            syncService.syncProfesseurs(),
            syncService.syncClasses(),
            syncService.syncEtudiants(),
            syncService.syncMatieres(),
            syncService.syncNotes(),
            syncService.syncCours()
        ]);
        
        console.log('Synchronisation automatique vers Django effectuée');
    } catch (error) {
        console.error('Erreur lors de la synchronisation automatique:', error);
    }
};
