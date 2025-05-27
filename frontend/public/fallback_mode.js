
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
        notification.innerHTML = '<strong>Connexion à l'API impossible - Mode démonstration activé</strong>';
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
