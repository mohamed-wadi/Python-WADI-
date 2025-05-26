const handleDeleteClick = (cours) => {
  setCoursToDelete(cours);
  setOpenConfirm(true);
};

const handleConfirmDelete = async () => {
  if (!coursToDelete) return;
  
  try {
    // Supprimer le cours
    const updatedCours = cours.filter(c => c.id !== coursToDelete.id);
    setCours(updatedCours);
    saveCoursToLocalStorage(updatedCours);
    showSnackbar('Cours supprimé avec succès', 'success');
  } catch (error) {
    showSnackbar('Erreur lors de la suppression', 'error');
  } finally {
    setOpenConfirm(false);
    setCoursToDelete(null);
  }
};

const handleCancelDelete = () => {
  setOpenConfirm(false);
  setCoursToDelete(null);
};

const showSnackbar = (message, severity) => {
  setSnackbar({
    open: true,
    message,
    severity
  });
};

const handleCloseSnackbar = () => {
  setSnackbar({
    ...snackbar,
    open: false
  });
};

const handleTabChange = (event, newValue) => {
  setSelectedTab(newValue);
  setViewMode(newValue === 0 ? 'classe' : 'professeur');
  // Réinitialiser la sélection
  if (newValue === 0 && classes.length > 0) {
    setSelectedEntity(classes[0].id.toString());
  } else if (newValue === 1 && professeurs.length > 0) {
    setSelectedEntity(professeurs[0].id.toString());
  } else {
    setSelectedEntity('');
  }
};

const handleEntityChange = (event) => {
  setSelectedEntity(event.target.value);
};

// Filtrer les cours selon le mode de vue et l'entité sélectionnée
const filteredCours = Array.isArray(cours) ? cours.filter(c => {
  if (!c || (typeof c !== 'object')) return false;
  if (viewMode === 'classe') {
    return String(c.classe) === selectedEntity;
  } else {
    return String(c.professeur) === selectedEntity;
  }
}) : [];
