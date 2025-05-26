// Script de synchronisation des données localStorage pour l'application de gestion scolaire
// Exécutez ce script dans la console du navigateur pour résoudre les problèmes d'affichage

(function() {
  console.log('Début de la synchronisation des données localStorage...');
  
  // 1. Vérifier et récupérer les données des professeurs
  const professeurs = localStorage.getItem('schoolAppProfesseurs');
  console.log('Professeurs trouvés:', professeurs ? 'Oui' : 'Non');
  
  // 2. Vérifier et récupérer les données des matières
  const matieres = localStorage.getItem('schoolAppMatieres');
  console.log('Matières trouvées:', matieres ? 'Oui' : 'Non');
  
  // 3. Vérifier et récupérer les données des classes
  const classes = localStorage.getItem('schoolAppClasses');
  console.log('Classes trouvées:', classes ? 'Oui' : 'Non');
  
  // 4. Analyser les données pour vérifier qu'elles sont valides
  let professeursParsed = [];
  let matieresParsed = [];
  let classesParsed = [];
  
  try {
    if (professeurs) {
      professeursParsed = JSON.parse(professeurs);
      console.log(`${professeursParsed.length} professeurs trouvés:`, professeursParsed);
    }
  } catch (e) {
    console.error('Erreur lors du parsing des professeurs:', e);
  }
  
  try {
    if (matieres) {
      matieresParsed = JSON.parse(matieres);
      console.log(`${matieresParsed.length} matières trouvées:`, matieresParsed);
    }
  } catch (e) {
    console.error('Erreur lors du parsing des matières:', e);
  }
  
  try {
    if (classes) {
      classesParsed = JSON.parse(classes);
      console.log(`${classesParsed.length} classes trouvées:`, classesParsed);
    }
  } catch (e) {
    console.error('Erreur lors du parsing des classes:', e);
  }
  
  // 5. Vérifier les anciennes clés et les synchroniser avec les nouvelles
  const oldProfesseurs = localStorage.getItem('professeurs');
  const oldMatieres = localStorage.getItem('matieres');
  
  if (oldProfesseurs && (!professeurs || professeursParsed.length === 0)) {
    try {
      const oldProfesseursParsed = JSON.parse(oldProfesseurs);
      if (Array.isArray(oldProfesseursParsed) && oldProfesseursParsed.length > 0) {
        console.log('Migration des données de professeurs depuis l\'ancienne clé...');
        localStorage.setItem('schoolAppProfesseurs', oldProfesseurs);
        console.log('Migration réussie!');
      }
    } catch (e) {
      console.error('Erreur lors de la migration des professeurs:', e);
    }
  }
  
  if (oldMatieres && (!matieres || matieresParsed.length === 0)) {
    try {
      const oldMatieresParsed = JSON.parse(oldMatieres);
      if (Array.isArray(oldMatieresParsed) && oldMatieresParsed.length > 0) {
        console.log('Migration des données de matières depuis l\'ancienne clé...');
        localStorage.setItem('schoolAppMatieres', oldMatieres);
        console.log('Migration réussie!');
      }
    } catch (e) {
      console.error('Erreur lors de la migration des matières:', e);
    }
  }
  
  // 6. S'assurer que les données des classes ne sont pas écrasées au rechargement
  const savedCoursesData = localStorage.getItem('saved_courses');
  
  // Vérifier si les données des classes sont en risque d'être perdues
  if (classes) {
    // Sauvegarder une copie de secours des classes
    localStorage.setItem('schoolAppClasses_backup', classes);
    console.log('Sauvegarde des classes effectuée');
  } else if (localStorage.getItem('schoolAppClasses_backup')) {
    // Restaurer depuis la sauvegarde si nécessaire
    const backupClasses = localStorage.getItem('schoolAppClasses_backup');
    localStorage.setItem('schoolAppClasses', backupClasses);
    console.log('Classes restaurées depuis la sauvegarde');
  }
  
  // 7. Créer des données statiques si aucune donnée n'est disponible
  if (!professeurs || professeursParsed.length === 0) {
    console.log('Aucune donnée de professeurs trouvée, création de données statiques...');
    const staticProfesseurs = [
      { id: 1, nom: 'Dupont', prenom: 'Jean', email: 'jean.dupont@example.com', specialite: 'Mathématiques' },
      { id: 2, nom: 'Martin', prenom: 'Sophie', email: 'sophie.martin@example.com', specialite: 'Français' },
      { id: 3, nom: 'Bernard', prenom: 'Michel', email: 'michel.bernard@example.com', specialite: 'Histoire-Géographie' },
      { id: 4, nom: 'Petit', prenom: 'Anne', email: 'anne.petit@example.com', specialite: 'Anglais' },
      { id: 5, nom: 'Robert', prenom: 'Pierre', email: 'pierre.robert@example.com', specialite: 'Physique-Chimie' }
    ];
    localStorage.setItem('schoolAppProfesseurs', JSON.stringify(staticProfesseurs));
    console.log('Données statiques de professeurs créées!');
  }
  
  if (!matieres || matieresParsed.length === 0) {
    console.log('Aucune donnée de matières trouvée, création de données statiques...');
    const staticMatieres = [
      { id: 1, nom: 'Mathématiques', code: 'MATH101', coefficient: 5 },
      { id: 2, nom: 'Physique-Chimie', code: 'PHY101', coefficient: 4 },
      { id: 3, nom: 'Histoire-Géographie', code: 'HIST101', coefficient: 3 },
      { id: 4, nom: 'Français', code: 'FRAN101', coefficient: 4 },
      { id: 5, nom: 'Anglais', code: 'ANG101', coefficient: 3 }
    ];
    localStorage.setItem('schoolAppMatieres', JSON.stringify(staticMatieres));
    console.log('Données statiques de matières créées!');
  }
  
  if (!classes || classesParsed.length === 0) {
    console.log('Aucune donnée de classes trouvée, création de données statiques...');
    const staticClasses = [
      { id: 1, nom: 'Terminale S', niveau: 'Terminale', annee_scolaire: '2024-2025' },
      { id: 2, nom: 'Première ES', niveau: 'Première', annee_scolaire: '2024-2025' },
      { id: 3, nom: 'Seconde A', niveau: 'Seconde', annee_scolaire: '2024-2025' }
    ];
    localStorage.setItem('schoolAppClasses', JSON.stringify(staticClasses));
    console.log('Données statiques de classes créées!');
  }
  
  // 7. Synchroniser les cours
  const savedCourses = localStorage.getItem('saved_courses');
  let coursesParsed = [];
  
  try {
    if (savedCourses) {
      coursesParsed = JSON.parse(savedCourses);
      console.log(`${coursesParsed.length} cours trouvés.`);
      
      // Récupérer les nouvelles données après la synchronisation
      const syncedProfesseurs = JSON.parse(localStorage.getItem('schoolAppProfesseurs'));
      const syncedMatieres = JSON.parse(localStorage.getItem('schoolAppMatieres'));
      const syncedClasses = JSON.parse(localStorage.getItem('schoolAppClasses'));
      
      // Enrichir les cours avec les bonnes références
      const enrichedCourses = coursesParsed.map(cours => {
        const matiere = syncedMatieres.find(m => m.id === parseInt(cours.matiere));
        const professeur = syncedProfesseurs.find(p => p.id === parseInt(cours.professeur));
        const classe = syncedClasses.find(c => c.id === parseInt(cours.classe));
        
        return {
          ...cours,
          matiere_nom: matiere ? matiere.nom : 'Matière inconnue',
          professeur_nom: professeur ? `${professeur.prenom} ${professeur.nom}` : 'Professeur inconnu',
          classe_nom: classe ? classe.nom : 'Classe inconnue'
        };
      });
      
      localStorage.setItem('saved_courses', JSON.stringify(enrichedCourses));
      console.log('Cours enrichis et sauvegardés!');
    } else {
      console.log('Aucun cours trouvé dans localStorage.');
    }
  } catch (e) {
    console.error('Erreur lors de la synchronisation des cours:', e);
  }
  
  console.log('Synchronisation terminée! Veuillez rafraîchir la page pour voir les changements.');
  
  return {
    professeurs: professeursParsed.length,
    matieres: matieresParsed.length,
    classes: classesParsed.length,
    cours: coursesParsed.length
  };
})();
