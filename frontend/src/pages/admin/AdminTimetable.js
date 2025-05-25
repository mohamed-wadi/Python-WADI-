import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

import { 
  fetchCours, 
  createCour, 
  updateCour, 
  deleteCour,
  fetchClasses,
  fetchProfesseurs,
  fetchMatieres
} from '../../utils/api';

// Jours de la semaine pour l'emploi du temps
const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

// Heures de la journée (8h à 18h)
const HEURES = Array.from({ length: 11 }, (_, i) => ({
  label: `${i + 8}:00`,
  value: `${(i + 8).toString().padStart(2, '0')}:00:00`
}));

const AdminTimetable = () => {
  const [cours, setCours] = useState([]);
  const [classes, setClasses] = useState([]);
  const [professeurs, setProfesseurs] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [formType, setFormType] = useState('create');
  const [currentCours, setCurrentCours] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [viewMode, setViewMode] = useState('classe'); // 'classe' ou 'professeur'
  const [selectedEntity, setSelectedEntity] = useState('');
  const [forceUpdate, setForceUpdate] = useState(0); // Pour forcer le rafraîchissement du calendrier

  // État du formulaire
  const [formData, setFormData] = useState({
    matiere: '',
    professeur: '',
    classe: '',
    jour: 'Lundi',
    heure_debut: '08:00:00',
    heure_fin: '09:00:00',
    salle: '',
    description: ''
  });

  const [openConfirm, setOpenConfirm] = useState(false);
  const [coursToDelete, setCoursToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [formErrors, setFormErrors] = useState({});

  // Charger les données initiales au démarrage
  useEffect(() => {
    loadData();
  }, []);
  
  // Réagir aux changements forcés (ajout/modification/suppression de cours)
  useEffect(() => {
    if (forceUpdate > 0) {
      console.log(`ForceUpdate déclenché (${forceUpdate}) - Rafraîchissement des données`);
    }
  }, [forceUpdate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [coursResponse, classesResponse, professeursResponse, matieresResponse] = await Promise.all([
        fetchCours(),
        fetchClasses(),
        fetchProfesseurs(),
        fetchMatieres()
      ]);
      
      setCours(coursResponse.data);
      setClasses(classesResponse.data);
      setProfesseurs(professeursResponse.data);
      setMatieres(matieresResponse.data);
      
      // Sélectionner la première classe par défaut si aucune n'est sélectionnée
      if (classes.length > 0 && !selectedEntity) {
        setSelectedEntity(classesResponse.data[0].id.toString());
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      showSnackbar('Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (type, cours = null) => {
    // Type est 'add' pour ajout ou 'edit' pour modification
    console.log(`Ouverture du formulaire en mode: ${type}`);
    setFormType(type);
    setFormErrors({});
    
    if (type === 'edit' && cours) {
      setCurrentCours(cours);
      setFormData({
        matiere: cours.matiere.toString(),
        professeur: cours.professeur.toString(),
        classe: cours.classe.toString(),
        jour: cours.jour,
        heure_debut: cours.heure_debut,
        heure_fin: cours.heure_fin,
        salle: cours.salle,
        description: cours.description || ''
      });
    } else {
      // Réinitialiser le formulaire pour la création
      setCurrentCours(null);
      setFormData({
        matiere: '',
        professeur: '',
        classe: viewMode === 'classe' ? selectedEntity : '',
        jour: 'Lundi',
        heure_debut: '08:00:00',
        heure_fin: '09:00:00',
        salle: '',
        description: ''
      });
    }
    
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Mise à jour de l'état du formulaire
    const updatedFormData = {
      ...formData,
      [name]: value
    };
    
    // Si la matière change, sélectionner automatiquement le professeur associé
    if (name === 'matiere' && value) {
      const matiereSelectionnee = matieres.find(m => m.id.toString() === value);
      if (matiereSelectionnee && matiereSelectionnee.professeur) {
        // Mettre à jour le professeur automatiquement
        updatedFormData.professeur = matiereSelectionnee.professeur.toString();
        console.log(`Matière ${matiereSelectionnee.nom} sélectionnée, professeur associé: ${matiereSelectionnee.professeur}`);
      }
    }
    
    // Validation spéciale pour l'heure de fin
    if (name === 'heure_fin' && formData.heure_debut && value <= formData.heure_debut) {
      setFormErrors({
        ...formErrors,
        heure_fin: "L'heure de fin doit être postérieure à l'heure de début"
      });
    } else if (name === 'heure_fin') {
      setFormErrors({
        ...formErrors,
        heure_fin: ''
      });
    }
    
    // Appliquer les modifications
    setFormData(updatedFormData);
    
    // Effacer l'erreur lorsque l'utilisateur corrige le champ
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.matiere) errors.matiere = 'La matière est requise';
    if (!formData.professeur) errors.professeur = 'Le professeur est requis';
    if (!formData.classe) errors.classe = 'La classe est requise';
    if (!formData.jour) errors.jour = 'Le jour est requis';
    if (!formData.heure_debut) errors.heure_debut = "L'heure de début est requise";
    if (!formData.heure_fin) errors.heure_fin = "L'heure de fin est requise";
    if (formData.heure_debut >= formData.heure_fin) {
      errors.heure_fin = "L'heure de fin doit être postérieure à l'heure de début";
    }
    if (!formData.salle) errors.salle = 'La salle est requise';
    
    // Vérifier les conflits d'emploi du temps
    const conflits = checkTimeConflicts();
    if (conflits.length > 0) {
      errors.conflit = `Conflit d'horaire avec: ${conflits.map(c => c.matiere_nom).join(', ')}`;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const checkTimeConflicts = () => {
    // Vérifier les conflits d'horaires (même heure, même jour)
    const conflits = [];
    
    // Ne pas vérifier les conflits avec le cours actuel en mode édition
    const coursId = formType === 'edit' && currentCours ? currentCours.id : null;
    
    for (const c of cours) {
      if (coursId && c.id === coursId) continue;
      
      if (c.jour === formData.jour) {
        // Conflit si les plages horaires se chevauchent
        const debut = formData.heure_debut;
        const fin = formData.heure_fin;
        const cDebut = c.heure_debut;
        const cFin = c.heure_fin;
        
        if (
          (debut >= cDebut && debut < cFin) || // Le début est pendant un autre cours
          (fin > cDebut && fin <= cFin) || // La fin est pendant un autre cours
          (debut <= cDebut && fin >= cFin) // L'autre cours est entièrement inclus
        ) {
          // Vérifier si c'est pour la même classe ou le même professeur
          if (
            (c.classe.toString() === formData.classe) || 
            (c.professeur.toString() === formData.professeur)
          ) {
            conflits.push(c);
          }
        }
      }
    }
    
    return conflits;
  };

  const handleSubmitForm = async (event) => {
    if (event) event.preventDefault();
    if (!validateForm()) return;
    
    try {
      // Simuler un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Préparer les données (mais ne pas les envoyer à l'API)
      // S'assurer que tous les champs ont le bon format
      const courseData = {
        ...formData,
        matiere: parseInt(formData.matiere, 10),
        professeur: parseInt(formData.professeur, 10),
        classe: parseInt(formData.classe, 10),
        // S'assurer que les heures ont le bon format (HH:MM:SS)
        heure_debut: formData.heure_debut.length === 5 ? `${formData.heure_debut}:00` : formData.heure_debut,
        heure_fin: formData.heure_fin.length === 5 ? `${formData.heure_fin}:00` : formData.heure_fin,
      };
      
      console.log('Données formatées:', courseData);
      
      // Récupérer les noms pour l'affichage
      const matiere_nom = getMatiereNom(courseData.matiere) || 'Matière inconnue';
      const professeur_nom = getProfesseurNom(courseData.professeur) || 'Professeur inconnu';
      const classe_nom = getClasseNom(courseData.classe) || 'Classe inconnue';
      
      if (formType === 'add') {
        // Créer un nouvel ID unique pour la simulation
        const newId = Date.now();
        const newCourse = {
          ...courseData,
          id: newId,
          // Ajouter des champs calculés pour l'affichage
          matiere_nom,
          professeur_nom,
          classe_nom,
        };
        
        console.log('Nouveau cours à ajouter:', newCourse);
        
        // MODE SIMULATION: Ajouter localement sans API
        setCours(currentCours => {
          const newList = [...currentCours, newCourse];
          console.log('Nouvelle liste de cours après ajout:', newList);
          return newList;
        });
        
        // Attendre que l'état soit mis à jour avant de forcer le rafraîchissement
        setTimeout(() => {
          setForceUpdate(prev => prev + 1);
          console.log('Rafraîchissement forcé après ajout.');
        }, 100);
        
        showSnackbar('Cours ajouté avec succès', 'success');
      } else if (formType === 'edit' && currentCours) {
        // Mettre à jour le cours existant
        const updatedCourse = {
          ...currentCours,
          ...courseData,
          id: currentCours.id,
          // Mettre à jour les champs calculés
          matiere_nom,
          professeur_nom,
          classe_nom,
        };
        
        console.log('Cours mis à jour:', updatedCourse);
        
        // MODE SIMULATION: Mise à jour locale sans API
        const updatedCours = cours.map(c => 
          c.id === currentCours.id ? updatedCourse : c
        );
        
        console.log('Liste des cours après mise à jour:', updatedCours);
        setCours(updatedCours);
        
        // Attendre que l'état soit mis à jour avant de forcer le rafraîchissement
        setTimeout(() => {
          setForceUpdate(prev => prev + 1);
          console.log('Rafraîchissement forcé après modification.');
        }, 100);
        
        showSnackbar('Cours modifié avec succès', 'success');
      }
      
      // Fermer le formulaire après ajout/modification
      handleCloseForm();
    } catch (error) {
      console.error('Erreur lors de la simulation:', error);
      showSnackbar(`Erreur: ${error.message}`, 'error');
    }
  };

  const handleDeleteClick = (cours) => {
    setCoursToDelete(cours);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!coursToDelete) return;
    
    try {
      // Simuler un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Suppression locale du cours:', coursToDelete);
      
      // MODE SIMULATION: suppression locale uniquement
      const updatedCours = cours.filter(c => c.id !== coursToDelete.id);
      setCours(updatedCours);
      
      // Forcer le rafraîchissement du calendrier
      setForceUpdate(prev => prev + 1);
      
      showSnackbar('Cours supprimé avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de la simulation de suppression:', error);
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
  console.log('Mode de vue:', viewMode);
  console.log('Entité sélectionnée:', selectedEntity);
  console.log('Tous les cours disponibles:', cours);
  
  const filteredCours = cours.filter(c => {
    // S'assurer que classe et professeur sont toujours convertis en string pour la comparaison
    const classeId = c.classe?.toString ? c.classe.toString() : String(c.classe);
    const professeurId = c.professeur?.toString ? c.professeur.toString() : String(c.professeur);
    
    const match = viewMode === 'classe' 
      ? classeId === selectedEntity
      : professeurId === selectedEntity;
    
    // Débogage
    if (match) {
      console.log('Cours correspondant trouvé:', c);
    }
    
    return match;
  });
  
  console.log('Cours filtrés:', filteredCours);

  // Version ultra-simplifiée de l'affichage des cours pour débogage
  const renderTimetable = () => {
    console.log('========== DÉBUT RENDU TIMETABLE ==========');
    console.log('TOUS LES COURS DANS LA MÉMOIRE:', cours);
    console.log('MODE DE VUE ACTUEL:', viewMode);
    console.log('ENTITÉ SÉLECTIONNÉE (ID):', selectedEntity);
    
    // Version ultra-simplifiée - afficher tous les cours pour chaque jour
    const coursParJour = {};
    
    // Initialiser le tableau pour chaque jour
    JOURS.forEach(jour => {
      coursParJour[jour] = [];
    });
    
    // Debug: Ajout d'un cours de test si aucun n'existe
    if (cours.length === 0 && classes.length > 0) {
      console.log('AUCUN COURS TROUVÉ - AJOUT D’UN COURS DE TEST TEMPORAIRE');
      const testCours = {
        id: 999999,
        classe: classes[0].id,
        professeur: professeurs.length > 0 ? professeurs[0].id : 1,
        matiere: matieres.length > 0 ? matieres[0].id : 1,
        jour: 'Lundi',
        heure_debut: '08:00:00',
        heure_fin: '09:00:00',
        salle: 'TEST',
        description: 'Cours de test',
        matiere_nom: 'Cours de test',
        professeur_nom: 'Professeur Test',
        classe_nom: classes[0].nom || 'Classe Test'
      };
      coursParJour['Lundi'].push(testCours);
    } else {
      // Parcourir tous les cours et les répartir par jour
      cours.forEach(c => {
        try {
          // Vérification minimale - juste s'assurer que le jour est valide
          if (c.jour && coursParJour[c.jour]) {
            // Afficher tous les cours sans filtrage pour débogage
            coursParJour[c.jour].push(c);
            console.log(`Cours ajouté au jour ${c.jour}:`, c);
          }
        } catch (error) {
          console.error('Erreur lors du traitement du cours:', error);
        }
      });
    }
    
    console.log('STRUCTURE FINALE DE L’EMPLOI DU TEMPS:', coursParJour);
    console.log('========== FIN RENDU TIMETABLE ==========');
    
    // Version simplifiée du tableau - liste des cours par jour
    return (
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              {JOURS.map(jour => (
                <TableCell key={jour} sx={{ fontWeight: 'bold', textAlign: 'center' }}>{jour}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow sx={{ height: '500px' }}>
              {JOURS.map(jour => (
                <TableCell key={jour} sx={{ verticalAlign: 'top', padding: 2 }}>
                  {coursParJour[jour]?.length > 0 ? (
                    coursParJour[jour].map(c => (
                      <Box key={c.id} sx={{ 
                        p: 2, 
                        mb: 2, 
                        bgcolor: 'primary.light', 
                        color: 'white',
                        borderRadius: 1,
                        position: 'relative',
                        boxShadow: 1
                      }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {c.matiere_nom || getMatiereNom(c.matiere)}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {viewMode === 'classe' ? 
                            (c.professeur_nom || getProfesseurNom(c.professeur)) : 
                            (c.classe_nom || getClasseNom(c.classe))}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Salle: {c.salle}
                        </Typography>
                        <Typography variant="body2">
                          {c.heure_debut?.substr(0, 5) || "--:--"} - {c.heure_fin?.substr(0, 5) || "--:--"}
                        </Typography>
                        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpenForm('edit', c)}
                            sx={{ color: 'white', mr: 1 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteClick(c)}
                            sx={{ color: 'white' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                      Aucun cours ce jour
                    </Typography>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Fonction utilitaires pour récupérer les noms à partir des IDs
  const getMatiereNom = (id) => {
    const matiere = matieres.find(m => m.id === id);
    return matiere ? matiere.nom : `Matière #${id}`;
  };

  const getProfesseurNom = (id) => {
    const prof = professeurs.find(p => p.id === id);
    return prof ? `${prof.prenom} ${prof.nom}` : `Professeur #${id}`;
  };

  const getClasseNom = (id) => {
    const classe = classes.find(c => c.id === id);
    return classe ? classe.nom : `Classe #${id}`;
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Gestion des emplois du temps
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm('add')}
        >
          Ajouter un cours
        </Button>
      </Box>
      
      <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Vue par classe" />
        <Tab label="Vue par professeur" />
      </Tabs>
      
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel id="entity-select-label">
            {viewMode === 'classe' ? 'Sélectionner une classe' : 'Sélectionner un professeur'}
          </InputLabel>
          <Select
            labelId="entity-select-label"
            value={selectedEntity}
            label={viewMode === 'classe' ? 'Sélectionner une classe' : 'Sélectionner un professeur'}
            onChange={handleEntityChange}
          >
            {viewMode === 'classe' ? (
              classes.map(classe => (
                <MenuItem key={classe.id} value={classe.id.toString()}>
                  {classe.nom} ({classe.niveau})
                </MenuItem>
              ))
            ) : (
              professeurs.map(prof => (
                <MenuItem key={prof.id} value={prof.id.toString()}>
                  {prof.prenom} {prof.nom} ({prof.specialite})
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        renderTimetable()
      )}
      
      {/* Formulaire d'ajout/modification */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <DialogTitle>
          {formType === 'add' ? 'Ajouter un cours' : 'Modifier un cours'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={Boolean(formErrors.matiere)}>
                <InputLabel id="matiere-label">Matière</InputLabel>
                <Select
                  labelId="matiere-label"
                  name="matiere"
                  value={formData.matiere}
                  onChange={handleInputChange}
                  label="Matière"
                >
                  {matieres.map(matiere => (
                    <MenuItem key={matiere.id} value={matiere.id.toString()}>
                      {matiere.nom}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.matiere && <Typography color="error" variant="caption">{formErrors.matiere}</Typography>}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={Boolean(formErrors.professeur)}>
                <InputLabel id="professeur-label">Professeur</InputLabel>
                <Select
                  labelId="professeur-label"
                  name="professeur"
                  value={formData.professeur}
                  onChange={handleInputChange}
                  label="Professeur"
                  disabled={formData.matiere !== ''} // Désactiver si une matière est sélectionnée
                >
                  {professeurs.map(prof => (
                    <MenuItem key={prof.id} value={prof.id.toString()}>
                      {prof.prenom} {prof.nom} ({prof.specialite})
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.professeur && <Typography color="error" variant="caption">{formErrors.professeur}</Typography>}
                {formData.matiere !== '' && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    Le professeur est automatiquement sélectionné en fonction de la matière
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={Boolean(formErrors.classe)}>
                <InputLabel id="classe-label">Classe</InputLabel>
                <Select
                  labelId="classe-label"
                  name="classe"
                  value={formData.classe}
                  onChange={handleInputChange}
                  label="Classe"
                >
                  {classes.map(classe => (
                    <MenuItem key={classe.id} value={classe.id.toString()}>
                      {classe.nom} ({classe.niveau})
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.classe && <Typography color="error" variant="caption">{formErrors.classe}</Typography>}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={Boolean(formErrors.jour)}>
                <InputLabel id="jour-label">Jour</InputLabel>
                <Select
                  labelId="jour-label"
                  name="jour"
                  value={formData.jour}
                  onChange={handleInputChange}
                  label="Jour"
                >
                  {JOURS.map(jour => (
                    <MenuItem key={jour} value={jour}>
                      {jour}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.jour && <Typography color="error" variant="caption">{formErrors.jour}</Typography>}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={Boolean(formErrors.heure_debut)}>
                <InputLabel id="heure-debut-label">Heure de début</InputLabel>
                <Select
                  labelId="heure-debut-label"
                  name="heure_debut"
                  value={formData.heure_debut}
                  onChange={handleInputChange}
                  label="Heure de début"
                >
                  {HEURES.map(heure => (
                    <MenuItem key={`debut-${heure.value}`} value={heure.value}>
                      {heure.label}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.heure_debut && <Typography color="error" variant="caption">{formErrors.heure_debut}</Typography>}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={Boolean(formErrors.heure_fin)}>
                <InputLabel id="heure-fin-label">Heure de fin</InputLabel>
                <Select
                  labelId="heure-fin-label"
                  name="heure_fin"
                  value={formData.heure_fin}
                  onChange={handleInputChange}
                  label="Heure de fin"
                >
                  {HEURES.map((heure, index) => (
                    <MenuItem 
                      key={`fin-${heure.value}`} 
                      value={index < HEURES.length - 1 ? HEURES[index + 1].value : '19:00:00'}
                      disabled={heure.value <= formData.heure_debut}
                    >
                      {index < HEURES.length - 1 ? HEURES[index + 1].label : '19:00'}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.heure_fin && <Typography color="error" variant="caption">{formErrors.heure_fin}</Typography>}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="salle"
                label="Salle"
                value={formData.salle}
                onChange={handleInputChange}
                fullWidth
                required
                error={Boolean(formErrors.salle)}
                helperText={formErrors.salle}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description (optionnel)"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            {formErrors.conflit && (
              <Grid item xs={12}>
                <Alert severity="error">
                  {formErrors.conflit}
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Annuler</Button>
          <Button onClick={handleSubmitForm} variant="contained" color="primary">
            {formType === 'add' ? 'Ajouter' : 'Modifier'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Boîte de dialogue de confirmation de suppression */}
      <Dialog open={openConfirm} onClose={handleCancelDelete}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer ce cours ?
            Cette action est irréversible.
          </Typography>
          {coursToDelete && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">
                {getMatiereNom(coursToDelete.matiere)}
              </Typography>
              <Typography variant="body2">
                {getProfesseurNom(coursToDelete.professeur)} - {getClasseNom(coursToDelete.classe)}
              </Typography>
              <Typography variant="body2">
                {coursToDelete.jour}, {coursToDelete.heure_debut.substr(0, 5)} - {coursToDelete.heure_fin.substr(0, 5)}, Salle: {coursToDelete.salle}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Annuler</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar pour les notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminTimetable;
