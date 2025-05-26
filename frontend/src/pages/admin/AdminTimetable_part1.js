const handleOpenForm = (type, cours = null) => {
  // Type est 'add' pour ajout ou 'edit' pour modification
  console.log(`Ouverture du formulaire en mode: ${type}`);
  setFormType(type);
  setFormErrors({});
  
  if (type === 'add') {
    // Initialiser avec des valeurs par défaut
    setFormData({
      matiere: '',
      professeur: '',
      classe: viewMode === 'classe' ? selectedEntity : '',
      jour: '',
      heure_debut: '',
      heure_fin: '',
      salle: ''
    });
    setEditingCours(null);
  } else if (type === 'edit' && cours) {
    // Pré-remplir avec les données du cours à modifier
    setFormData({
      matiere: cours.matiere.toString(),
      professeur: cours.professeur.toString(),
      classe: cours.classe.toString(),
      jour: cours.jour,
      heure_debut: cours.heure_debut,
      heure_fin: cours.heure_fin,
      salle: cours.salle || ''
    });
    setEditingCours(cours);
  }
  
  setOpenForm(true);
};

const handleCloseForm = () => {
  setOpenForm(false);
};

const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};

const validateForm = () => {
  const errors = {};
  if (!formData.matiere) errors.matiere = 'La matière est obligatoire';
  if (!formData.professeur) errors.professeur = 'Le professeur est obligatoire';
  if (!formData.classe) errors.classe = 'La classe est obligatoire';
  if (!formData.jour) errors.jour = 'Le jour est obligatoire';
  if (!formData.heure_debut) errors.heure_debut = 'L\'heure de début est obligatoire';
  if (!formData.heure_fin) errors.heure_fin = 'L\'heure de fin est obligatoire';
  setFormErrors(errors);
  return Object.keys(errors).length === 0;
};

const handleSubmitForm = async () => {
  if (!validateForm()) {
    showSnackbar('Veuillez corriger les erreurs dans le formulaire', 'error');
    return;
  }
  
  try {
    // Préparer les données du cours
    const courseData = {
      matiere: parseInt(formData.matiere),
      professeur: parseInt(formData.professeur),
      classe: parseInt(formData.classe),
      jour: formData.jour,
      heure_debut: formData.heure_debut,
      heure_fin: formData.heure_fin,
      salle: formData.salle
    };
    
    // Rechercher les détails pour enrichir les données
    const matiereDetails = matieres.find(m => m.id === parseInt(formData.matiere));
    const professeurDetails = professeurs.find(p => p.id === parseInt(formData.professeur));
    const classeDetails = classes.find(c => c.id === parseInt(formData.classe));
    
    // Extraire les noms pour l'affichage
    const matiere_nom = matiereDetails ? matiereDetails.nom : 'Matière inconnue';
    const professeur_nom = professeurDetails ? `${professeurDetails.prenom} ${professeurDetails.nom}` : 'Professeur inconnu';
    const classe_nom = classeDetails ? classeDetails.nom : 'Classe inconnue';
    
    if (formType === 'add') {
      // Créer un nouvel ID unique
      const newId = Date.now();
      const newCourse = {
        ...courseData,
        id: newId,
        matiere_nom,
        professeur_nom,
        classe_nom,
      };
      
      // Ajouter le cours à l'état local
      setCours(currentCours => {
        const currentArray = Array.isArray(currentCours) ? currentCours : [];
        const newList = [...currentArray, newCourse];
        saveCoursToLocalStorage(newList);
        return newList;
      });
      
      showSnackbar('Cours ajouté avec succès', 'success');
    } else if (formType === 'edit' && editingCours) {
      // Mettre à jour un cours existant
      const updatedCourse = {
        ...courseData,
        id: editingCours.id,
        matiere_nom,
        professeur_nom,
        classe_nom,
      };
      
      // Mettre à jour l'état local
      setCours(currentCours => {
        const currentArray = Array.isArray(currentCours) ? currentCours : [];
        const updatedList = currentArray.map(c => 
          c.id === editingCours.id ? updatedCourse : c
        );
        saveCoursToLocalStorage(updatedList);
        return updatedList;
      });
      
      showSnackbar('Cours mis à jour avec succès', 'success');
    }
    
    // Fermer le formulaire après ajout/modification
    handleCloseForm();
  } catch (error) {
    console.error('Erreur lors de la simulation:', error);
    showSnackbar(`Erreur: ${error.message}`, 'error');
  }
};
