/**
 * Script simple pour effacer définitivement les données
 * Exécutez-le depuis la console du navigateur pour résoudre immédiatement 
 * le problème des données qui réapparaissent après suppression
 */

// Fonction pour effacer complètement une entité
function effacerDefinitivement(entite) {
  // Vider les données
  localStorage.setItem(entite, '[]');
  
  // Marquer comme supprimée
  localStorage.setItem(`${entite}_deleted`, 'true');
  
  // Créer une sauvegarde vide si nécessaire
  if (entite === 'schoolAppClasses') {
    localStorage.setItem('schoolAppClasses_backup', '[]');
  }
  
  // Désactiver la réinitialisation
  localStorage.setItem('schoolAppDataInitialized', 'true');
  
  console.log(`✅ ${entite} effacé définitivement`);
}

// Préserver l'état actuel et empêcher toute réinitialisation
function verrouillerEtatActuel() {
  localStorage.setItem('appStatePreserved', 'true');
  console.log('✅ État actuel verrouillé, plus de réinitialisation possible');
}

// Menu pour effacer les données
console.log('=== MENU EFFACEMENT DONNÉES ===');
console.log('Pour effacer les classes: effacerDefinitivement("schoolAppClasses")');
console.log('Pour effacer les professeurs: effacerDefinitivement("schoolAppProfesseurs")');
console.log('Pour effacer les matières: effacerDefinitivement("schoolAppMatieres")');
console.log('Pour verrouiller l\'état actuel: verrouillerEtatActuel()');
console.log('================================');

// Exporter les fonctions pour utilisation dans la console
window.effacerDefinitivement = effacerDefinitivement;
window.verrouillerEtatActuel = verrouillerEtatActuel;
