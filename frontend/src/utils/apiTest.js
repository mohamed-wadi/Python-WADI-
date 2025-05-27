/**
 * Script de test pour vérifier l'API
 * Exécuter dans la console du navigateur pour vérifier la connexion au backend
 */

// Test de l'API via fetch - méthode GET
async function testApiGet() {
  try {
    console.log('Test API GET via fetch...');
    const response = await fetch('http://localhost:8002/api/classes/');
    const data = await response.json();
    console.log('Réponse GET réussie:', data);
    return true;
  } catch (error) {
    console.error('Erreur lors du test GET:', error);
    return false;
  }
}

// Test de l'API via fetch - méthode POST
async function testApiPost() {
  try {
    console.log('Test API POST via fetch...');
    const testData = {
      nom: 'Classe Test ' + new Date().toISOString().substr(0, 19),
      niveau: '1',
      filiere: 'IIR',
      annee_scolaire: '2024-2025'
    };
    
    const response = await fetch('http://localhost:8002/api/classes/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Réponse POST réussie:', data);
    return true;
  } catch (error) {
    console.error('Erreur lors du test POST:', error);
    return false;
  }
}

// Exécuter les tests
async function runApiTests() {
  console.log('Démarrage des tests API...');
  
  // Test GET
  const getResult = await testApiGet();
  console.log('Test GET:', getResult ? 'RÉUSSI' : 'ÉCHEC');
  
  // Test POST
  const postResult = await testApiPost();
  console.log('Test POST:', postResult ? 'RÉUSSI' : 'ÉCHEC');
  
  console.log('Tests API terminés.');
}

// Exposer les fonctions de test dans la fenêtre globale pour utilisation dans la console
window.testApiGet = testApiGet;
window.testApiPost = testApiPost;
window.runApiTests = runApiTests;

// Exporter pour utilisation dans d'autres modules
export { testApiGet, testApiPost, runApiTests };
