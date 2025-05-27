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

import { professeurService } from '../../utils/apiService';
import { NIVEAUX_INGENIEUR, FILIERES_CHOICES } from '../../utils/constants';
import { ENTITY_KEYS, markEntityAsDeleted, isEntityDeleted } from '../../utils/persistenceManager';

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
    filieres: [], // Tableau pour stocker les filières d'enseignement (remplace specialite)
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

  // Plus besoin de fonctions localStorage, nous utilisons l'API REST

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Vérifier si les professeurs ont été supprimés par l'utilisateur
      if (isEntityDeleted(ENTITY_KEYS.PROFESSEURS)) {
        console.log('Les professeurs ont été marqués comme supprimés, affichage d\'une liste vide');
        setProfesseurs([]);
        setLoading(false);
        return;
      }
      
      // Chargement des professeurs depuis l'API REST
      try {
        const professeursData = await professeurService.getAll();
        console.log('Données de professeurs récupérées depuis l\'API');
        
        if (Array.isArray(professeursData)) {
          setProfesseurs(professeursData);
          
          // Si le tableau est vide, marquer l'entité comme supprimée
          if (professeursData.length === 0) {
            markEntityAsDeleted(ENTITY_KEYS.PROFESSEURS);
          }
        } else {
          console.warn('Format de données inattendu:', professeursData);
          setProfesseurs([]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des professeurs depuis l\'API:', error);
        setProfesseurs([]);
        showSnackbar('Erreur lors du chargement des professeurs', 'error');
      }
    } catch (error) {
      console.error('Erreur générale lors du chargement des données:', error);
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
      
      // Convertir l'ancienne spécialité en tableau de filières si nécessaire
      let filieres = professeur.filieres || [];
      
      // Si l'ancien champ specialite existe et que filieres est vide, essayer de le convertir
      if (professeur.specialite && (!filieres || filieres.length === 0)) {
        // Chercher si la spécialité correspond à l'une des filières
        const filiereMatch = FILIERES_CHOICES.find(f => 
          f.label.toLowerCase().includes(professeur.specialite.toLowerCase()) || 
          f.value.toLowerCase().includes(professeur.specialite.toLowerCase())
        );
        
        if (filiereMatch) {
          filieres = [filiereMatch.value];
        }
      }
      
      setFormData({
        ...professeur,
        filieres: filieres,
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
        filieres: [],
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
  
  // Gestion spécifique pour la sélection multiple des filières
  const handleFilieresChange = (event) => {
    const { value } = event.target;
    setFormData({
      ...formData,
      filieres: typeof value === 'string' ? value.split(',') : value
    });
    
    if (formErrors.filieres) {
      setFormErrors({
        ...formErrors,
        filieres: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nom) errors.nom = 'Le nom est requis';
    if (!formData.filieres || formData.filieres.length === 0) errors.filieres = 'Au moins une filière est requise';
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
        // Créer un nouveau professeur via l'API REST
        const newProfesseur = await professeurService.create(formData);
        console.log('Professeur créé avec succès:', newProfesseur);
        
        // Mettre à jour l'état local
        setProfesseurs([...professeurs, newProfesseur]);
        showSnackbar('Professeur ajouté avec succès', 'success');
      } else if (currentProfesseur) {
        // Mettre à jour le professeur via l'API REST
        const updatedProfesseur = await professeurService.update(currentProfesseur.id, formData);
        console.log('Professeur mis à jour avec succès:', updatedProfesseur);
        
        // Mettre à jour l'état local
        const updatedProfesseurs = professeurs.map(professeur => 
          professeur.id === currentProfesseur.id ? updatedProfesseur : professeur
        );
        setProfesseurs(updatedProfesseurs);
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
      let deleted = false;
      let allDeleted = false;
      
      if (professeurToDelete) {
        // Suppression d'un seul professeur
        try {
          await professeurService.delete(professeurToDelete.id);
          
          // Mettre à jour l'état local
          const updatedProfesseurs = professeurs.filter(p => p.id !== professeurToDelete.id);
          setProfesseurs(updatedProfesseurs);
          deleted = true;
          
          // Vérifier si c'était le dernier professeur
          if (updatedProfesseurs.length === 0) {
            allDeleted = true;
          }
          
          showSnackbar('Professeur supprimé avec succès', 'success');
        } catch (error) {
          console.error('Erreur lors de la suppression du professeur:', error);
          showSnackbar('Erreur lors de la suppression', 'error');
        }
      } else if (selectedRows.length > 0) {
        // Suppression multiple
        try {
          // Créer un tableau de promesses pour la suppression
          const deletePromises = selectedRows.map(id => professeurService.delete(id));
          
          // Attendre que toutes les suppressions soient terminées
          await Promise.all(deletePromises);
          deleted = true;
          
          // Mettre à jour l'état local
          const updatedProfesseurs = professeurs.filter(p => !selectedRows.includes(p.id));
          setProfesseurs(updatedProfesseurs);
          
          // Vérifier si tous les professeurs ont été supprimés
          if (updatedProfesseurs.length === 0) {
            allDeleted = true;
          }
          
          showSnackbar(`${selectedRows.length} professeurs supprimés avec succès`, 'success');
          setSelectedRows([]);
        } catch (error) {
          console.error('Erreur lors de la suppression multiple de professeurs:', error);
          showSnackbar('Erreur lors de la suppression des professeurs sélectionnés', 'error');
        }
      }
      
      // Si tous les professeurs ont été supprimés, marquer l'entité comme supprimée
      if (deleted && allDeleted) {
        console.log('Tous les professeurs ont été supprimés, marquage comme supprimés');
        markEntityAsDeleted(ENTITY_KEYS.PROFESSEURS);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showSnackbar('Une erreur est survenue', 'error');
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
              <FormControl 
                fullWidth 
                error={Boolean(formErrors.filieres)}
                required
              >
                <InputLabel id="filieres-label">Filières d'enseignement</InputLabel>
                <Select
                  labelId="filieres-label"
                  id="filieres"
                  multiple
                  name="filieres"
                  value={formData.filieres || []}
                  onChange={handleFilieresChange}
                  input={<OutlinedInput id="select-filieres" label="Filières d'enseignement" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const filiere = FILIERES_CHOICES.find(f => f.value === value);
                        return (
                          <Chip 
                            key={value} 
                            label={filiere ? filiere.label : value} 
                            color="secondary"
                            variant="outlined" 
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {FILIERES_CHOICES.map((filiere) => (
                    <MenuItem key={filiere.value} value={filiere.value}>
                      {filiere.label}
                    </MenuItem>
                  ))}
                </Select>
                {Boolean(formErrors.filieres) && (
                  <FormHelperText>{formErrors.filieres}</FormHelperText>
                )}
              </FormControl>
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