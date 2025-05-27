import axios from 'axios';

// Configuration de base d'axios avec gestion d'erreur améliorée
const api = axios.create({
    baseURL: 'http://localhost:8002/api',  // Port 8002 pour le backend Django
    withCredentials: false, // Désactiver les credentials pour éviter les problèmes d'authentification en mode développement
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    timeout: 10000 // Timeout de 10 secondes pour éviter les attentes infinies
});

// Ajouter un log pour chaque URL appelée pour le débogage
console.log('apiService.js chargé avec baseURL:', api.defaults.baseURL);

// Intercepteur pour ajouter automatiquement le préfixe /api/ si nécessaire
api.interceptors.request.use(
    config => {
        // S'assurer que l'URL contient le préfixe /api/
        if (!config.url.startsWith('/')) {
            config.url = '/' + config.url;
        }
        
        // Ajouter des logs pour le débogage
        console.log(`Requête API: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
        
        return config;
    },
    error => {
        console.error('Erreur lors de la préparation de la requête:', error);
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les réponses et les erreurs
api.interceptors.response.use(
    response => {
        // Ajouter des logs pour le débogage
        console.log(`Réponse API: ${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`);
        return response;
    },
    error => {
        // Gestionnaire d'erreur générique
        console.error('API Error:', error);
        
        if (error.response) {
            // La requête a été faite et le serveur a répondu avec un code d'état
            // qui se situe en dehors de la plage de 2xx
            console.error('Response data:', error.response.data);
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
            
            // Si nous avons une erreur 400 (Bad Request), afficher plus de détails
            if (error.response.status === 400) {
                console.error('Validation errors:', error.response.data);
                
                // Afficher un message plus détaillé pour faciliter le débogage
                let errorMessage = 'Erreur de validation: ';
                if (typeof error.response.data === 'object') {
                    // Parcourir toutes les erreurs de validation
                    Object.keys(error.response.data).forEach(key => {
                        const value = error.response.data[key];
                        errorMessage += `\n${key}: ${Array.isArray(value) ? value.join(', ') : value}`;
                        console.error(`- ${key}: ${JSON.stringify(value)}`);
                    });
                    
                    // Ajouter cette information détaillée au message de l'erreur
                    error.message = errorMessage;
                }
            }
            
            // Si nous avons une erreur 403 (Forbidden), afficher des informations spécifiques
            else if (error.response.status === 403) {
                console.error('Erreur 403 Forbidden - Accès refusé:', error.response.data);
                
                // Vérifier le type d'erreur 403
                let errorMessage = 'Accès refusé (403 Forbidden)\n';
                
                // Rechercher la cause spécifique
                if (error.response.data && error.response.data.detail) {
                    errorMessage += error.response.data.detail;
                } else if (typeof error.response.data === 'string') {
                    errorMessage += error.response.data;
                } else {
                    errorMessage += "Vérifiez votre authentification et que le serveur backend est bien lancé sur le port 8002.";
                }
                
                // Conseils pour résoudre le problème
                errorMessage += "\n\nSuggestions pour résoudre ce problème:\n";
                errorMessage += "1. Vérifiez que le serveur Django est bien lancé sur le port 8002\n";
                errorMessage += "2. Assurez-vous que l'utilisateur est authentifié\n";
                errorMessage += "3. Vérifiez la configuration CORS dans le backend Django\n";
                
                // Ajouter cette information détaillée au message de l'erreur
                error.message = errorMessage;
                
                // Afficher une notification visuelle pour l'utilisateur
                const notification = document.createElement('div');
                notification.style.position = 'fixed';
                notification.style.top = '10px';
                notification.style.left = '50%';
                notification.style.transform = 'translateX(-50%)';
                notification.style.backgroundColor = '#f44336';
                notification.style.color = 'white';
                notification.style.padding = '10px 20px';
                notification.style.borderRadius = '5px';
                notification.style.zIndex = '9999';
                notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
                notification.innerHTML = '<strong>Erreur 403: Accès refusé</strong><br>Vérifiez que le serveur Django fonctionne correctement sur le port 8002';
                document.body.appendChild(notification);
                
                // Supprimer la notification après 10 secondes
                setTimeout(() => {
                    notification.style.opacity = '0';
                    notification.style.transition = 'opacity 1s';
                    setTimeout(() => notification.remove(), 1000);
                }, 10000);
            }
            
            // Essayer d'afficher les données envoyées pour le débogage
            try {
                if (error.config && error.config.data) {
                    const sentData = JSON.parse(error.config.data);
                    console.error('Données envoyées:', sentData);
                }
            } catch (e) {
                console.error('Impossible de parser les données envoyées:', e);
            }
        } else if (error.request) {
            // La requête a été faite mais aucune réponse n'a été reçue
            console.error('Erreur de connexion au serveur:', error.message);
            // Afficher une notification à l'utilisateur
            const notification = document.createElement('div');
            notification.style.position = 'fixed';
            notification.style.top = '10px';
            notification.style.left = '50%';
            notification.style.transform = 'translateX(-50%)';
            notification.style.backgroundColor = '#f44336';
            notification.style.color = 'white';
            notification.style.padding = '10px 20px';
            notification.style.borderRadius = '5px';
            notification.style.zIndex = '9999';
            notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
            notification.innerHTML = '<strong>Erreur de connexion à l\'API - Vérifiez que le serveur est en cours d\'exécution</strong>';
            document.body.appendChild(notification);
            
            // Supprimer la notification après 10 secondes
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transition = 'opacity 1s';
                setTimeout(() => notification.remove(), 1000);
            }, 10000);
        } else {
            // Quelque chose s'est passé lors de la configuration de la requête qui a déclenché une erreur
            console.error('Erreur de configuration:', error.message);
        }
        return Promise.reject(error);
    }
);

// Fonction générique pour gérer les requêtes API avec gestion d'erreur améliorée
const handleApiRequest = async (apiCall) => {
    try {
        const response = await apiCall();
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la requête API:', error);
        
        // Afficher des informations plus détaillées pour les erreurs 400
        if (error.response && error.response.status === 400) {
            console.error('===== ERREUR 400 (BAD REQUEST) =====');
            console.error('Pour corriger cette erreur, vérifiez les points suivants:');
            console.error('1. Les champs obligatoires sont-ils tous remplis?');
            console.error('2. Les formats de données sont-ils corrects? (dates, nombres, etc.)');
            console.error('3. Les valeurs numériques sont-elles bien des nombres et non des chaînes?');
            console.error('===================================');
        }
        
        // Propager l'erreur pour que l'appelant puisse la gérer
        throw error;
    }
};

// Services API avec fallback vers localStorage
// Services API avec gestion d'erreur améliorée
const apiServiceImpl = {
    // Classes
    getClasses: () => handleApiRequest(
        () => api.get('/classes/')
    ),
    addClass: (classe) => handleApiRequest(
        () => api.post('/classes/', classe)
    ),
    updateClass: (id, classe) => handleApiRequest(
        () => api.put(`/classes/${id}/`, classe)
    ),
    deleteClass: (id) => handleApiRequest(
        () => api.delete(`/classes/${id}/`)
    ),
    
    // Professeurs
    getProfesseurs: () => handleApiRequest(
        () => api.get('/professeurs/')
    ),
    addProfesseur: (professeur) => handleApiRequest(
        () => api.post('/professeurs/', professeur)
    ),
    updateProfesseur: (id, professeur) => handleApiRequest(
        () => api.put(`/professeurs/${id}/`, professeur)
    ),
    deleteProfesseur: (id) => handleApiRequest(
        () => api.delete(`/professeurs/${id}/`)
    ),
    
    // Matières
    getMatieres: () => handleApiRequest(
        () => api.get('/matieres/')
    ),
    addMatiere: (matiere) => handleApiRequest(
        () => api.post('/matieres/', matiere)
    ),
    updateMatiere: (id, matiere) => handleApiRequest(
        () => api.put(`/matieres/${id}/`, matiere)
    ),
    deleteMatiere: (id) => handleApiRequest(
        () => api.delete(`/matieres/${id}/`)
    ),
    
    // Étudiants
    getEtudiants: () => handleApiRequest(
        () => api.get('/etudiants/')
    ),
    addEtudiant: (etudiant) => handleApiRequest(
        () => api.post('/etudiants/', etudiant)
    ),
    updateEtudiant: (id, etudiant) => handleApiRequest(
        () => api.put(`/etudiants/${id}/`, etudiant)
    ),
    deleteEtudiant: (id) => handleApiRequest(
        () => api.delete(`/etudiants/${id}/`)
    ),
    
    // Notes
    getNotes: () => handleApiRequest(
        () => api.get('/notes/')
    ),
    addNote: (note) => handleApiRequest(
        () => api.post('/notes/', note)
    ),
    updateNote: (id, note) => handleApiRequest(
        () => api.put(`/notes/${id}/`, note)
    ),
    deleteNote: (id) => handleApiRequest(
        () => api.delete(`/notes/${id}/`)
    ),
    
    // Dashboard
    getDashboardStats: () => handleApiRequest(
        () => api.get('/dashboard/admin/')
    ),
    
    // Utilisateurs
    getCurrentUser: () => handleApiRequest(
        () => api.get('/users/current/')
    ),
    
    // Fonction pour tester la connexion API
    testApiConnection: () => {
        return api.get('/classes/')
            .then(() => {
                console.log('✅ Connexion API réussie');
                return { success: true, message: 'Connexion API réussie' };
            })
            .catch(error => {
                console.error('❌ Erreur de connexion API:', error);
                return { success: false, message: 'Erreur de connexion API', error };
            });
    }
};

// Exporter apiService pour la nouvelle implémentation
export const apiService = apiServiceImpl;

// Exporter les services individuels pour la compatibilité avec le code existant
export const classeService = {
    getClasses: apiServiceImpl.getClasses,
    getAll: apiServiceImpl.getClasses, // Ajout de l'alias 'getAll' pour compatibilité
    createClasse: apiServiceImpl.addClass,
    create: apiServiceImpl.addClass, // Ajout de l'alias 'create' pour compatibilité
    updateClasse: apiServiceImpl.updateClass,
    update: apiServiceImpl.updateClass, // Ajout de l'alias 'update' pour compatibilité
    deleteClasse: apiServiceImpl.deleteClass,
    delete: apiServiceImpl.deleteClass // Ajout de l'alias 'delete' pour compatibilité
};

export const professeurService = {
    getProfesseurs: apiServiceImpl.getProfesseurs,
    getAll: apiServiceImpl.getProfesseurs, // Ajout de l'alias 'getAll' pour compatibilité
    createProfesseur: apiServiceImpl.addProfesseur,
    create: apiServiceImpl.addProfesseur, // Ajout de l'alias 'create' pour compatibilité
    updateProfesseur: apiServiceImpl.updateProfesseur,
    update: apiServiceImpl.updateProfesseur, // Ajout de l'alias 'update' pour compatibilité
    deleteProfesseur: apiServiceImpl.deleteProfesseur,
    delete: apiServiceImpl.deleteProfesseur // Ajout de l'alias 'delete' pour compatibilité
};

export const matiereService = {
    getMatieres: apiServiceImpl.getMatieres,
    getAll: apiServiceImpl.getMatieres, // Ajout de l'alias 'getAll' pour compatibilité
    createMatiere: apiServiceImpl.addMatiere,
    create: apiServiceImpl.addMatiere, // Ajout de l'alias 'create' pour compatibilité
    updateMatiere: apiServiceImpl.updateMatiere,
    update: apiServiceImpl.updateMatiere, // Ajout de l'alias 'update' pour compatibilité
    deleteMatiere: apiServiceImpl.deleteMatiere,
    delete: apiServiceImpl.deleteMatiere // Ajout de l'alias 'delete' pour compatibilité
};

export const etudiantService = {
    getEtudiants: apiServiceImpl.getEtudiants,
    getAll: apiServiceImpl.getEtudiants, // Ajout de l'alias 'getAll' pour compatibilité
    createEtudiant: apiServiceImpl.addEtudiant,
    create: apiServiceImpl.addEtudiant, // Ajout de l'alias 'create' pour compatibilité
    updateEtudiant: apiServiceImpl.updateEtudiant,
    update: apiServiceImpl.updateEtudiant, // Ajout de l'alias 'update' pour compatibilité
    deleteEtudiant: apiServiceImpl.deleteEtudiant,
    delete: apiServiceImpl.deleteEtudiant // Ajout de l'alias 'delete' pour compatibilité
};

// Créer une instance axios séparée pour accéder aux routes proxy sans authentification
const proxyApi = axios.create({
    baseURL: 'http://localhost:8002/api/proxy',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    timeout: 10000
});

// Log pour débogage
console.log('proxyApi configuré avec baseURL:', proxyApi.defaults.baseURL);

// Fonction de gestion des requêtes proxy sans authentification
const handleProxyRequest = async (apiCall) => {
    try {
        console.log('Appel API proxy en cours...');
        const response = await apiCall();
        console.log('Réponse API proxy reçue:', response.status);
        return response.data;
    } catch (error) {
        console.error('Erreur API proxy:', error.message);
        // Afficher les détails pour débogage
        if (error.response) {
            console.error('Détails erreur:', error.response.status, error.response.data);
        }
        throw error;
    }
};

export const coursService = {
    getCours: () => handleProxyRequest(
        () => proxyApi.get('/cours/')
    ),
    getAll: () => handleProxyRequest(
        () => proxyApi.get('/cours/')
    ),
    createCours: (cours) => handleProxyRequest(
        () => proxyApi.post('/cours/create/', cours)
    ),
    create: (cours) => handleProxyRequest(
        () => proxyApi.post('/cours/create/', cours)
    ),
    updateCours: (id, cours) => handleProxyRequest(
        () => proxyApi.put(`/cours/${id}/update/`, cours)
    ),
    update: (id, cours) => handleProxyRequest(
        () => proxyApi.put(`/cours/${id}/update/`, cours)
    ),
    deleteCours: (id) => handleProxyRequest(
        () => proxyApi.delete(`/cours/${id}/delete/`)
    ),
    delete: (id) => handleProxyRequest(
        () => proxyApi.delete(`/cours/${id}/delete/`)
    )
};

export const dashboardService = {
    getStats: apiServiceImpl.getDashboardStats,
    getAdminStats: apiServiceImpl.getDashboardStats // Ajout de cette méthode pour compatibilité avec le dashboard
};

export const userService = {
    getCurrentUser: apiServiceImpl.getCurrentUser,
    testConnection: apiServiceImpl.testApiConnection
};

export const noteService = {
    getNotes: apiServiceImpl.getNotes,
    getAll: apiServiceImpl.getNotes, // Ajout de l'alias 'getAll' pour compatibilité
    createNote: apiServiceImpl.addNote,
    create: apiServiceImpl.addNote, // Ajout de l'alias 'create' pour compatibilité
    updateNote: apiServiceImpl.updateNote,
    update: apiServiceImpl.updateNote, // Ajout de l'alias 'update' pour compatibilité
    deleteNote: apiServiceImpl.deleteNote,
    delete: apiServiceImpl.deleteNote // Ajout de l'alias 'delete' pour compatibilité
};

// Exporter l'API pour les utilisations directes
export default api;
