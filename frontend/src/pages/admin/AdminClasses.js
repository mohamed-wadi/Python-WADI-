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
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon
} from '@mui/icons-material';

// Utilisation exclusive de l'API REST via le service dédié
import { classeService } from '../../utils/apiService';
import { NIVEAUX_INGENIEUR, FILIERES_CHOICES } from '../../utils/constants';
import { ENTITY_KEYS, markEntityAsDeleted, isEntityDeleted } from '../../utils/persistenceManager';

// Note: Nous gardons la référence au service localStorage au cas où nous aurions besoin de revenir en arrière
// import { classeLocalService } from '../../utils/localStorageService';

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
    filiere: 'IIR',
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
  
  // Plus besoin de fonctions localStorage, nous utilisons l'API REST

  useEffect(() => {
    // Charger les données au démarrage
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Vider les données actuelles pour éviter d'afficher des données périmées
      setClasses([]);
      
      // Vérifier si les classes ont été supprimées par l'utilisateur
      if (isEntityDeleted(ENTITY_KEYS.CLASSES)) {
        console.log('Les classes ont été marquées comme supprimées, affichage d\'une liste vide');
        setClasses([]);
        setLoading(false);
        return;
      }
      
      // Retour à l'utilisation de l'API REST pour charger les classes
      try {
        console.log('Chargement des classes depuis l\'API...');
        // Forcer un délai court pour s'assurer que le serveur a bien traité les dernières requêtes
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const classesData = await classeService.getAll();
        console.log('Données de classes récupérées depuis l\'API:', classesData);
        
        if (Array.isArray(classesData)) {
          // Mise à jour de l'état avec les nouvelles données
          setClasses(classesData);
          
          // Si le tableau est vide, marquer l'entité comme supprimée
          if (classesData.length === 0) {
            markEntityAsDeleted(ENTITY_KEYS.CLASSES);
          }
        } else {
          console.warn('Format de données inattendu:', classesData);
          setClasses([]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des classes depuis l\'API:', error);
        setClasses([]);
        showSnackbar('Erreur lors du chargement des classes', 'error');
      }
    } catch (error) {
      console.error('Erreur générale lors du chargement des données:', error);
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
        nom: classe.nom,
        niveau: classe.niveau,
        filiere: classe.filiere || 'IIR',
        annee_scolaire: classe.annee_scolaire
      });
    } else {
      // Réinitialiser le formulaire pour la création
      setCurrentClasse(null);
      setFormData({
        nom: '',
        niveau: '',
        filiere: 'IIR', // Ajouter le champ filiere avec une valeur par défaut
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
    if (!formData.filiere) errors.filiere = 'La filière est requise';
    if (!formData.annee_scolaire) errors.annee_scolaire = 'L\'année scolaire est requise';
    else if (!/^\d{4}-\d{4}$/.test(formData.annee_scolaire)) {
      errors.annee_scolaire = 'Format attendu: AAAA-AAAA (ex: 2024-2025)';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitForm = async () => {
    // Valider le formulaire avant de soumettre
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      setLoading(true);
      
      // Préparer les données à envoyer
      const classeData = {
        ...formData
      };
      
      console.log('Données du formulaire classe à envoyer:', classeData);
      
      let result;
      if (formType === 'create') {
        // Utiliser directement classeService.create au lieu de postData
        result = await classeService.create(classeData);
        console.log('Résultat de la création via API:', result);
        showSnackbar('Classe créée avec succès', 'success');
      } else {
        // Utiliser directement classeService.update au lieu de putData
        result = await classeService.update(currentClasse.id, classeData);
        console.log('Résultat de la mise à jour via API:', result);
        showSnackbar('Classe mise à jour avec succès', 'success');
      }
      
      console.log('Résultat de l\'opération:', result);
      
      // Fermer le formulaire
      handleCloseForm();
      
      // Attendre un peu avant de rafraîchir les données pour laisser le temps au serveur
      setTimeout(async () => {
        await loadData();
      }, 500);
      
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      showSnackbar(`Erreur lors de l'enregistrement: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (classe) => {
    setClasseToDelete(classe);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    
    try {
      // Déclarer la variable deleted ici avant de l'utiliser
      let deleted = false;
      let allDeleted = false;
      
      if (classeToDelete) {
        // Suppression d'une seule classe
        try {
          await classeService.delete(classeToDelete.id);
          console.log(`Classe ${classeToDelete.id} supprimée avec succès`);
          deleted = true;
          
          // Supprimer également de l'état local
          const updatedClasses = classes.filter(c => c.id !== classeToDelete.id);
          setClasses(updatedClasses);
          
          // Vérifier si c'était la dernière classe
          if (updatedClasses.length === 0) {
            allDeleted = true;
          }
        } catch (error) {
          console.error('Erreur lors de la suppression de la classe:', error);
          showSnackbar(`Erreur lors de la suppression de la classe ${classeToDelete.nom}`, 'error');
        }
      } else if (selectedRows.length > 0) {
        // Suppression multiple
        try {
          // Créer un tableau de promesses pour la suppression
          const deletePromises = selectedRows.map(id => classeService.delete(id));
          
          // Attendre que toutes les suppressions soient terminées
          await Promise.all(deletePromises);
          console.log(`${selectedRows.length} classes supprimées avec succès`);
          deleted = true;
          
          // Supprimer également de l'état local
          const updatedClasses = classes.filter(c => !selectedRows.includes(c.id));
          setClasses(updatedClasses);
          
          // Vérifier si toutes les classes ont été supprimées
          if (updatedClasses.length === 0) {
            allDeleted = true;
          }
        } catch (error) {
          console.error('Erreur lors de la suppression multiple de classes:', error);
          showSnackbar('Erreur lors de la suppression des classes sélectionnées', 'error');
        }
      }
      
      if (deleted) {
        // Si toutes les classes ont été supprimées, marquer l'entité pour éviter la réinitialisation
        if (allDeleted) {
          console.log('Toutes les classes ont été supprimées, marquage comme supprimées');
          markEntityAsDeleted(ENTITY_KEYS.CLASSES);
        }
        
        showSnackbar('Classe(s) supprimée(s) avec succès', 'success');
        
        // Réinitialiser la sélection
        setSelectedRows([]);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showSnackbar('Une erreur est survenue lors de la suppression', 'error');
    } finally {
      setOpenConfirm(false);
      setClasseToDelete(null);
      setLoading(false);
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
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'nom', headerName: 'Nom', width: 200 },
    { field: 'niveau', headerName: 'Niveau', width: 150,
      valueGetter: (params) => {
        return NIVEAUX_INGENIEUR.find(n => n.id.toString() === params.row.niveau)?.nom || params.row.niveau;
      }
    },
    { field: 'filiere', headerName: 'Filière', width: 180,
      valueGetter: (params) => {
        return FILIERES_CHOICES.find(f => f.value === params.row.filiere)?.label || params.row.filiere;
      }
    },
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
              <FormControl fullWidth required error={Boolean(formErrors.niveau)}>
                <InputLabel id="niveau-select-label">Niveau</InputLabel>
                <Select
                  labelId="niveau-select-label"
                  id="niveau-select"
                  name="niveau"
                  value={formData.niveau}
                  onChange={handleInputChange}
                  label="Niveau"
                >
                  {NIVEAUX_INGENIEUR.map((niveau) => (
                    <MenuItem key={niveau.id} value={niveau.id.toString()}>
                      {niveau.nom}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.niveau && (
                  <Typography color="error" variant="caption">
                    {formErrors.niveau}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={Boolean(formErrors.filiere)}>
                <InputLabel id="filiere-select-label">Filière</InputLabel>
                <Select
                  labelId="filiere-select-label"
                  id="filiere-select"
                  name="filiere"
                  value={formData.filiere}
                  onChange={handleInputChange}
                  label="Filière"
                >
                  {FILIERES_CHOICES.map((filiere) => (
                    <MenuItem key={filiere.value} value={filiere.value}>
                      {filiere.label}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.filiere && (
                  <Typography color="error" variant="caption">
                    {formErrors.filiere}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
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