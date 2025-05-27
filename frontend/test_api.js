// Script de test pour vérifier les API Django
const axios = require('axios');

// Fonction pour tester un endpoint
const testEndpoint = async (endpoint) => {
  try {
    console.log(`Teste l'endpoint: ${endpoint}`);
    const response = await axios.get(`http://localhost:8002/api/${endpoint}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    console.log(`✅ Succès! Status: ${response.status}`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur pour ${endpoint}: ${error.message}`);
    if (error.response) {
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Message: ${JSON.stringify(error.response.data)}`);
    }
    return false;
  }
};

// Liste des endpoints à tester
const endpoints = [
  'classes/', 
  'professeurs/', 
  'matieres/',
  'cours/',
  'etudiants/',
  'admin-dashboard/',
  'notes/',
  'bulletins/',
  'absences/'
];

// Exécuter les tests
const runTests = async () => {
  console.log('=== DÉBUT DES TESTS API ===');
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
  }
  console.log('=== FIN DES TESTS API ===');
};

runTests();
