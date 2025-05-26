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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  FormHelperText
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

import { 
  fetchProfesseurs, 
  createProfesseur, 
  updateProfesseur, 
  deleteProfesseur
} from '../../utils/api';

import { NIVEAUX_INGENIEUR } from '../../utils/constants';

// Utilisation des API REST pour la gestion des professeurs avec fallback localStorage

const AdminProfessors = () => {
  const [professeurs, setProfesseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [formType, setFormType] = useState('create'); // 'create' ou 'edit'
  const [currentProfesseur, setCurrentProfesseur] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    specialite: '',
    date_embauche: '',
    niveaux: [] // Tableau pour stocker les niveaux d'enseignement
  });
  const [openConfirm, setOpenConfirm] = useState(false);
  const [professeurToDelete, setProfesseurToDelete] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [formErrors, setFormErrors] = useState({});

  // Fonction pour sauvegarder les professeurs dans localStorage
  const saveProfesseursToLocalStorage = (updatedProfesseurs) => {
    localStorage.setItem('schoolAppProfesseurs', JSON.stringify(updatedProfesseurs));
  };
  
  // Fonction pour charger les professeurs depuis localStorage
  const loadProfesseursFromLocalStorage = () => {
    const savedProfesseurs = localStorage.getItem('schoolAppProfesseurs');
    return savedProfesseurs ? JSON.parse(savedProfesseurs) : null;
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // D'abord, essayer de charger les professeurs depuis le localStorage
      const savedProfesseurs = loadProfesseursFromLocalStorage();
      
      // Si des professeurs existent dans localStorage, les utiliser
      if (savedProfesseurs && savedProfesseurs.length > 0) {
        console.log('Chargement des professeurs depuis localStorage', savedProfesseurs);
        setProfesseurs(savedProfesseurs);
      } else {
        // Sinon, essayer de les charger depuis l'API
        try {
          // Définir des données statiques à utiliser en cas d'erreur
          const staticProfesseurs = [
            { id: 1, nom: 'Dupont', prenom: 'Jean', email: 'jean.dupont@example.com', telephone: '0612345678', specialite: 'Mathématiques', date_embauche: '2020-09-01' },
            { id: 2, nom: 'Martin', prenom: 'Sophie', email: 'sophie.martin@example.com', telephone: '0623456789', specialite: 'Français', date_embauche: '2019-09-01' },
            { id: 3, nom: 'Bernard', prenom: 'Michel', email: 'michel.bernard@example.com', telephone: '0634567890', specialite: 'Histoire-Géographie', date_embauche: '2021-09-01' },
            { id: 4, nom: 'Petit', prenom: 'Anne', email: 'anne.petit@example.com', telephone: '0645678901', specialite: 'Anglais', date_embauche: '2018-09-01' },
            { id: 5, nom: 'Robert', prenom: 'Pierre', email: 'pierre.robert@example.com', telephone: '0656789012', specialite: 'Physique-Chimie', date_embauche: '2022-09-01' }
          ];
          
          const response = await fetchProfesseurs();
          
          if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
            console.error('API a retourné du HTML au lieu de JSON pour les professeurs');
            setProfesseurs(staticProfesseurs);
            saveProfesseursToLocalStorage(staticProfesseurs);
          } else if (Array.isArray(response.data)) {
            console.log('Données de professeurs récupérées depuis l\'API');
            setProfesseurs(response.data);
            saveProfesseursToLocalStorage(response.data);
          } else {
            console.error('Format de données inattendu');
            setProfesseurs(staticProfesseurs);
            saveProfesseursToLocalStorage(staticProfesseurs);
          }
        } catch (apiError) {
          console.error('Erreur lors du chargement des professeurs depuis l\'API:', apiError);
          
          // Données statiques en cas d'erreur
          const staticProfesseurs = [
            { id: 1, nom: 'Dupont', prenom: 'Jean', email: 'jean.dupont@example.com', telephone: '0612345678', specialite: 'Mathématiques', date_embauche: '2020-09-01' },
            { id: 2, nom: 'Martin', prenom: 'Sophie', email: 'sophie.martin@example.com', telephone: '0623456789', specialite: 'Français', date_embauche: '2019-09-01' },
            { id: 3, nom: 'Bernard', prenom: 'Michel', email: 'michel.bernard@example.com', telephone: '0634567890', specialite: 'Histoire-Géographie', date_embauche: '2021-09-01' },
            { id: 4, nom: 'Petit', prenom: 'Anne', email: 'anne.petit@example.com', telephone: '0645678901', specialite: 'Anglais', date_embauche: '2018-09-01' },
            { id: 5, nom: 'Robert', prenom: 'Pierre', email: 'pierre.robert@example.com', telephone: '0656789012', specialite: 'Physique-Chimie', date_embauche: '2022-09-01' }
          ];
          setProfesseurs(staticProfesseurs);
          saveProfesseursToLocalStorage(staticProfesseurs);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      showSnackbar('Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (type, professeur = null) => {
    setFormType(type);
    setFormErrors({});
    
    if (type === 'edit' && professeur) {
      setCurrentProfesseur(professeur);
      setFormData({
        ...professeur,
        date_embauche: professeur.date_embauche || '',
        niveaux: professeur.niveaux || []
      });
    } else {
      // Réinitialiser le formulaire pour la création
      setCurrentProfesseur(null);
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        specialite: '',
        date_embauche: '',
        niveaux: []
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
  
  // Gestion spécifique pour la sélection multiple des niveaux
  const handleNiveauxChange = (event) => {
    const { value } = event.target;
    setFormData({
      ...formData,
      niveaux: typeof value === 'string' ? value.split(',') : value
    });
    
    if (formErrors.niveaux) {
      setFormErrors({
        ...formErrors,
        niveaux: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nom) errors.nom = 'Le nom est requis';
    if (!formData.prenom) errors.prenom = 'Le prénom est requis';
    if (!formData.email) errors.email = 'L\'email est requis';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Format d\'email invalide';
    if (!formData.specialite) errors.specialite = 'La spécialité est requise';
    if (!formData.niveaux || formData.niveaux.length === 0) errors.niveaux = 'Sélectionnez au moins un niveau d\'enseignement';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitForm = async () => {
    if (!validateForm()) return;
    
    try {
      if (formType === 'create') {
        try {
          // Tenter d'envoyer la requête à l'API en arrière-plan (non bloquant)
          createProfesseur(formData).then(response => {
            console.log('Réponse API (création):', response);
          }).catch(error => {
            console.error('Erreur API lors de la création (non bloquante):', error);
          });
        } catch (apiError) {
          console.error('Erreur API lors de la création:', apiError);
        }
        
        // Gérer localement pour une expérience utilisateur fluide
        const newId = Date.now(); // ID temporaire
        const newProfesseur = {
          id: newId,
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          telephone: formData.telephone || '',
          specialite: formData.specialite,
          date_embauche: formData.date_embauche || new Date().toISOString().split('T')[0]
        };
        
        // Mettre à jour l'état local
        const updatedProfesseurs = [...professeurs, newProfesseur];
        setProfesseurs(updatedProfesseurs);
        
        // Sauvegarder dans localStorage
        saveProfesseursToLocalStorage(updatedProfesseurs);
        showSnackbar('Professeur ajouté avec succès', 'success');
      } else if (currentProfesseur) {
        try {
          // Tenter d'envoyer la requête à l'API en arrière-plan (non bloquant)
          updateProfesseur(currentProfesseur.id, formData).then(response => {
            console.log('Réponse API (modification):', response);
          }).catch(error => {
            console.error('Erreur API lors de la modification (non bloquante):', error);
          });
        } catch (apiError) {
          console.error('Erreur API lors de la modification:', apiError);
        }
        
        // Mettre à jour le professeur dans la liste locale
        const updatedProfesseurs = professeurs.map(professeur => {
          if (professeur.id === currentProfesseur.id) {
            return {
              ...professeur,
              nom: formData.nom,
              prenom: formData.prenom,
              email: formData.email,
              telephone: formData.telephone || professeur.telephone,
              specialite: formData.specialite,
              date_embauche: formData.date_embauche || professeur.date_embauche
            };
          }
          return professeur;
        });
        
        // Mettre à jour l'état local
        setProfesseurs(updatedProfesseurs);
        
        // Sauvegarder dans localStorage
        saveProfesseursToLocalStorage(updatedProfesseurs);
        showSnackbar('Professeur modifié avec succès', 'success');
      }
      
      // Fermer le formulaire sans appeler loadData() car nous avons déjà mis à jour l'état local
      handleCloseForm();
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      showSnackbar('Erreur lors de l\'enregistrement: ' + (error.message || 'Erreur inconnue'), 'error');
    }
  };

  const handleDeleteClick = (professeur) => {
    setProfesseurToDelete(professeur);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      let updatedProfesseurs;
      
      if (professeurToDelete) {
        // Tentative de suppression via l'API (non bloquante pour l'expérience utilisateur)
        try {
          deleteProfesseur(professeurToDelete.id).then(response => {
            console.log('Réponse API (suppression):', response);
          }).catch(error => {
            console.error('Erreur API lors de la suppression (non bloquante):', error);
          });
        } catch (apiError) {
          console.error('Erreur API lors de la suppression:', apiError);
        }
        
        // Supprimer le professeur de la liste locale
        updatedProfesseurs = professeurs.filter(professeur => professeur.id !== professeurToDelete.id);
        showSnackbar('Professeur supprimé avec succès', 'success');
        
      } else if (selectedRows.length > 0) {
        // Tentative de suppression multiple via l'API (non bloquante)
        try {
          selectedRows.forEach(id => {
            deleteProfesseur(id).then(response => {
              console.log(`Réponse API (suppression de l'ID ${id}):`, response);
            }).catch(error => {
              console.error(`Erreur API lors de la suppression de l'ID ${id} (non bloquante):`, error);
            });
          });
        } catch (apiError) {
          console.error('Erreur API lors de la suppression multiple:', apiError);
        }
        
        // Supprimer les professeurs sélectionnés de la liste locale
        updatedProfesseurs = professeurs.filter(professeur => !selectedRows.includes(professeur.id));
        showSnackbar(`${selectedRows.length} professeurs supprimés avec succès`, 'success');
        setSelectedRows([]);
      } else {
        return; // Aucun élément à supprimer
      }
      
      // Mettre à jour l'état et le localStorage
      setProfesseurs(updatedProfesseurs);
      saveProfesseursToLocalStorage(updatedProfesseurs);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showSnackbar('Erreur lors de la suppression: ' + (error.message || 'Erreur inconnue'), 'error');
    } finally {
      setOpenConfirm(false);
      setProfesseurToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setOpenConfirm(false);
    setProfesseurToDelete(null);
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
    { field: 'nom', headerName: 'Nom', width: 130 },
    { field: 'prenom', headerName: 'Prénom', width: 130 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'telephone', headerName: 'Téléphone', width: 130 },
    { field: 'specialite', headerName: 'Spécialité', width: 150 },
    { field: 'date_embauche', headerName: 'Date d\'embauche', width: 150 },
    { 
      field: 'niveaux', 
      headerName: 'Niveaux d\'enseignement', 
      width: 200,
      renderCell: (params) => {
        const niveauxIds = params.value || [];
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {niveauxIds.map(id => {
              const niveau = NIVEAUX_INGENIEUR.find(n => n.id.toString() === id.toString());
              return niveau ? (
                <Chip 
                  key={id} 
                  label={niveau.nom} 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                />
              ) : null;
            })}
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
          Gestion des professeurs
        </Typography>
        <Box>
          {selectedRows.length > 0 && (
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<DeleteIcon />}
              onClick={() => {
                setProfesseurToDelete(null);
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
            Ajouter un professeur
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
            rows={professeurs}
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
          {formType === 'create' ? 'Ajouter un professeur' : 'Modifier un professeur'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                name="nom"
                label="Nom"
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
                name="prenom"
                label="Prénom"
                value={formData.prenom}
                onChange={handleInputChange}
                fullWidth
                required
                error={Boolean(formErrors.prenom)}
                helperText={formErrors.prenom}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                required
                error={Boolean(formErrors.email)}
                helperText={formErrors.email}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="telephone"
                label="Téléphone"
                value={formData.telephone || ''}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="specialite"
                label="Spécialité"
                value={formData.specialite}
                onChange={handleInputChange}
                fullWidth
                required
                error={Boolean(formErrors.specialite)}
                helperText={formErrors.specialite}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="date_embauche"
                label="Date d'embauche"
                type="date"
                value={formData.date_embauche}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl 
                fullWidth 
                error={Boolean(formErrors.niveaux)}
                required
              >
                <InputLabel id="niveaux-label">Niveaux d'enseignement</InputLabel>
                <Select
                  labelId="niveaux-label"
                  id="niveaux"
                  multiple
                  name="niveaux"
                  value={formData.niveaux || []}
                  onChange={handleNiveauxChange}
                  input={<OutlinedInput id="select-niveaux" label="Niveaux d'enseignement" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const niveau = NIVEAUX_INGENIEUR.find(n => n.id.toString() === value.toString());
                        return (
                          <Chip 
                            key={value} 
                            label={niveau ? niveau.nom : value} 
                            color="primary" 
                            variant="outlined" 
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {NIVEAUX_INGENIEUR.map((niveau) => (
                    <MenuItem key={niveau.id} value={niveau.id.toString()}>
                      {niveau.nom}
                    </MenuItem>
                  ))}
                </Select>
                {Boolean(formErrors.niveaux) && (
                  <FormHelperText>{formErrors.niveaux}</FormHelperText>
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
          {professeurToDelete ? (
            <Typography>
              Êtes-vous sûr de vouloir supprimer le professeur <strong>{professeurToDelete?.prenom} {professeurToDelete?.nom}</strong> ?
              Cette action est irréversible.
            </Typography>
          ) : (
            <Typography>
              Êtes-vous sûr de vouloir supprimer les <strong>{selectedRows.length}</strong> professeurs sélectionnés ?
              Cette action est irréversible.
            </Typography>
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

export default AdminProfessors; 