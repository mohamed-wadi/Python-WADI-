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
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetchClasses();
      setClasses(response.data);
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
      let response;
      if (formType === 'create') {
        // Obtenir le token CSRF des cookies
        const csrfToken = document.cookie.split('; ')
          .find(row => row.startsWith('csrftoken='))
          ?.split('=')[1];
        
        console.log('CSRF Token:', csrfToken);
        
        // Approche directe sans utiliser l'API helper pour le débogage
        response = await fetch('http://localhost:8000/api/classes/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken || '',
          },
          body: JSON.stringify(formData),
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Erreur détaillée:', errorData);
          throw { response: { data: errorData } };
        }
        
        showSnackbar('Classe créée avec succès', 'success');
      } else {
        // Obtenir le token CSRF des cookies
        const csrfToken = document.cookie.split('; ')
          .find(row => row.startsWith('csrftoken='))
          ?.split('=')[1];
        
        console.log('CSRF Token:', csrfToken);
        
        // Approche directe sans utiliser l'API helper pour le débogage
        response = await fetch(`http://localhost:8000/api/classes/${currentClasse.id}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken || '',
          },
          body: JSON.stringify(formData),
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Erreur détaillée:', errorData);
          throw { response: { data: errorData } };
        }
        
        showSnackbar('Classe modifiée avec succès', 'success');
      }
      
      // Recharger la liste des classes
      loadData();
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
    if (!classeToDelete) return;
    
    try {
      await deleteClasse(classeToDelete.id);
      showSnackbar('Classe supprimée avec succès', 'success');
      loadData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showSnackbar('Erreur lors de la suppression', 'error');
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
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm('create')}
        >
          Ajouter une classe
        </Button>
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
          <Typography>
            Êtes-vous sûr de vouloir supprimer la classe <strong>{classeToDelete?.nom}</strong> ?
            Cette action est irréversible.
          </Typography>
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