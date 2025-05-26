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
import CalendarSchedule from '../../components/CalendarSchedule';

import { 
  fetchCours, 
  createCour, 
  updateCour, 
  deleteCour,
  fetchClasses,
  fetchProfesseurs,
  fetchMatieres
} from '../../utils/api';

// Fonctions pour gérer les données dans localStorage
const loadProfesseursFromLocalStorage = () => {
  try {
    // Utiliser la même clé que dans AdminProfessors.js
    const savedProfesseurs = localStorage.getItem('schoolAppProfesseurs');
    if (savedProfesseurs) {
      console.log('Professeurs chargés depuis localStorage pour l\'emploi du temps');
      return JSON.parse(savedProfesseurs);
    }
    return null;
  } catch (error) {
    console.error('Erreur lors du chargement des professeurs depuis localStorage:', error);
    return null;
  }
};

const loadMatieresFromLocalStorage = () => {
  try {
    // Utiliser la même clé que dans AdminSubjects.js
    const savedMatieres = localStorage.getItem('schoolAppMatieres');
    if (savedMatieres) {
      console.log('Matières chargées depuis localStorage pour l\'emploi du temps');
      return JSON.parse(savedMatieres);
    }
    return null;
  } catch (error) {
    console.error('Erreur lors du chargement des matières depuis localStorage:', error);
    return null;
  }
};

const saveCoursToLocalStorage = (cours) => {
  try {
    localStorage.setItem('saved_courses', JSON.stringify(cours));
    console.log('Cours sauvegardés dans localStorage');
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des cours dans localStorage:', error);
    return false;
  }
};

// Jours de la semaine pour l'emploi du temps
const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

// Heures de la journée (8h à 18h)
const HEURES = Array.from({ length: 11 }, (_, i) => ({
  label: `${i + 8}:00`,
  value: `${(i + 8).toString().padStart(2, '0')}:00:00`
}));

// Données statiques pour le fallback
const staticClasses = [
  { id: 1, nom: 'Terminale S', niveau: 'Terminale', annee_scolaire: '2023-2024' },
  { id: 2, nom: 'Première ES', niveau: 'Première', annee_scolaire: '2023-2024' },
  { id: 3, nom: 'Seconde A', niveau: 'Seconde', annee_scolaire: '2023-2024' }
];

const staticProfesseurs = [
  { id: 1, nom: 'Dupont', prenom: 'Jean', email: 'jean.dupont@example.com', specialite: 'Mathématiques' },
  { id: 2, nom: 'Martin', prenom: 'Sophie', email: 'sophie.martin@example.com', specialite: 'Français' },
  { id: 3, nom: 'Bernard', prenom: 'Michel', email: 'michel.bernard@example.com', specialite: 'Histoire-Géographie' }
];

const staticMatieres = [
  { id: 1, nom: 'Mathématiques', code: 'MATH101', coefficient: 5 },
  { id: 2, nom: 'Physique-Chimie', code: 'PHY101', coefficient: 4 },
  { id: 3, nom: 'Histoire-Géographie', code: 'HIST101', coefficient: 3 }
];

const staticCours = [
  { 
    id: 1, 
    matiere: 1, 
    professeur: 1, 
    classe: 1, 
    jour: 'Lundi', 
    heure_debut: '08:00:00', 
    heure_fin: '10:00:00',
    salle: 'Salle 101',
    matiere_nom: 'Mathématiques',
    professeur_nom: 'Jean Dupont',
    classe_nom: 'Terminale S'
  },
  { 
    id: 2, 
    matiere: 2, 
    professeur: 2, 
    classe: 2, 
    jour: 'Mardi', 
    heure_debut: '14:00:00', 
    heure_fin: '16:00:00',
    salle: 'Salle 202',
    matiere_nom: 'Physique-Chimie',
    professeur_nom: 'Sophie Martin',
    classe_nom: 'Première ES'
  }
];

const AdminTimetable = () => {
  const [cours, setCours] = useState([]);
  const [classes, setClasses] = useState([]);
  const [professeurs, setProfesseurs] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState('classe'); // 'classe' ou 'professeur'
  const [selectedEntity, setSelectedEntity] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  
  // États pour le formulaire
  const [openForm, setOpenForm] = useState(false);
  const [formType, setFormType] = useState('add'); // 'add' ou 'edit'
  const [formData, setFormData] = useState({
    matiere: '',
    professeur: '',
    classe: '',
    jour: '',
    heure_debut: '',
    heure_fin: '',
    salle: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [editingCours, setEditingCours] = useState(null);
  
  // États pour la confirmation de suppression
  const [openConfirm, setOpenConfirm] = useState(false);
  const [coursToDelete, setCoursToDelete] = useState(null);
  
  // État pour les notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Charger les données au chargement du composant
  useEffect(() => {
    loadData();
  }, []);
  
  // Effet pour mettre à jour la vue quand l'entité sélectionnée change
  useEffect(() => {
    console.log(`Vue mise à jour: Mode=${viewMode}, Entité=${selectedEntity}`);
  }, [selectedEntity, viewMode]);

  // Fonction principale pour charger les données
  const loadData = async () => {
    setLoading(true);
    try {
      // Charger les cours depuis localStorage en priorité
      const localCours = localStorage.getItem('saved_courses');
      if (localCours) {
        try {
          const parsedCours = JSON.parse(localCours);
          if (Array.isArray(parsedCours)) {
            console.log('Utilisation des cours depuis localStorage');
            setCours(parsedCours);
          } else {
            console.log('Les cours dans localStorage ne sont pas dans un format valide');
            setCours(staticCours);
            localStorage.setItem('saved_courses', JSON.stringify(staticCours));
          }
        } catch (parseError) {
          console.error('Erreur lors du parsing des cours depuis localStorage:', parseError);
          setCours(staticCours);
          localStorage.setItem('saved_courses', JSON.stringify(staticCours));
        }
      } else {
        console.log('Aucun cours trouvé dans localStorage, utilisation des données statiques');
        setCours(staticCours);
        localStorage.setItem('saved_courses', JSON.stringify(staticCours));
      }
      
      // Tenter de récupérer les données depuis l'API
      try {
        const [classesResponse, professeursResponse, matieresResponse] = await Promise.allSettled([
          fetchClasses(),
          fetchProfesseurs(),
          fetchMatieres()
        ]);
        
        // Vérifier si les requêtes ont réussi
        console.log('Résultats API:', { 
          classes: classesResponse, 
          professeurs: professeursResponse, 
          matieres: matieresResponse 
        });
        
        // Charger les classes depuis l'API ou utiliser les données statiques
        if (classesResponse.status === 'fulfilled' && Array.isArray(classesResponse.value.data)) {
          console.log('Classes chargées depuis l\'API');
          setClasses(classesResponse.value.data);
        } else {
          console.log('Utilisation des classes statiques');
          setClasses(staticClasses);
          localStorage.setItem('schoolAppClasses', JSON.stringify(staticClasses));
        }
        
        // Charger les professeurs depuis localStorage en priorité
        const localProfesseurs = loadProfesseursFromLocalStorage();
        if (localProfesseurs && localProfesseurs.length > 0) {
          console.log('Professeurs chargés depuis localStorage');
          setProfesseurs(localProfesseurs);
        } else if (professeursResponse.status === 'fulfilled' && Array.isArray(professeursResponse.value.data)) {
          console.log('Professeurs chargés depuis l\'API');
          setProfesseurs(professeursResponse.value.data);
          localStorage.setItem('schoolAppProfesseurs', JSON.stringify(professeursResponse.value.data));
        } else {
          console.log('Utilisation des professeurs statiques');
          setProfesseurs(staticProfesseurs);
          localStorage.setItem('schoolAppProfesseurs', JSON.stringify(staticProfesseurs));
        }
        
        // Charger les matières depuis localStorage en priorité
        const localMatieres = loadMatieresFromLocalStorage();
        if (localMatieres && localMatieres.length > 0) {
          console.log('Matières chargées depuis localStorage');
          setMatieres(localMatieres);
        } else if (matieresResponse.status === 'fulfilled' && Array.isArray(matieresResponse.value.data)) {
          console.log('Matières chargées depuis l\'API');
          setMatieres(matieresResponse.value.data);
          localStorage.setItem('schoolAppMatieres', JSON.stringify(matieresResponse.value.data));
        } else {
          console.log('Utilisation des matières statiques');
          setMatieres(staticMatieres);
          localStorage.setItem('schoolAppMatieres', JSON.stringify(staticMatieres));
        }
      } catch (apiError) {
        console.error('Erreur lors de la récupération des données depuis l\'API:', apiError);
        console.log('Utilisation des données statiques suite à l\'erreur');
        setClasses(staticClasses);
        setProfesseurs(staticProfesseurs);
        setMatieres(staticMatieres);
        localStorage.setItem('schoolAppClasses', JSON.stringify(staticClasses));
        localStorage.setItem('schoolAppProfesseurs', JSON.stringify(staticProfesseurs));
        localStorage.setItem('schoolAppMatieres', JSON.stringify(staticMatieres));
      }
      
      // Sélectionner la première entité par défaut si aucune n'est sélectionnée
      if (!selectedEntity) {
        if (viewMode === 'classe' && classes.length > 0) {
          setSelectedEntity(classes[0].id.toString());
        } else if (viewMode === 'professeur' && professeurs.length > 0) {
          setSelectedEntity(professeurs[0].id.toString());
        }
      }
    } catch (error) {
      console.error('Erreur générale lors du chargement des données:', error);
      showSnackbar('Erreur lors du chargement des données', 'error');
      
      // Fallback sur les données statiques en cas d'erreur
      setCours(staticCours);
      setClasses(staticClasses);
      setProfesseurs(staticProfesseurs);
      setMatieres(staticMatieres);
      
      // Sélectionner la première entité par défaut
      if (!selectedEntity) {
        if (viewMode === 'classe' && staticClasses.length > 0) {
          setSelectedEntity(staticClasses[0].id.toString());
        } else if (viewMode === 'professeur' && staticProfesseurs.length > 0) {
          setSelectedEntity(staticProfesseurs[0].id.toString());
        }
      }
    } finally {
      setLoading(false);
    }
  };
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
const renderTimetable = () => {
  return (
    <Paper sx={{ p: 2 }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Jour</TableCell>
              <TableCell>Heure</TableCell>
              <TableCell>Matière</TableCell>
              {viewMode === 'classe' && <TableCell>Professeur</TableCell>}
              {viewMode === 'professeur' && <TableCell>Classe</TableCell>}
              <TableCell>Salle</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCours.length > 0 ? (
              filteredCours.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.jour}</TableCell>
                  <TableCell>{c.heure_debut} - {c.heure_fin}</TableCell>
                  <TableCell>{c.matiere_nom}</TableCell>
                  {viewMode === 'classe' && <TableCell>{c.professeur_nom}</TableCell>}
                  {viewMode === 'professeur' && <TableCell>{c.classe_nom}</TableCell>}
                  <TableCell>{c.salle}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleOpenForm('edit', c)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDeleteClick(c)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Aucun cours trouvé
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
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
              >
                {professeurs.map(prof => (
                  <MenuItem key={prof.id} value={prof.id.toString()}>
                    {prof.prenom} {prof.nom}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.professeur && <Typography color="error" variant="caption">{formErrors.professeur}</Typography>}
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
                // Nous permettons maintenant la sélection de la classe même en mode vue par classe
              >
                {classes.map(classe => (
                  <MenuItem key={classe.id} value={classe.id.toString()}>
                    {classe.nom}
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
                  <MenuItem key={heure.value} value={heure.value}>
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
                {HEURES.map(heure => (
                  <MenuItem key={heure.value} value={heure.value}>
                    {heure.label}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.heure_fin && <Typography color="error" variant="caption">{formErrors.heure_fin}</Typography>}
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Salle"
              name="salle"
              value={formData.salle}
              onChange={handleInputChange}
              error={Boolean(formErrors.salle)}
              helperText={formErrors.salle}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseForm} color="inherit">
          Annuler
        </Button>
        <Button onClick={handleSubmitForm} color="primary" variant="contained">
          {formType === 'add' ? 'Ajouter' : 'Modifier'}
        </Button>
      </DialogActions>
    </Dialog>
    
    {/* Dialogue de confirmation de suppression */}
    <Dialog open={openConfirm} onClose={handleCancelDelete}>
      <DialogTitle>Confirmer la suppression</DialogTitle>
      <DialogContent>
        <Typography>
          Êtes-vous sûr de vouloir supprimer ce cours ?
          {coursToDelete && (
            <Box component="span" sx={{ fontWeight: 'bold', display: 'block', mt: 1 }}>
              {coursToDelete.matiere_nom} - {coursToDelete.jour} {coursToDelete.heure_debut} à {coursToDelete.heure_fin}
            </Box>
          )}
          Cette action est irréversible.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancelDelete} color="inherit">
          Annuler
        </Button>
        <Button onClick={handleConfirmDelete} color="error" variant="contained">
          Supprimer
        </Button>
      </DialogActions>
    </Dialog>
    
    {/* Snackbar pour les notifications */}
    <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={handleCloseSnackbar}>
      <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
        {snackbar.message}
      </Alert>
    </Snackbar>
  </Box>
);
};

export default AdminTimetable;
