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
  Grid,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon
} from '@mui/icons-material';

import { 
  fetchClasses, 
  createClasse, 
  updateClasse, 
  deleteClasse,
} from '../../utils/api';

// Utilisation des API REST pour la gestion des classes avec fallback localStorage

const AdminClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [formType, setFormType] = useState('create'); // 'create' ou 'edit'
  const [currentClasse, setCurrentClasse] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    niveau: '',
    annee_scolaire: '2024-2025'
  });
  const [openConfirm, setOpenConfirm] = useState(false);
  const [classeToDelete, setClasseToDelete] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [formErrors, setFormErrors] = useState({});
  
  // Fonction pour sauvegarder les classes dans localStorage
  const saveClassesToLocalStorage = (updatedClasses) => {
    localStorage.setItem('schoolAppClasses', JSON.stringify(updatedClasses));
  };
  
  // Fonction pour charger les classes depuis localStorage
  const loadClassesFromLocalStorage = () => {
    const savedClasses = localStorage.getItem('schoolAppClasses');
    return savedClasses ? JSON.parse(savedClasses) : null;
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // D'abord, essayer de charger les classes depuis le localStorage
      const savedClasses = loadClassesFromLocalStorage();
      
      // Si des classes existent dans localStorage, les utiliser
      if (savedClasses && savedClasses.length > 0) {
        console.log('Chargement des classes depuis localStorage', savedClasses);
        setClasses(savedClasses);
      } else {
        // Sinon, essayer de les charger depuis l'API
        try {
          // Définir des données statiques pour les classes
          const staticClasses = [
            { id: 1, nom: 'ijh', niveau: 'iuh8', annee_scolaire: '2024-2025', nb_etudiants: 2 },
            { id: 2, nom: 'vg66', niveau: '88', annee_scolaire: '2024-2025', nb_etudiants: 1 },
            { id: 3, nom: 'Terminale S', niveau: 'Terminale', annee_scolaire: '2024-2025', nb_etudiants: 0 },
            { id: 4, nom: 'Première ES', niveau: 'Première', annee_scolaire: '2024-2025', nb_etudiants: 0 },
            { id: 5, nom: 'Seconde A', niveau: 'Seconde', annee_scolaire: '2024-2025', nb_etudiants: 0 }
          ];
          
          const response = await fetchClasses();
          
          if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
            console.error('API a retourné du HTML au lieu de JSON pour les classes');
            setClasses(staticClasses);
            saveClassesToLocalStorage(staticClasses);
          } else if (Array.isArray(response.data)) {
            console.log('Données de classes récupérées depuis l\'API');
            setClasses(response.data);
            saveClassesToLocalStorage(response.data);
          } else {
            console.error('Format de données inattendu');
            setClasses(staticClasses);
            saveClassesToLocalStorage(staticClasses);
          }
        } catch (apiError) {
          console.error('Erreur lors du chargement des classes depuis l\'API:', apiError);
          
          // Données statiques en cas d'erreur
          const staticClasses = [
            { id: 1, nom: 'ijh', niveau: 'iuh8', annee_scolaire: '2024-2025', nb_etudiants: 2 },
            { id: 2, nom: 'vg66', niveau: '88', annee_scolaire: '2024-2025', nb_etudiants: 1 },
            { id: 3, nom: 'Terminale S', niveau: 'Terminale', annee_scolaire: '2024-2025', nb_etudiants: 0 },
            { id: 4, nom: 'Première ES', niveau: 'Première', annee_scolaire: '2024-2025', nb_etudiants: 0 },
            { id: 5, nom: 'Seconde A', niveau: 'Seconde', annee_scolaire: '2024-2025', nb_etudiants: 0 }
          ];
          setClasses(staticClasses);
          saveClassesToLocalStorage(staticClasses);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      showSnackbar('Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (type, classe = null) => {
    setFormType(type);
    setFormErrors({});
    
    if (type === 'edit' && classe) {
      setCurrentClasse(classe);
      setFormData({
        ...classe
      });
    } else {
      // Réinitialiser le formulaire pour la création
      setCurrentClasse(null);
      setFormData({
        nom: '',
        niveau: '',
        annee_scolaire: '2024-2025'
      });
    }
    
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
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
    
    if (!formData.nom) errors.nom = 'Le nom est requis';
    if (!formData.niveau) errors.niveau = 'Le niveau est requis';
    if (!formData.annee_scolaire) errors.annee_scolaire = 'L\'année scolaire est requise';
    else if (!/^\d{4}-\d{4}$/.test(formData.annee_scolaire)) {
      errors.annee_scolaire = 'Format attendu: AAAA-AAAA (ex: 2024-2025)';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitForm = async () => {
    if (!validateForm()) return;
    
    // Debug log des données avant envoi
    console.log('Données du formulaire à envoyer:', formData);
    
    try {
      if (formType === 'create') {
        try {
          // Tenter d'envoyer la requête à l'API en arrière-plan (non bloquant)
          createClasse(formData).then(response => {
            console.log('Réponse API (création):', response);
          }).catch(error => {
            console.error('Erreur API lors de la création (non bloquante):', error);
          });
        } catch (apiError) {
          console.error('Erreur API lors de la création:', apiError);
        }
        
        // Gérer localement pour une expérience utilisateur fluide
        const newId = Date.now(); // ID temporaire
        const newClasse = {
          id: newId,
          nom: formData.nom,
          niveau: formData.niveau,
          annee_scolaire: formData.annee_scolaire || '2024-2025',
          nb_etudiants: 0 // Défaut pour une nouvelle classe
        };
        
        // Mettre à jour l'état local
        const updatedClasses = [...classes, newClasse];
        setClasses(updatedClasses);
        
        // Sauvegarder dans localStorage
        saveClassesToLocalStorage(updatedClasses);
        showSnackbar('Classe ajoutée avec succès', 'success');
      } else if (currentClasse) {
        try {
          // Tenter d'envoyer la requête à l'API en arrière-plan (non bloquant)
          updateClasse(currentClasse.id, formData).then(response => {
            console.log('Réponse API (modification):', response);
          }).catch(error => {
            console.error('Erreur API lors de la modification (non bloquante):', error);
          });
        } catch (apiError) {
          console.error('Erreur API lors de la modification:', apiError);
        }
        
        // Mettre à jour la classe dans la liste locale
        const updatedClasses = classes.map(classe => {
          if (classe.id === currentClasse.id) {
            return {
              ...classe,
              nom: formData.nom,
              niveau: formData.niveau,
              annee_scolaire: formData.annee_scolaire || classe.annee_scolaire
            };
          }
          return classe;
        });
        
        // Mettre à jour l'état local
        setClasses(updatedClasses);
        
        // Sauvegarder dans localStorage
        saveClassesToLocalStorage(updatedClasses);
        showSnackbar('Classe modifiée avec succès', 'success');
      }
      
      // Fermer le formulaire sans appeler loadData() car nous avons déjà mis à jour l'état local
      handleCloseForm();
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      
      // Message d'erreur plus descriptif
      if (error.response && error.response.data) {
        console.error('Détails de l\'erreur:', error.response.data);
        showSnackbar(`Erreur: ${JSON.stringify(error.response.data)}`, 'error');
        
        // Gestion des erreurs de validation du backend
        const backendErrors = {};
        Object.keys(error.response.data).forEach(key => {
          const errorValue = error.response.data[key];
          if (Array.isArray(errorValue)) {
            backendErrors[key] = errorValue.join(' ');
          } else if (typeof errorValue === 'string') {
            backendErrors[key] = errorValue;
          } else {
            backendErrors[key] = String(errorValue);
          }
        });
        setFormErrors(backendErrors);
      } else {
        showSnackbar('Erreur réseau lors de l\'enregistrement', 'error');
      }
    }
  };

  const handleDeleteClick = (classe) => {
    setClasseToDelete(classe);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      let updatedClasses;
      
      if (classeToDelete) {
        // Tentative de suppression via l'API (non bloquante pour l'expérience utilisateur)
        try {
          deleteClasse(classeToDelete.id).then(response => {
            console.log('Réponse API (suppression):', response);
          }).catch(error => {
            console.error('Erreur API lors de la suppression (non bloquante):', error);
          });
        } catch (apiError) {
          console.error('Erreur API lors de la suppression:', apiError);
        }
        
        // Supprimer la classe de la liste locale
        updatedClasses = classes.filter(classe => classe.id !== classeToDelete.id);
        showSnackbar('Classe supprimée avec succès', 'success');
        
      } else if (selectedRows.length > 0) {
        // Tentative de suppression multiple via l'API (non bloquante)
        try {
          selectedRows.forEach(id => {
            deleteClasse(id).then(response => {
              console.log(`Réponse API (suppression de l'ID ${id}):`, response);
            }).catch(error => {
              console.error(`Erreur API lors de la suppression de l'ID ${id} (non bloquante):`, error);
            });
          });
        } catch (apiError) {
          console.error('Erreur API lors de la suppression multiple:', apiError);
        }
        
        // Supprimer les classes sélectionnées de la liste locale
        updatedClasses = classes.filter(classe => !selectedRows.includes(classe.id));
        showSnackbar(`${selectedRows.length} classes supprimées avec succès`, 'success');
        setSelectedRows([]);
      } else {
        return; // Aucun élément à supprimer
      }
      
      // Mettre à jour l'état et le localStorage
      setClasses(updatedClasses);
      saveClassesToLocalStorage(updatedClasses);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showSnackbar('Erreur lors de la suppression: ' + (error.message || 'Erreur inconnue'), 'error');
    } finally {
      setOpenConfirm(false);
      setClasseToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setOpenConfirm(false);
    setClasseToDelete(null);
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

  // Colonnes pour le DataGrid
  const columns = [
    { field: 'nom', headerName: 'Nom', width: 200 },
    { field: 'niveau', headerName: 'Niveau', width: 150 },
    { field: 'annee_scolaire', headerName: 'Année scolaire', width: 150 },
    { 
      field: 'nombre_etudiants', 
      headerName: 'Nombre d\'Etudiants', 
      width: 180,
      valueGetter: (params) => {
        return params.row.etudiant_set ? params.row.etudiant_set.length : 0;
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton 
            color="primary" 
            onClick={() => handleOpenForm('edit', params.row)}
            size="small"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton 
            color="error" 
            onClick={() => handleDeleteClick(params.row)}
            size="small"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Gestion des classes
        </Typography>
        <Box>
          {selectedRows.length > 0 && (
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<DeleteIcon />}
              onClick={() => {
                setClasseToDelete(null);
                setOpenConfirm(true);
              }}
              sx={{ mr: 2 }}
            >
              Supprimer ({selectedRows.length})
            </Button>
          )}
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm('create')}
          >
            Ajouter une classe
          </Button>
        </Box>
      </Box>
      
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={classes}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            pageSizeOptions={[5, 10, 25]}
            checkboxSelection
            disableRowSelectionOnClick
            autoHeight
            sx={{ minHeight: 400 }}
            components={{
              Toolbar: GridToolbar,
            }}
            onRowSelectionModelChange={(newSelection) => {
              setSelectedRows(newSelection);
            }}
          />
        )}
      </Paper>
      
      {/* Formulaire d'ajout/modification */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <DialogTitle>
          {formType === 'create' ? 'Ajouter une classe' : 'Modifier une classe'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                name="nom"
                label="Nom de la classe"
                value={formData.nom}
                onChange={handleInputChange}
                fullWidth
                required
                error={Boolean(formErrors.nom)}
                helperText={formErrors.nom}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="niveau"
                label="Niveau"
                value={formData.niveau}
                onChange={handleInputChange}
                fullWidth
                required
                error={Boolean(formErrors.niveau)}
                helperText={formErrors.niveau}
                placeholder="ex: Seconde, Terminale, CM2..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="annee_scolaire"
                label="Année scolaire"
                value={formData.annee_scolaire}
                onChange={handleInputChange}
                fullWidth
                required
                error={Boolean(formErrors.annee_scolaire)}
                helperText={formErrors.annee_scolaire || 'Format: AAAA-AAAA (ex: 2024-2025)'}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Annuler</Button>
          <Button onClick={handleSubmitForm} variant="contained" color="primary">
            {formType === 'create' ? 'Ajouter' : 'Modifier'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Boîte de dialogue de confirmation de suppression */}
      <Dialog open={openConfirm} onClose={handleCancelDelete}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          {classeToDelete ? (
            <Typography>
              Êtes-vous sûr de vouloir supprimer la classe <strong>{classeToDelete?.nom}</strong> ?
              Cette action est irréversible.
            </Typography>
          ) : (
            <Typography>
              Êtes-vous sûr de vouloir supprimer les <strong>{selectedRows.length}</strong> classes sélectionnées ?
              Cette action est irréversible.
            </Typography>
          )}
          {classeToDelete && classeToDelete.etudiant_set && classeToDelete.etudiant_set.length > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Attention : Cette classe contient {classeToDelete.etudiant_set.length} étudiant(s).
              La suppression affectera ces étudiants.
            </Alert>
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

export default AdminClasses; 