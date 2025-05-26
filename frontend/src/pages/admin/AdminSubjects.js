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

  // Fonction pour sauvegarder les matières dans localStorage
  const saveMatieresToLocalStorage = (updatedMatieres) => {
    localStorage.setItem('schoolAppMatieres', JSON.stringify(updatedMatieres));
  };
  
  // Fonction pour charger les matières depuis localStorage
  const loadMatieresFromLocalStorage = () => {
    const savedMatieres = localStorage.getItem('schoolAppMatieres');
    return savedMatieres ? JSON.parse(savedMatieres) : null;
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fonction pour charger les données depuis l'API

  const loadData = async () => {
    setLoading(true);
    
    try {
      // 1. Charger d'abord les professeurs depuis localStorage
      const storedProfesseurs = localStorage.getItem('schoolAppProfesseurs');
      if (storedProfesseurs) {
        try {
          const parsedProfesseurs = JSON.parse(storedProfesseurs);
          if (Array.isArray(parsedProfesseurs) && parsedProfesseurs.length > 0) {
            console.log('Utilisation des professeurs depuis localStorage');
            setProfesseurs(parsedProfesseurs);
          }
        } catch (err) {
          console.error('Erreur lors du parsing des professeurs depuis localStorage:', err);
        }
      }
      
      // 2. Charger d'abord les classes depuis localStorage
      const storedClasses = localStorage.getItem('schoolAppClasses');
      if (storedClasses) {
        try {
          const parsedClasses = JSON.parse(storedClasses);
          if (Array.isArray(parsedClasses) && parsedClasses.length > 0) {
            console.log('Utilisation des classes depuis localStorage');
            setClasses(parsedClasses);
          }
        } catch (err) {
          console.error('Erreur lors du parsing des classes depuis localStorage:', err);
        }
      }
      
      // 3. Charger d'abord les matières depuis localStorage
      const savedMatieres = loadMatieresFromLocalStorage();
      if (savedMatieres && Array.isArray(savedMatieres) && savedMatieres.length > 0) {
        console.log('Utilisation des matières depuis localStorage');
        setMatieres(savedMatieres);
      }
      
      // 4. Ensuite, essayer de mettre à jour depuis l'API (non bloquant)
      
      // 4.1 Essayer de charger les professeurs depuis l'API
      try {
        const professeursResponse = await fetchProfesseurs();
        if (Array.isArray(professeursResponse.data) && professeursResponse.data.length > 0) {
          console.log('Professeurs chargés depuis l\'API');
          setProfesseurs(professeursResponse.data);
          localStorage.setItem('schoolAppProfesseurs', JSON.stringify(professeursResponse.data));
        }
      } catch (error) {
        console.warn('Impossible de charger les professeurs depuis l\'API:', error);
        // Si aucune donnée n'est disponible dans localStorage, utiliser les données statiques
        if (!storedProfesseurs) {
          const staticProfesseurs = [
            { id: 1, nom: 'Dupont', prenom: 'Jean', email: 'jean.dupont@example.com', specialite: 'Mathématiques' },
            { id: 2, nom: 'Martin', prenom: 'Sophie', email: 'sophie.martin@example.com', specialite: 'Français' },
            { id: 3, nom: 'Bernard', prenom: 'Michel', email: 'michel.bernard@example.com', specialite: 'Histoire-Géographie' },
            { id: 4, nom: 'Petit', prenom: 'Anne', email: 'anne.petit@example.com', specialite: 'Anglais' },
            { id: 5, nom: 'Robert', prenom: 'Pierre', email: 'pierre.robert@example.com', specialite: 'Physique-Chimie' }
          ];
          setProfesseurs(staticProfesseurs);
          localStorage.setItem('schoolAppProfesseurs', JSON.stringify(staticProfesseurs));
        }
      }
      
      // 4.2 Essayer de charger les classes depuis l'API
      try {
        const classesResponse = await fetchClasses();
        if (Array.isArray(classesResponse.data) && classesResponse.data.length > 0) {
          console.log('Classes chargées depuis l\'API');
          setClasses(classesResponse.data);
          localStorage.setItem('schoolAppClasses', JSON.stringify(classesResponse.data));
        }
      } catch (error) {
        console.warn('Impossible de charger les classes depuis l\'API:', error);
        // Si aucune donnée n'est disponible dans localStorage, utiliser les données statiques
        if (!storedClasses) {
          const staticClasses = [
            { id: 1, nom: 'Terminale S', niveau: 'Terminale', annee_scolaire: '2024-2025' },
            { id: 4, nom: 'Première ES', niveau: 'Première', annee_scolaire: '2024-2025' },
            { id: 5, nom: 'Seconde A', niveau: 'Seconde', annee_scolaire: '2024-2025' }
          ];
          setClasses(staticClasses);
          localStorage.setItem('schoolAppClasses', JSON.stringify(staticClasses));
        }
      }
      
      // 4.3 Essayer de charger les matières depuis l'API
      try {
        const matieresResponse = await fetchMatieres();
        if (Array.isArray(matieresResponse.data) && matieresResponse.data.length > 0) {
          console.log('Matières chargées depuis l\'API');
          setMatieres(matieresResponse.data);
          saveMatieresToLocalStorage(matieresResponse.data);
        }
      } catch (error) {
        console.warn('Impossible de charger les matières depuis l\'API:', error);
        // Si aucune donnée n'est disponible dans localStorage, utiliser les données statiques
        if (!savedMatieres || savedMatieres.length === 0) {
          const staticMatieres = [
            { 
              id: 1, 
              nom: 'Mathématiques', 
              code: 'MATH101', 
              coefficient: 3,
              professeur: { id: 1, nom: 'Dupont', prenom: 'Jean' },
              classes: [{ id: 1, nom: 'Terminale S' }, { id: 4, nom: 'Première ES' }]
            },
            { 
              id: 2, 
              nom: 'Physique-Chimie', 
              code: 'PHY101', 
              coefficient: 3,
              professeur: { id: 5, nom: 'Robert', prenom: 'Pierre' },
              classes: [{ id: 1, nom: 'Terminale S' }]
            },
            { 
              id: 3, 
              nom: 'Français', 
              code: 'FRA101', 
              coefficient: 2,
              professeur: { id: 2, nom: 'Martin', prenom: 'Sophie' },
              classes: [{ id: 1, nom: 'Terminale S' }, { id: 4, nom: 'Première ES' }, { id: 5, nom: 'Seconde A' }]
            },
            { 
              id: 4, 
              nom: 'Histoire-Géographie', 
              code: 'HIS101', 
              coefficient: 2,
              professeur: { id: 3, nom: 'Bernard', prenom: 'Michel' },
              classes: [{ id: 4, nom: 'Première ES' }, { id: 5, nom: 'Seconde A' }]
            },
            { 
              id: 5, 
              nom: 'Anglais', 
              code: 'ANG101', 
              coefficient: 2,
              professeur: { id: 4, nom: 'Petit', prenom: 'Anne' },
              classes: [{ id: 1, nom: 'Terminale S' }, { id: 4, nom: 'Première ES' }, { id: 5, nom: 'Seconde A' }]
            }
          ];
          setMatieres(staticMatieres);
          saveMatieresToLocalStorage(staticMatieres);
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
    
    try {
      // Préparer les données pour l'envoi à l'API
      const matiereData = {
        ...formData,
        // Convertir les valeurs si nécessaire (par exemple, convertir les ID en entiers)
        professeur: parseInt(formData.professeur, 10),
        classes: formData.classes.map(id => parseInt(id, 10))
      };
      
      // Générer un ID unique pour les nouvelles matières
      let updatedMatieres;
      let newMatiere;
      
      if (formType === 'create') {
        // Générer un ID unique pour la nouvelle matière
        const newId = Date.now();
        
        // Créer l'objet matière avec les détails complets pour l'affichage
        newMatiere = {
          id: newId,
          ...matiereData,
          // Récupérer les objets professeur et classes complets pour l'affichage
          professeur: professeurs.find(p => p.id === parseInt(matiereData.professeur, 10)) || { id: parseInt(matiereData.professeur, 10) },
          classes: matiereData.classes.map(classId => {
            const classeObj = classes.find(c => c.id === parseInt(classId, 10));
            return classeObj || { id: parseInt(classId, 10), nom: `Classe ${classId}` };
          })
        };
        
        // Mettre à jour la liste des matières localement
        updatedMatieres = [...matieres, newMatiere];
        
        // Tentative d'envoi à l'API (non bloquante pour l'expérience utilisateur)
        try {
          createMatiere(matiereData).then(response => {
            console.log('Réponse API (création):', response);
            // Si l'API retourne un ID, mettre à jour l'ID local
            if (response && response.data && response.data.id) {
              const apiId = response.data.id;
              const updatedMatieresWithApiId = updatedMatieres.map(m => 
                m.id === newId ? { ...m, id: apiId } : m
              );
              setMatieres(updatedMatieresWithApiId);
              saveMatieresToLocalStorage(updatedMatieresWithApiId);
            }
          }).catch(apiError => {
            console.error('Erreur API lors de la création (non bloquante):', apiError);
          });
        } catch (apiError) {
          console.error('Erreur lors de l\'envoi à l\'API:', apiError);
        }
        
        showSnackbar('Matière créée avec succès', 'success');
      } else if (currentMatiere) {
        // Modification d'une matière existante
        newMatiere = {
          id: currentMatiere.id,
          ...matiereData,
          // Récupérer les objets professeur et classes complets pour l'affichage
          professeur: professeurs.find(p => p.id === parseInt(matiereData.professeur, 10)) || { id: parseInt(matiereData.professeur, 10) },
          classes: matiereData.classes.map(classId => {
            const classeObj = classes.find(c => c.id === parseInt(classId, 10));
            return classeObj || { id: parseInt(classId, 10), nom: `Classe ${classId}` };
          })
        };
        
        // Mettre à jour la liste des matières localement
        updatedMatieres = matieres.map(m => m.id === currentMatiere.id ? newMatiere : m);
        
        // Tentative d'envoi à l'API (non bloquante)
        try {
          updateMatiere(currentMatiere.id, matiereData).then(response => {
            console.log('Réponse API (modification):', response);
          }).catch(apiError => {
            console.error('Erreur API lors de la modification (non bloquante):', apiError);
          });
        } catch (apiError) {
          console.error('Erreur lors de l\'envoi à l\'API:', apiError);
        }
        
        showSnackbar('Matière modifiée avec succès', 'success');
      }
      
      // Mettre à jour l'état et le localStorage
      setMatieres(updatedMatieres);
      saveMatieresToLocalStorage(updatedMatieres);
      
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
      let updatedMatieres;
      
      if (matiereToDelete) {
        // Tentative de suppression via l'API (non bloquante pour l'expérience utilisateur)
        try {
          deleteMatiere(matiereToDelete.id).then(response => {
            console.log('Réponse API (suppression):', response);
          }).catch(error => {
            console.error('Erreur API lors de la suppression (non bloquante):', error);
          });
        } catch (apiError) {
          console.error('Erreur API lors de la suppression:', apiError);
        }
        
        // Supprimer la matière de la liste locale
        updatedMatieres = matieres.filter(matiere => matiere.id !== matiereToDelete.id);
        showSnackbar('Matière supprimée avec succès', 'success');
        
      } else if (selectedRows.length > 0) {
        // Tentative de suppression multiple via l'API (non bloquante)
        try {
          selectedRows.forEach(id => {
            deleteMatiere(id).then(response => {
              console.log(`Réponse API (suppression de l'ID ${id}):`, response);
            }).catch(error => {
              console.error(`Erreur API lors de la suppression de l'ID ${id} (non bloquante):`, error);
            });
          });
        } catch (apiError) {
          console.error('Erreur API lors de la suppression multiple:', apiError);
        }
        
        // Supprimer les matières sélectionnées de la liste locale
        updatedMatieres = matieres.filter(matiere => !selectedRows.includes(matiere.id));
        showSnackbar(`${selectedRows.length} matières supprimées avec succès`, 'success');
        setSelectedRows([]);
      } else {
        return; // Aucun élément à supprimer
      }
      
      // Mettre à jour l'état et le localStorage
      setMatieres(updatedMatieres);
      saveMatieresToLocalStorage(updatedMatieres);
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