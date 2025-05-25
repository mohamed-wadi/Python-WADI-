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
  Chip
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MenuBook as MenuBookIcon
} from '@mui/icons-material';

import { 
  fetchMatieres, 
  createMatiere, 
  updateMatiere, 
  deleteMatiere,
  fetchProfesseurs,
  fetchClasses
} from '../../utils/api';

const AdminSubjects = () => {
  const [matieres, setMatieres] = useState([]);
  const [professeurs, setProfesseurs] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [formType, setFormType] = useState('create'); // 'create' ou 'edit'
  const [currentMatiere, setCurrentMatiere] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    code: '',
    coefficient: 1,
    professeur: '',
    classes: []
  });
  const [openConfirm, setOpenConfirm] = useState(false);
  const [matiereToDelete, setMatiereToDelete] = useState(null);
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
      const [matieresResponse, professeursResponse, classesResponse] = await Promise.all([
        fetchMatieres(),
        fetchProfesseurs(),
        fetchClasses()
      ]);
      setMatieres(matieresResponse.data);
      setProfesseurs(professeursResponse.data);
      setClasses(classesResponse.data);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      showSnackbar('Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (type, matiere = null) => {
    setFormType(type);
    setFormErrors({});
    
    if (type === 'edit' && matiere) {
      setCurrentMatiere(matiere);
      const formattedData = {
        ...matiere,
        professeur: matiere.professeur ? matiere.professeur.id : '',
        classes: matiere.classes ? matiere.classes.map(classe => classe.id) : []
      };
      setFormData(formattedData);
    } else {
      // Réinitialiser le formulaire pour la création
      setCurrentMatiere(null);
      setFormData({
        nom: '',
        code: '',
        coefficient: 1,
        professeur: '',
        classes: []
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
    if (!formData.code) errors.code = 'Le code est requis';
    if (!formData.coefficient) errors.coefficient = 'Le coefficient est requis';
    if (formData.classes.length === 0) errors.classes = 'Sélectionnez au moins une classe';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitForm = async () => {
    if (!validateForm()) return;
    
    // Debug log des données avant envoi
    console.log('Données de la matière à envoyer:', formData);
    
    try {
      let response;
      if (formType === 'create') {
        // Approche directe sans utiliser l'API helper pour le débogage
        response = await fetch('http://localhost:8000/api/matieres/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Erreur détaillée:', errorData);
          throw { response: { data: errorData } };
        }
        
        showSnackbar('Matière créée avec succès', 'success');
      } else {
        // Approche directe sans utiliser l'API helper pour le débogage
        response = await fetch(`http://localhost:8000/api/matieres/${currentMatiere.id}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Erreur détaillée:', errorData);
          throw { response: { data: errorData } };
        }
        
        showSnackbar('Matière modifiée avec succès', 'success');
      }
      
      // Recharger la liste des matières
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

  const handleDeleteClick = (matiere) => {
    setMatiereToDelete(matiere);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!matiereToDelete) return;
    
    try {
      await deleteMatiere(matiereToDelete.id);
      showSnackbar('Matière supprimée avec succès', 'success');
      loadData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showSnackbar('Erreur lors de la suppression', 'error');
    } finally {
      setOpenConfirm(false);
      setMatiereToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setOpenConfirm(false);
    setMatiereToDelete(null);
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
    { field: 'code', headerName: 'Code', width: 100 },
    { field: 'nom', headerName: 'Nom', width: 200 },
    { 
      field: 'coefficient', 
      headerName: 'Coefficient', 
      width: 120,
      type: 'number'
    },
    { 
      field: 'professeur', 
      headerName: 'Professeur', 
      width: 200,
      valueGetter: (params) => params.row.professeur ? `${params.row.professeur.prenom} ${params.row.professeur.nom}` : 'Non assigné'
    },
    { 
      field: 'classes', 
      headerName: 'Classes', 
      width: 250,
      renderCell: (params) => {
        if (!params.row.classes || params.row.classes.length === 0) {
          return 'Aucune classe';
        }
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {params.row.classes.slice(0, 3).map((classe) => (
              <Chip 
                key={classe.id} 
                label={classe.nom} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            ))}
            {params.row.classes.length > 3 && (
              <Chip 
                label={`+${params.row.classes.length - 3}`} 
                size="small" 
                color="default" 
                variant="outlined"
              />
            )}
          </Box>
        );
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
          Gestion des matières
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm('create')}
        >
          Ajouter une matière
        </Button>
      </Box>
      
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={matieres}
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
          {formType === 'create' ? 'Ajouter une matière' : 'Modifier une matière'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                name="nom"
                label="Nom de la matière"
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
                name="code"
                label="Code"
                value={formData.code}
                onChange={handleInputChange}
                fullWidth
                required
                error={Boolean(formErrors.code)}
                helperText={formErrors.code}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="coefficient"
                label="Coefficient"
                type="number"
                InputProps={{ inputProps: { min: 1, max: 10 } }}
                value={formData.coefficient}
                onChange={handleInputChange}
                fullWidth
                required
                error={Boolean(formErrors.coefficient)}
                helperText={formErrors.coefficient}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="professeur-label">Professeur</InputLabel>
                <Select
                  labelId="professeur-label"
                  name="professeur"
                  value={formData.professeur}
                  onChange={handleInputChange}
                  label="Professeur"
                >
                  <MenuItem value="">Non assigné</MenuItem>
                  {professeurs.map((professeur) => (
                    <MenuItem key={professeur.id} value={professeur.id}>
                      {professeur.prenom} {professeur.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required error={Boolean(formErrors.classes)}>
                <InputLabel id="classes-label">Classes</InputLabel>
                <Select
                  labelId="classes-label"
                  name="classes"
                  multiple
                  value={formData.classes}
                  onChange={handleInputChange}
                  label="Classes"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const classe = classes.find(c => c.id === value);
                        return classe ? (
                          <Chip key={value} label={classe.nom} />
                        ) : null;
                      })}
                    </Box>
                  )}
                >
                  {classes.map((classe) => (
                    <MenuItem key={classe.id} value={classe.id}>
                      {classe.nom} - {classe.niveau}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.classes && (
                  <Typography color="error" variant="caption">
                    {formErrors.classes}
                  </Typography>
                )}
              </FormControl>
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
            Êtes-vous sûr de vouloir supprimer la matière <strong>{matiereToDelete?.nom}</strong> ?
            Cette action est irréversible.
          </Typography>
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

export default AdminSubjects; 