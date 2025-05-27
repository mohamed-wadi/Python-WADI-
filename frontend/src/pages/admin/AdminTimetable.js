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

import { coursService, classeService, professeurService, matiereService } from '../../utils/apiService';

import { NIVEAUX_INGENIEUR, JOURS_SEMAINE, HEURES_JOURNEE } from '../../utils/constants';

// Fonctions pour gérer les données via l'API REST
const loadClasses = async () => {
  try {
    const data = await classeService.getAll();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erreur lors du chargement des classes depuis l\'API:', error);
    return [];
  }
};

const loadProfesseurs = async () => {
  try {
    const data = await professeurService.getAll();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erreur lors du chargement des professeurs depuis l\'API:', error);
    return [];
  }
};

const loadMatieres = async () => {
  try {
    const data = await matiereService.getAll();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erreur lors du chargement des matières depuis l\'API:', error);
    return [];
  }
};

const loadCours = async () => {
  try {
    const data = await coursService.getAll();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erreur lors du chargement des cours depuis l\'API:', error);
    return [];
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

// Données statiques pour le fallback (utilisant les mêmes niveaux d'ingénieur)
const staticClasses = [
  { id: 1, nom: 'Classe ING1-A', niveau: '1', annee_scolaire: '2024-2025', nb_etudiants: 0 },
  { id: 2, nom: 'Classe ING2-A', niveau: '2', annee_scolaire: '2024-2025', nb_etudiants: 0 },
  { id: 3, nom: 'Classe ING3-A', niveau: '3', annee_scolaire: '2024-2025', nb_etudiants: 0 },
  { id: 4, nom: 'Classe ING4-A', niveau: '4', annee_scolaire: '2024-2025', nb_etudiants: 0 },
  { id: 5, nom: 'Classe ING5-A', niveau: '5', annee_scolaire: '2024-2025', nb_etudiants: 0 }
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
  const [selectedNiveau, setSelectedNiveau] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  
  // États pour le formulaire
  const [openForm, setOpenForm] = useState(false);
  const [formType, setFormType] = useState('add'); // 'add' ou 'edit'
  const [formData, setFormData] = useState({
    matiere: '',
    professeur: '',
    classe: '',
    niveau: '', // Ajout du niveau
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
      // Charger toutes les données depuis l'API
      try {
        // Charger les cours
        const coursData = await loadCours();
        if (coursData.length > 0) {
          console.log('Cours chargés depuis l\'API');
          setCours(coursData);
        } else {
          console.log('Aucun cours trouvé, utilisation des données statiques');
          setCours(staticCours);
          // Créer les cours statiques dans la base de données
          for (const cours of staticCours) {
            try {
              await coursService.create(cours);
            } catch (err) {
              console.error('Erreur lors de la création du cours statique:', err);
            }
          }
        }
        
        // Charger les classes
        const classesData = await loadClasses();
        if (classesData.length > 0) {
          console.log('Classes chargées depuis l\'API');
          setClasses(classesData);
        } else {
          console.log('Utilisation des classes statiques');
          setClasses(staticClasses);
        }
        
        // Charger les professeurs
        const professeursData = await loadProfesseurs();
        if (professeursData.length > 0) {
          console.log('Professeurs chargés depuis l\'API');
          setProfesseurs(professeursData);
        } else {
          console.log('Utilisation des professeurs statiques');
          setProfesseurs(staticProfesseurs);
        }
        
        // Charger les matières
        const matieresData = await loadMatieres();
        if (matieresData.length > 0) {
          console.log('Matières chargées depuis l\'API');
          setMatieres(matieresData);
        } else {
          console.log('Utilisation des matières statiques');
          setMatieres(staticMatieres);
        }
      } catch (apiError) {
        console.error('Erreur lors de la récupération des données depuis l\'API:', apiError);
        console.log('Utilisation des données statiques suite à l\'erreur');
        setClasses(staticClasses);
        setProfesseurs(staticProfesseurs);
        setMatieres(staticMatieres);
        setCours(staticCours);
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
  
  // Si le niveau change, réinitialiser la classe sélectionnée
  if (name === 'niveau') {
    // Vérifier si une classe du nouveau niveau existe
    const classesNiveau = classes.filter(c => c.niveau === value);
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Réinitialiser la classe si aucune classe n'est disponible pour ce niveau
      // ou si la classe actuelle n'est pas du niveau sélectionné
      classe: classesNiveau.length > 0 ? 
        (classesNiveau.find(c => c.id.toString() === prev.classe) ? prev.classe : classesNiveau[0].id.toString()) : 
        ''
    }));
  } else {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }
};

const validateForm = () => {
  const errors = {};
  if (!formData.matiere) errors.matiere = 'La matière est obligatoire';
  if (!formData.professeur) errors.professeur = 'Le professeur est obligatoire';
  if (!formData.niveau) errors.niveau = 'Le niveau est obligatoire';
  if (!formData.classe) errors.classe = 'La classe est obligatoire';
  if (!formData.jour) errors.jour = 'Le jour est obligatoire';
  if (!formData.heure_debut) errors.heure_debut = 'L\'heure de début est obligatoire';
  if (!formData.heure_fin) errors.heure_fin = 'L\'heure de fin est obligatoire';
  
  // Vérifier que le professeur enseigne au niveau sélectionné
  const professeurSelected = professeurs.find(p => p.id === parseInt(formData.professeur));
  
  if (professeurSelected && formData.niveau) {
    console.log('Vérification des niveaux pour le professeur:', professeurSelected.prenom, professeurSelected.nom);
    console.log('Niveaux du professeur:', professeurSelected.niveaux);
    console.log('Niveau sélectionné:', formData.niveau);
    
    // Vérifier si le professeur a des niveaux assignés
    if (!professeurSelected.niveaux || !Array.isArray(professeurSelected.niveaux)) {
      console.log('Le professeur n\'a pas de niveaux assignés ou le format est incorrect');
      // Par défaut, considérer que le professeur enseigne à tous les niveaux
      // si aucune information n'est disponible
      return true;
    }
    
    // Vérifier si le niveau sélectionné est dans la liste des niveaux du professeur
    // en tenant compte des différents formats possibles (string vs number)
    const niveauTrouve = professeurSelected.niveaux.some(niveau => {
      // Convertir les deux valeurs en chaînes pour éviter les problèmes de type
      return niveau.toString() === formData.niveau.toString();
    });
    
    console.log('Niveau trouvé dans la liste des niveaux du professeur:', niveauTrouve);
    
    if (!niveauTrouve) {
      errors.professeur = 'Ce professeur n\'enseigne pas à ce niveau';
    }
  }
  
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
      niveau: formData.niveau,
      jour: formData.jour,
      heure_debut: formData.heure_debut,
      heure_fin: formData.heure_fin,
      salle: formData.salle
    };
    
    if (formType === 'add') {
      // Créer un nouveau cours via l'API REST
      const newCourse = await coursService.create(courseData);
      
      // Ajouter le cours à l'état local
      setCours(currentCours => {
        const currentArray = Array.isArray(currentCours) ? currentCours : [];
        return [...currentArray, newCourse];
      });
      
      showSnackbar('Cours ajouté avec succès', 'success');
    } else if (formType === 'edit' && editingCours) {
      // Mettre à jour un cours existant via l'API REST
      const updatedCourse = await coursService.update(editingCours.id, courseData);
      
      // Mettre à jour l'état local
      setCours(currentCours => {
        const currentArray = Array.isArray(currentCours) ? currentCours : [];
        return currentArray.map(c => c.id === editingCours.id ? updatedCourse : c);
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
    // Supprimer le cours via l'API REST
    await coursService.delete(coursToDelete.id);
    
    // Mettre à jour l'état local
    setCours(cours.filter(c => c.id !== coursToDelete.id));
    showSnackbar('Cours supprimé avec succès', 'success');
  } catch (error) {
    console.error('Erreur lors de la suppression du cours:', error);
    showSnackbar('Erreur lors de la suppression: ' + (error.message || 'Erreur inconnue'), 'error');
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

// Filtrer les cours selon le mode de vue, l'entité sélectionnée et le niveau
const filteredCours = Array.isArray(cours) ? cours.filter(c => {
  if (!c || (typeof c !== 'object')) return false;
  
  // Filtre de niveau (prioritaire)
  if (selectedNiveau && c.niveau !== selectedNiveau) {
    return false;
  }
  
  // Filtres par entité (classe ou professeur)
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
              <TableCell>Niveau</TableCell>
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
                  <TableCell>
                    {c.niveau ? (
                      NIVEAUX_INGENIEUR.find(n => n.id.toString() === c.niveau.toString())?.nom || c.niveau
                    ) : 'Non défini'}
                  </TableCell>
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
    
    <Box sx={{ mb: 2 }}>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="niveau-select-label">Sélectionner un niveau</InputLabel>
        <Select
          labelId="niveau-select-label"
          value={selectedNiveau}
          label="Sélectionner un niveau"
          onChange={(e) => {
            setSelectedNiveau(e.target.value);
            // Filtrer les professeurs qui enseignent à ce niveau
            if (viewMode === 'professeur' && professeurs.length > 0) {
              const profsNiveau = professeurs.filter(p => 
                p.niveaux && p.niveaux.includes(e.target.value)
              );
              if (profsNiveau.length > 0) {
                setSelectedEntity(profsNiveau[0].id.toString());
              }
            }
          }}
        >
          <MenuItem value="">Tous les niveaux</MenuItem>
          {NIVEAUX_INGENIEUR.map(niveau => (
            <MenuItem key={niveau.id} value={niveau.id.toString()}>
              {niveau.nom}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
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
            // Filtrer les classes par niveau si un niveau est sélectionné
            classes
              .filter(classe => !selectedNiveau || classe.niveau === selectedNiveau)
              .map(classe => {
                // Récupérer le nom du niveau au lieu de l'ID
                const niveauObj = NIVEAUX_INGENIEUR.find(n => n.id.toString() === classe.niveau);
                const niveauNom = niveauObj ? niveauObj.nom : classe.niveau;
                
                return (
                  <MenuItem key={classe.id} value={classe.id.toString()}>
                    {classe.nom} ({niveauNom})
                  </MenuItem>
                );
              })
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
            <FormControl fullWidth error={Boolean(formErrors.niveau)}>
              <InputLabel id="niveau-label">Niveau</InputLabel>
              <Select
                labelId="niveau-label"
                name="niveau"
                value={formData.niveau}
                onChange={handleInputChange}
                label="Niveau"
              >
                {NIVEAUX_INGENIEUR.map(niveau => (
                  <MenuItem key={niveau.id} value={niveau.id.toString()}>
                    {niveau.nom}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.niveau && <Typography color="error" variant="caption">{formErrors.niveau}</Typography>}
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
                {classes
                  .filter(classe => !formData.niveau || classe.niveau === formData.niveau)
                  .map(classe => {
                    // Récupérer le nom du niveau au lieu de l'ID
                    const niveauObj = NIVEAUX_INGENIEUR.find(n => n.id.toString() === classe.niveau);
                    const niveauNom = niveauObj ? niveauObj.nom : classe.niveau;
                    
                    return (
                      <MenuItem key={classe.id} value={classe.id.toString()}>
                        {classe.nom} ({niveauNom})
                      </MenuItem>
                    );
                  })}
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
