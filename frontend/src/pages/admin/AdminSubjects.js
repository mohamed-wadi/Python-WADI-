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

import { matiereService, professeurService, classeService } from '../../utils/apiService';
import { ENTITY_KEYS, markEntityAsDeleted, isEntityDeleted } from '../../utils/persistenceManager';

// Utilisation des API REST pour la gestion des matières avec fallback localStorage

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
  const [selectedRows, setSelectedRows] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [formErrors, setFormErrors] = useState({});

  // Plus besoin de fonctions localStorage, nous utilisons l'API REST

  useEffect(() => {
    loadData();
  }, []);

  // Fonction pour charger les données depuis l'API

  const loadData = async () => {
    setLoading(true);
    try {
      // Vérifier si les matières ont été supprimées par l'utilisateur
      const matieresDeleted = isEntityDeleted(ENTITY_KEYS.MATIERES);
      
      // Chargement des professeurs depuis l'API REST pour la liste déroulante
      try {
        const professeursData = await professeurService.getAll();
        console.log('Données de professeurs récupérées depuis l\'API');
        setProfesseurs(Array.isArray(professeursData) ? professeursData : []);
      } catch (error) {
        console.error('Erreur lors du chargement des professeurs depuis l\'API:', error);
        setProfesseurs([]);
      }
      
      // Chargement des classes depuis l'API REST pour la liste déroulante
      try {
        const classesData = await classeService.getAll();
        console.log('Données de classes récupérées depuis l\'API');
        setClasses(Array.isArray(classesData) ? classesData : []);
      } catch (error) {
        console.error('Erreur lors du chargement des classes depuis l\'API:', error);
        setClasses([]);
      }
      
      // Si les matières ont été supprimées, afficher une liste vide
      if (matieresDeleted) {
        console.log('Les matières ont été marquées comme supprimées, affichage d\'une liste vide');
        setMatieres([]);
      } else {
        // Chargement des matières depuis l'API REST
        try {
          const matieresData = await matiereService.getAll();
          console.log('Données de matières récupérées depuis l\'API');
          
          if (Array.isArray(matieresData)) {
            setMatieres(matieresData);
            
            // Si le tableau est vide, marquer l'entité comme supprimée
            if (matieresData.length === 0) {
              markEntityAsDeleted(ENTITY_KEYS.MATIERES);
            }
          } else {
            console.warn('Format de données inattendu:', matieresData);
            setMatieres([]);
          }
        } catch (error) {
          console.error('Erreur lors du chargement des matières depuis l\'API:', error);
          setMatieres([]);
          showSnackbar('Erreur lors du chargement des matières', 'error');
        }
      }
    } catch (error) {
      console.error('Erreur générale lors du chargement des données:', error);
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

  const handleSubmitForm = async () => {
    try {
      // Vérifier que le formulaire est valide
      const errors = {};
      if (!formData.nom) errors.nom = 'Le nom est requis';
      if (!formData.code) errors.code = 'Le code est requis';
      if (!formData.coefficient) errors.coefficient = 'Le coefficient est requis';
      if (!formData.professeur) errors.professeur = 'Le professeur est requis';
      if (!formData.classes || formData.classes.length === 0) errors.classes = 'Au moins une classe est requise';
      
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
      
      // Préparer les données pour l'API
      const matiereData = {
        nom: formData.nom,
        code: formData.code,
        coefficient: parseInt(formData.coefficient, 10),
        professeur: parseInt(formData.professeur, 10),
        classes: Array.isArray(formData.classes) 
          ? formData.classes.map(id => parseInt(id, 10)) 
          : [parseInt(formData.classes, 10)]
      };
      
      if (formType === 'create') {
        // Création d'une nouvelle matière via l'API REST
        const newMatiere = await matiereService.create(matiereData);
        
        // Mettre à jour l'état local avec la nouvelle matière
        setMatieres([...matieres, newMatiere]);
        showSnackbar('Matière créée avec succès', 'success');
      } else if (currentMatiere) {
        // Modification d'une matière existante via l'API REST
        const updatedMatiere = await matiereService.update(currentMatiere.id, matiereData);
        
        // Mettre à jour l'état local
        const updatedMatieres = matieres.map(m => m.id === currentMatiere.id ? updatedMatiere : m);
        setMatieres(updatedMatieres);
        showSnackbar('Matière modifiée avec succès', 'success');
      }
      
      // Fermer le formulaire
      handleCloseForm();
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      showSnackbar('Erreur lors de l\'enregistrement: ' + (error.message || 'Erreur inconnue'), 'error');
    }
  };

  const handleDeleteClick = (matiere) => {
    setMatiereToDelete(matiere);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      let deleted = false;
      let allDeleted = false;
      
      if (matiereToDelete) {
        // Suppression d'une seule matière
        try {
          await matiereService.delete(matiereToDelete.id);
          
          // Mettre à jour l'état local
          const updatedMatieres = matieres.filter(matiere => matiere.id !== matiereToDelete.id);
          setMatieres(updatedMatieres);
          deleted = true;
          
          // Vérifier si c'était la dernière matière
          if (updatedMatieres.length === 0) {
            allDeleted = true;
          }
          
          showSnackbar('Matière supprimée avec succès', 'success');
        } catch (error) {
          console.error('Erreur lors de la suppression de la matière:', error);
          showSnackbar('Erreur lors de la suppression', 'error');
        }
      } else if (selectedRows.length > 0) {
        // Suppression multiple
        try {
          // Créer un tableau de promesses pour la suppression
          const deletePromises = selectedRows.map(id => matiereService.delete(id));
          
          // Attendre que toutes les suppressions soient terminées
          await Promise.all(deletePromises);
          deleted = true;
          
          // Mettre à jour l'état local
          const updatedMatieres = matieres.filter(matiere => !selectedRows.includes(matiere.id));
          setMatieres(updatedMatieres);
          
          // Vérifier si toutes les matières ont été supprimées
          if (updatedMatieres.length === 0) {
            allDeleted = true;
          }
          
          showSnackbar(`${selectedRows.length} matières supprimées avec succès`, 'success');
          setSelectedRows([]);
        } catch (error) {
          console.error('Erreur lors de la suppression multiple de matières:', error);
          showSnackbar('Erreur lors de la suppression des matières sélectionnées', 'error');
        }
      }
      
      // Si toutes les matières ont été supprimées, marquer l'entité comme supprimée
      if (deleted && allDeleted) {
        console.log('Toutes les matières ont été supprimées, marquage comme supprimées');
        markEntityAsDeleted(ENTITY_KEYS.MATIERES);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showSnackbar('Erreur lors de la suppression: ' + (error.message || 'Erreur inconnue'), 'error');
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
        <Box>
          {selectedRows.length > 0 && (
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<DeleteIcon />}
              onClick={() => {
                setMatiereToDelete(null);
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
            Ajouter une matière
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
            onRowSelectionModelChange={(newSelection) => {
              setSelectedRows(newSelection);
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
          {matiereToDelete ? (
            <Typography>
              Êtes-vous sûr de vouloir supprimer la matière <strong>{matiereToDelete?.nom}</strong> ?
              Cette action est irréversible.
            </Typography>
          ) : (
            <Typography>
              Êtes-vous sûr de vouloir supprimer les <strong>{selectedRows.length}</strong> matières sélectionnées ?
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

export default AdminSubjects; 