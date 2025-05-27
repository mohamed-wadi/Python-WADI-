import os
import django
import sys
import socket
import time
import pymysql

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

try:
    django.setup()
    from django.db import connection, transaction
    from base.models import Classe, Matiere, Professeur, Etudiant
    DJANGO_SETUP_SUCCESS = True
except Exception as e:
    print(f"Erreur lors de l'initialisation de Django: {e}")
    DJANGO_SETUP_SUCCESS = False

def test_mysql_connection():
    """
    Teste la connexion à MySQL et retourne True si la connexion est établie, False sinon.
    """
    try:
        # Récupérer les paramètres de connexion depuis settings.py
        from backend.settings import DATABASES
        db_settings = DATABASES['default']
        
        # Tester la connexion
        connection = pymysql.connect(
            host=db_settings['HOST'],
            user=db_settings['USER'],
            password=db_settings['PASSWORD'],
            port=int(db_settings.get('PORT', 3306)),
            connect_timeout=5
        )
        connection.close()
        return True
    except Exception as e:
        print(f"Erreur de connexion MySQL: {e}")
        return False

def create_fallback_mode():
    """
    Crée un fichier JavaScript qui active le mode de secours (fallback) vers localStorage.
    """
    fallback_js = """
// fallback_mode.js - Créé automatiquement par fix_api_fallback.py
// Ce fichier active le mode de secours (localStorage) quand l'API est indisponible

(function() {
    // Fonction pour activer le mode de secours
    function activateFallbackMode() {
        console.log("🚨 API indisponible - Activation du mode de secours (localStorage)");
        
        // Stocker l'état du mode de secours
        localStorage.setItem('apiUnavailable', 'true');
        
        // Créer des données de démonstration si nécessaire
        if (!localStorage.getItem('schoolAppClasses')) {
            const defaultClasses = [
                { id: 1, nom: "Classe ING1-A", niveau: 1, capacite: 30 },
                { id: 2, nom: "Classe ING2-A", niveau: 2, capacite: 25 },
                { id: 3, nom: "Classe ING3-A", niveau: 3, capacite: 20 },
                { id: 4, nom: "Classe ING4-A", niveau: 4, capacite: 15 },
                { id: 5, nom: "Classe ING5-A", niveau: 5, capacite: 10 }
            ];
            localStorage.setItem('schoolAppClasses', JSON.stringify(defaultClasses));
        }
        
        if (!localStorage.getItem('schoolAppProfesseurs')) {
            const defaultProfesseurs = [
                { id: 1, nom: "Dupont", prenom: "Jean", email: "jean.dupont@example.com", telephone: "0123456789", filieres: "ING1,ING2" },
                { id: 2, nom: "Martin", prenom: "Sophie", email: "sophie.martin@example.com", telephone: "0234567890", filieres: "ING3,ING4,ING5" }
            ];
            localStorage.setItem('schoolAppProfesseurs', JSON.stringify(defaultProfesseurs));
        }
        
        if (!localStorage.getItem('schoolAppMatieres')) {
            const defaultMatieres = [
                { id: 1, nom: "Mathématiques", coefficient: 3, professeur: 1, description: "Cours de mathématiques" },
                { id: 2, nom: "Physique", coefficient: 2, professeur: 2, description: "Cours de physique" },
                { id: 3, nom: "Informatique", coefficient: 4, professeur: 1, description: "Cours d'informatique" }
            ];
            localStorage.setItem('schoolAppMatieres', JSON.stringify(defaultMatieres));
        }
        
        if (!localStorage.getItem('schoolAppEtudiants')) {
            const defaultEtudiants = [
                { id: 1, nom: "Lefebvre", prenom: "Thomas", email: "thomas.lefebvre@example.com", date_naissance: "2000-05-15", classe: 1 },
                { id: 2, nom: "Dubois", prenom: "Marie", email: "marie.dubois@example.com", date_naissance: "2001-08-22", classe: 2 }
            ];
            localStorage.setItem('schoolAppEtudiants', JSON.stringify(defaultEtudiants));
        }
        
        // Afficher un message à l'utilisateur
        const notification = document.createElement('div');
        notification.style.position = 'fixed';
        notification.style.top = '10px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.backgroundColor = '#ff9800';
        notification.style.color = 'white';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '5px';
        notification.style.zIndex = '9999';
        notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        notification.innerHTML = '<strong>Connexion à l\'API impossible - Mode démonstration activé</strong>';
        document.body.appendChild(notification);
        
        // Supprimer la notification après 10 secondes
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 1s';
            setTimeout(() => notification.remove(), 1000);
        }, 10000);
    }
    
    // Fonction pour tester la connexion à l'API
    function testApiConnection() {
        fetch('http://localhost:8002/api/classes/')
            .then(response => {
                if (response.ok) {
                    console.log("✅ Connexion API réussie");
                    localStorage.removeItem('apiUnavailable');
                } else {
                    console.error("❌ Erreur API:", response.status);
                    activateFallbackMode();
                }
            })
            .catch(error => {
                console.error("❌ Connexion API impossible:", error);
                activateFallbackMode();
            });
    }
    
    // Tester la connexion à l'API au chargement de la page
    window.addEventListener('DOMContentLoaded', () => {
        // Attendre un peu pour s'assurer que la page est chargée
        setTimeout(testApiConnection, 1000);
    });
    
    // Exposer une fonction globale pour activer/désactiver le mode de secours
    window.toggleFallbackMode = function(activate) {
        if (activate) {
            activateFallbackMode();
        } else {
            localStorage.removeItem('apiUnavailable');
            location.reload();
        }
    };
})();
"""
    
    # Créer le répertoire frontend/public s'il n'existe pas
    frontend_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', 'public')
    os.makedirs(frontend_dir, exist_ok=True)
    
    # Écrire le fichier JavaScript
    fallback_path = os.path.join(frontend_dir, 'fallback_mode.js')
    with open(fallback_path, 'w', encoding='utf-8') as f:
        f.write(fallback_js)
    
    print(f"✅ Fichier fallback_mode.js créé: {fallback_path}")
    
    # Modifier index.html pour inclure le script
    index_path = os.path.join(frontend_dir, 'index.html')
    if os.path.exists(index_path):
        with open(index_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if '<script src="%PUBLIC_URL%/fallback_mode.js"></script>' not in content:
            # Ajouter le script juste avant la fermeture de la balise head
            modified = content.replace('</head>', '  <script src="%PUBLIC_URL%/fallback_mode.js"></script>\n  </head>')
            
            with open(index_path, 'w', encoding='utf-8') as f:
                f.write(modified)
            
            print(f"✅ Script fallback_mode.js ajouté à index.html")
        else:
            print("ℹ️ Script fallback_mode.js déjà présent dans index.html")
    else:
        print(f"⚠️ Fichier index.html non trouvé: {index_path}")

def modify_api_service():
    """
    Modifie le service API pour utiliser le mode de secours si nécessaire.
    """
    # Chercher le fichier apiService.js
    frontend_src = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', 'src')
    api_service_path = None
    
    for root, dirs, files in os.walk(frontend_src):
        if 'apiService.js' in files:
            api_service_path = os.path.join(root, 'apiService.js')
            break
    
    if not api_service_path:
        print("⚠️ Fichier apiService.js non trouvé")
        return
    
    with open(api_service_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Vérifier si le code de fallback est déjà présent
    if 'localStorage.getItem(\'apiUnavailable\')' in content:
        print("ℹ️ Mode de secours déjà présent dans apiService.js")
        return
    
    # Modifier le service API pour utiliser le mode de secours
    modified_content = """import axios from 'axios';

// Configuration de base d'axios
const api = axios.create({
    baseURL: 'http://localhost:8002/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Intercepteur pour vérifier si le mode de secours est activé
api.interceptors.request.use(
    config => {
        // Si le mode de secours est activé, rejeter la requête
        if (localStorage.getItem('apiUnavailable') === 'true') {
            return Promise.reject(new Error('API_UNAVAILABLE'));
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Fonction générique pour gérer les requêtes API avec fallback vers localStorage
const handleApiRequest = async (apiCall, entityType, fallbackData = null) => {
    try {
        const response = await apiCall();
        return response.data;
    } catch (error) {
        if (error.message === 'API_UNAVAILABLE' || error.code === 'ERR_NETWORK') {
            console.warn(`API indisponible pour ${entityType}, utilisation du localStorage`);
            
            // Récupérer les données depuis localStorage
            const localData = localStorage.getItem(`schoolApp${entityType}`);
            if (localData) {
                return JSON.parse(localData);
            }
            
            // Si pas de données en localStorage et des données de fallback sont fournies
            if (fallbackData) {
                localStorage.setItem(`schoolApp${entityType}`, JSON.stringify(fallbackData));
                return fallbackData;
            }
            
            return [];
        }
        throw error;
    }
};

// Services API avec fallback vers localStorage
export const apiService = {
    // Classes
    getClasses: () => handleApiRequest(
        () => api.get('/classes/'),
        'Classes',
        [
            { id: 1, nom: "Classe ING1-A", niveau: 1, capacite: 30 },
            { id: 2, nom: "Classe ING2-A", niveau: 2, capacite: 25 },
            { id: 3, nom: "Classe ING3-A", niveau: 3, capacite: 20 },
            { id: 4, nom: "Classe ING4-A", niveau: 4, capacite: 15 },
            { id: 5, nom: "Classe ING5-A", niveau: 5, capacite: 10 }
        ]
    ),
    addClass: (classe) => {
        if (localStorage.getItem('apiUnavailable') === 'true') {
            const classes = JSON.parse(localStorage.getItem('schoolAppClasses') || '[]');
            const newId = classes.length > 0 ? Math.max(...classes.map(c => c.id)) + 1 : 1;
            const newClasse = { ...classe, id: newId };
            classes.push(newClasse);
            localStorage.setItem('schoolAppClasses', JSON.stringify(classes));
            return Promise.resolve(newClasse);
        }
        return api.post('/classes/', classe).then(response => response.data);
    },
    updateClass: (id, classe) => {
        if (localStorage.getItem('apiUnavailable') === 'true') {
            const classes = JSON.parse(localStorage.getItem('schoolAppClasses') || '[]');
            const index = classes.findIndex(c => c.id === id);
            if (index !== -1) {
                classes[index] = { ...classes[index], ...classe };
                localStorage.setItem('schoolAppClasses', JSON.stringify(classes));
                return Promise.resolve(classes[index]);
            }
            return Promise.reject(new Error('Classe non trouvée'));
        }
        return api.put(`/classes/${id}/`, classe).then(response => response.data);
    },
    deleteClass: (id) => {
        if (localStorage.getItem('apiUnavailable') === 'true') {
            const classes = JSON.parse(localStorage.getItem('schoolAppClasses') || '[]');
            const newClasses = classes.filter(c => c.id !== id);
            localStorage.setItem('schoolAppClasses', JSON.stringify(newClasses));
            return Promise.resolve({ success: true });
        }
        return api.delete(`/classes/${id}/`).then(response => response.data);
    },
    
    // Professeurs
    getProfesseurs: () => handleApiRequest(
        () => api.get('/professeurs/'),
        'Professeurs',
        [
            { id: 1, nom: "Dupont", prenom: "Jean", email: "jean.dupont@example.com", telephone: "0123456789", filieres: "ING1,ING2" },
            { id: 2, nom: "Martin", prenom: "Sophie", email: "sophie.martin@example.com", telephone: "0234567890", filieres: "ING3,ING4,ING5" }
        ]
    ),
    addProfesseur: (professeur) => {
        if (localStorage.getItem('apiUnavailable') === 'true') {
            const professeurs = JSON.parse(localStorage.getItem('schoolAppProfesseurs') || '[]');
            const newId = professeurs.length > 0 ? Math.max(...professeurs.map(p => p.id)) + 1 : 1;
            const newProfesseur = { ...professeur, id: newId };
            professeurs.push(newProfesseur);
            localStorage.setItem('schoolAppProfesseurs', JSON.stringify(professeurs));
            return Promise.resolve(newProfesseur);
        }
        return api.post('/professeurs/', professeur).then(response => response.data);
    },
    updateProfesseur: (id, professeur) => {
        if (localStorage.getItem('apiUnavailable') === 'true') {
            const professeurs = JSON.parse(localStorage.getItem('schoolAppProfesseurs') || '[]');
            const index = professeurs.findIndex(p => p.id === id);
            if (index !== -1) {
                professeurs[index] = { ...professeurs[index], ...professeur };
                localStorage.setItem('schoolAppProfesseurs', JSON.stringify(professeurs));
                return Promise.resolve(professeurs[index]);
            }
            return Promise.reject(new Error('Professeur non trouvé'));
        }
        return api.put(`/professeurs/${id}/`, professeur).then(response => response.data);
    },
    deleteProfesseur: (id) => {
        if (localStorage.getItem('apiUnavailable') === 'true') {
            const professeurs = JSON.parse(localStorage.getItem('schoolAppProfesseurs') || '[]');
            const newProfesseurs = professeurs.filter(p => p.id !== id);
            localStorage.setItem('schoolAppProfesseurs', JSON.stringify(newProfesseurs));
            return Promise.resolve({ success: true });
        }
        return api.delete(`/professeurs/${id}/`).then(response => response.data);
    },
    
    // Matières
    getMatieres: () => handleApiRequest(
        () => api.get('/matieres/'),
        'Matieres',
        [
            { id: 1, nom: "Mathématiques", coefficient: 3, professeur: 1, description: "Cours de mathématiques" },
            { id: 2, nom: "Physique", coefficient: 2, professeur: 2, description: "Cours de physique" },
            { id: 3, nom: "Informatique", coefficient: 4, professeur: 1, description: "Cours d'informatique" }
        ]
    ),
    addMatiere: (matiere) => {
        if (localStorage.getItem('apiUnavailable') === 'true') {
            const matieres = JSON.parse(localStorage.getItem('schoolAppMatieres') || '[]');
            const newId = matieres.length > 0 ? Math.max(...matieres.map(m => m.id)) + 1 : 1;
            const newMatiere = { ...matiere, id: newId };
            matieres.push(newMatiere);
            localStorage.setItem('schoolAppMatieres', JSON.stringify(matieres));
            return Promise.resolve(newMatiere);
        }
        return api.post('/matieres/', matiere).then(response => response.data);
    },
    updateMatiere: (id, matiere) => {
        if (localStorage.getItem('apiUnavailable') === 'true') {
            const matieres = JSON.parse(localStorage.getItem('schoolAppMatieres') || '[]');
            const index = matieres.findIndex(m => m.id === id);
            if (index !== -1) {
                matieres[index] = { ...matieres[index], ...matiere };
                localStorage.setItem('schoolAppMatieres', JSON.stringify(matieres));
                return Promise.resolve(matieres[index]);
            }
            return Promise.reject(new Error('Matière non trouvée'));
        }
        return api.put(`/matieres/${id}/`, matiere).then(response => response.data);
    },
    deleteMatiere: (id) => {
        if (localStorage.getItem('apiUnavailable') === 'true') {
            const matieres = JSON.parse(localStorage.getItem('schoolAppMatieres') || '[]');
            const newMatieres = matieres.filter(m => m.id !== id);
            localStorage.setItem('schoolAppMatieres', JSON.stringify(newMatieres));
            return Promise.resolve({ success: true });
        }
        return api.delete(`/matieres/${id}/`).then(response => response.data);
    },
    
    // Étudiants
    getEtudiants: () => handleApiRequest(
        () => api.get('/etudiants/'),
        'Etudiants',
        [
            { id: 1, nom: "Lefebvre", prenom: "Thomas", email: "thomas.lefebvre@example.com", date_naissance: "2000-05-15", classe: 1 },
            { id: 2, nom: "Dubois", prenom: "Marie", email: "marie.dubois@example.com", date_naissance: "2001-08-22", classe: 2 }
        ]
    ),
    addEtudiant: (etudiant) => {
        if (localStorage.getItem('apiUnavailable') === 'true') {
            const etudiants = JSON.parse(localStorage.getItem('schoolAppEtudiants') || '[]');
            const newId = etudiants.length > 0 ? Math.max(...etudiants.map(e => e.id)) + 1 : 1;
            const newEtudiant = { ...etudiant, id: newId };
            etudiants.push(newEtudiant);
            localStorage.setItem('schoolAppEtudiants', JSON.stringify(etudiants));
            return Promise.resolve(newEtudiant);
        }
        return api.post('/etudiants/', etudiant).then(response => response.data);
    },
    updateEtudiant: (id, etudiant) => {
        if (localStorage.getItem('apiUnavailable') === 'true') {
            const etudiants = JSON.parse(localStorage.getItem('schoolAppEtudiants') || '[]');
            const index = etudiants.findIndex(e => e.id === id);
            if (index !== -1) {
                etudiants[index] = { ...etudiants[index], ...etudiant };
                localStorage.setItem('schoolAppEtudiants', JSON.stringify(etudiants));
                return Promise.resolve(etudiants[index]);
            }
            return Promise.reject(new Error('Étudiant non trouvé'));
        }
        return api.put(`/etudiants/${id}/`, etudiant).then(response => response.data);
    },
    deleteEtudiant: (id) => {
        if (localStorage.getItem('apiUnavailable') === 'true') {
            const etudiants = JSON.parse(localStorage.getItem('schoolAppEtudiants') || '[]');
            const newEtudiants = etudiants.filter(e => e.id !== id);
            localStorage.setItem('schoolAppEtudiants', JSON.stringify(newEtudiants));
            return Promise.resolve({ success: true });
        }
        return api.delete(`/etudiants/${id}/`).then(response => response.data);
    },
    
    // Dashboard
    getDashboardStats: () => {
        if (localStorage.getItem('apiUnavailable') === 'true') {
            const classes = JSON.parse(localStorage.getItem('schoolAppClasses') || '[]');
            const professeurs = JSON.parse(localStorage.getItem('schoolAppProfesseurs') || '[]');
            const matieres = JSON.parse(localStorage.getItem('schoolAppMatieres') || '[]');
            const etudiants = JSON.parse(localStorage.getItem('schoolAppEtudiants') || '[]');
            
            return Promise.resolve({
                classes_count: classes.length,
                professeurs_count: professeurs.length,
                matieres_count: matieres.length,
                etudiants_count: etudiants.length
            });
        }
        return api.get('/dashboard/stats/').then(response => response.data);
    },
    
    // Utilisateurs
    getCurrentUser: () => {
        if (localStorage.getItem('apiUnavailable') === 'true') {
            // Simuler un utilisateur connecté en mode démo
            return Promise.resolve({
                id: 1,
                username: 'admin_demo',
                email: 'admin@example.com',
                first_name: 'Admin',
                last_name: 'Démo',
                is_staff: true,
                is_superuser: true
            });
        }
        return api.get('/users/current/').then(response => response.data);
    },
    
    // Fonction pour forcer le mode de secours (pour les tests)
    forceFallbackMode: (activate) => {
        if (activate) {
            localStorage.setItem('apiUnavailable', 'true');
        } else {
            localStorage.removeItem('apiUnavailable');
        }
    }
};

export default api;
"""
    
    with open(api_service_path, 'w', encoding='utf-8') as f:
        f.write(modified_content)
    
    print(f"✅ Service API modifié avec succès: {api_service_path}")

def fix_api_fallback():
    """
    Solution complète pour gérer les problèmes de connexion à l'API
    et mettre en place un mode de secours (fallback) vers localStorage.
    """
    print("\n🔄 MISE EN PLACE DU MODE DE SECOURS API 🔄")
    print("==========================================")
    
    # 1. Tester la connexion à MySQL
    print("\n1️⃣ Test de la connexion à MySQL...")
    mysql_ok = test_mysql_connection()
    
    if mysql_ok:
        print("   ✅ Connexion MySQL réussie")
        
        # Si Django est correctement initialisé, on peut essayer de corriger les problèmes d'API
        if DJANGO_SETUP_SUCCESS:
            print("\n2️⃣ Vérification de la configuration Django...")
            
            # Exécuter le script de correction d'API existant
            try:
                from fix_api_connection import corriger_api_connection
                corriger_api_connection()
                print("   ✅ Configuration Django corrigée")
            except Exception as e:
                print(f"   ⚠️ Erreur lors de la correction de la configuration Django: {e}")
        else:
            print("\n2️⃣ Impossible de vérifier la configuration Django (erreur d'initialisation)")
    else:
        print("   ⚠️ Connexion MySQL impossible")
    
    # 3. Créer le mode de secours (fallback) vers localStorage
    print("\n3️⃣ Création du mode de secours (fallback)...")
    create_fallback_mode()
    
    # 4. Modifier le service API pour utiliser le mode de secours
    print("\n4️⃣ Modification du service API...")
    modify_api_service()
    
    print("\n✅ MISE EN PLACE DU MODE DE SECOURS TERMINÉE")
    print("✅ L'application fonctionnera maintenant même si l'API est indisponible")
    print("✅ Les données seront stockées temporairement dans localStorage")
    
    if not mysql_ok or not DJANGO_SETUP_SUCCESS:
        print("\n⚠️ IMPORTANT: Des problèmes de connexion à la base de données ont été détectés")
        print("⚠️ Vérifiez que MySQL est bien démarré et que les paramètres de connexion sont corrects")
        print("⚠️ Le mode de secours est activé, mais il est recommandé de résoudre ces problèmes")

if __name__ == "__main__":
    fix_api_fallback()
