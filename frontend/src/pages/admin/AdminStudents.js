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
  Tooltip
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileDownload as FileDownloadIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import * as XLSX from 'xlsx';

import { etudiantService, classeService } from '../../utils/apiService';
import { NIVEAUX_INGENIEUR, FILIERES_CHOICES } from '../../utils/constants';
import { formatEtudiantData, transformEtudiantFromApi } from '../../utils/formatApiData';

const AdminStudents = () => {
  const [etudiants, setEtudiants] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [formType, setFormType] = useState('create'); // 'create' ou 'edit'
  const [currentEtudiant, setCurrentEtudiant] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    date_naissance: null,
    sexe: 'M',
    adresse: '',
    email: '',
    telephone: '',
    classe: '',
    niveau: '', 
    filiere: 'IIR',
    numero_matricule: ''
  });
  const [openConfirm, setOpenConfirm] = useState(false);
  const [etudiantToDelete, setEtudiantToDelete] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);
  
  // Mettre à jour les classes filtrées lorsque la liste des classes, le niveau ou la filière change
  useEffect(() => {
    const { niveau, filiere } = formData;
    
    console.log('useEffect déclenché pour le filtrage, données:', {
      classes: classes.length,
      niveau,
      filiere
    });
    
    // Toujours appliquer le filtrage même si niveau et filière ne sont pas spécifiés
    // afin de garantir que la liste est mise à jour correctement
    filterClasses(niveau, filiere);
  }, [classes, formData.niveau, formData.filiere]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Charger les étudiants
      const etudiantsData = await etudiantService.getAll();
      // Transformer les données pour le frontend
      const transformedEtudiants = etudiantsData.map(etudiant => transformEtudiantFromApi(etudiant));
      setEtudiants(transformedEtudiants);
      
      // Charger les classes
      const classesData = await classeService.getAll();
      setClasses(classesData);
      setFilteredClasses(classesData); // Initialiser les classes filtrées avec toutes les classes
    } catch (error) {
      console.error('Erreur générale lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  // Plus besoin de fonctions localStorage, nous utilisons l'API REST

  const handleExportExcel = () => {
    try {
      showSnackbar('Préparation de l\'export Excel...', 'info');
      
      // Récupérer tous les étudiants
      const etudiants_data = etudiants.map(etudiant => ({
        'Matricule': etudiant.numero_matricule || '',
        'Nom': etudiant.nom || '',
        'Prénom': etudiant.prenom || '',
        'Classe': etudiant.classe?.nom || '',
        'Email': etudiant.email || '',
        'Téléphone': etudiant.telephone || '',
        'Adresse': etudiant.adresse || '',
        'Date de naissance': etudiant.date_naissance || '',
        'Mot de passe par défaut': `${etudiant.nom.toLowerCase()}@${etudiant.prenom.toLowerCase()}`
      }));
      
      // Créer un classeur Excel
      const wb = XLSX.utils.book_new();
      
      // Ajouter une feuille avec tous les étudiants
      const ws_all = XLSX.utils.json_to_sheet(etudiants_data);
      XLSX.utils.book_append_sheet(wb, ws_all, "Tous les étudiants");
      
      // Regrouper les étudiants par classe
      const classeGroups = {};
      etudiants.forEach(etudiant => {
        const classeName = etudiant.classe?.nom || 'Sans classe';
        if (!classeGroups[classeName]) {
          classeGroups[classeName] = [];
        }
        classeGroups[classeName].push({
          'Matricule': etudiant.numero_matricule || '',
          'Nom': etudiant.nom || '',
          'Prénom': etudiant.prenom || '',
          'Email': etudiant.email || '',
          'Téléphone': etudiant.telephone || '',
          'Mot de passe par défaut': `${etudiant.nom.toLowerCase()}@${etudiant.prenom.toLowerCase()}`
        });
      });
      
      // Ajouter une feuille pour chaque classe
      Object.keys(classeGroups).forEach(classeName => {
        const ws_classe = XLSX.utils.json_to_sheet(classeGroups[classeName]);
        XLSX.utils.book_append_sheet(wb, ws_classe, classeName.substring(0, 30)); // Limiter la longueur du nom de la feuille
      });
      
      // Télécharger le fichier Excel
      XLSX.writeFile(wb, `Liste_Etudiants_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      showSnackbar('Export Excel réussi!', 'success');
    } catch (error) {
      console.error('Erreur lors de l\'export Excel:', error);
      showSnackbar('Erreur lors de l\'export Excel', 'error');
    }
  };

  const handleOpenForm = (type, etudiant = null) => {
    setFormType(type);
    setFormErrors({});
    
    if (type === 'edit' && etudiant) {
      setCurrentEtudiant(etudiant);
      // Formatter la date de naissance pour le formulaire
      const formattedData = {
        ...etudiant,
        date_naissance: etudiant.date_naissance || '',
        classe: etudiant.classe ? etudiant.classe.id : ''
      };
      setFormData(formattedData);
    } else {
      // Réinitialiser le formulaire pour la création
      setCurrentEtudiant(null);
      setFormData({
        nom: '',
        prenom: '',
        date_naissance: null,
        sexe: 'M',
        adresse: '',
        email: '',
        telephone: '',
        classe: '',
        numero_matricule: ''
      });
    }
    
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
  };

  // Générer un numéro de matricule en fonction du niveau et de la filière
  const generateMatricule = (niveau, filiere) => {
    if (!niveau || !filiere) return '';
    
    let prefixe = '';
    
    // Préfixe basé sur la filière
    switch(filiere) {
      case 'IIR':
        prefixe = 'RP'; // Réseau
        break;
      case 'GESI':
        prefixe = 'ES'; // Électrique & Systèmes
        break;
      case 'GCBTP':
        prefixe = 'GC'; // Génie Civil
        break;
      case 'GI':
        prefixe = 'GI'; // Génie Industriel
        break;
      case 'GF':
        prefixe = 'GF'; // Génie Financier
        break;
      default:
        prefixe = 'ET'; // Étudiant
    }
    
    // Ajouter le niveau (année)
    const niveauNum = niveau.toString().charAt(0);
    prefixe += niveauNum;
    
    // Générer un numéro aléatoire à 3 chiffres
    const randomNum = Math.floor(100 + Math.random() * 900);
    
    return `${prefixe}${randomNum}`;
  };
  
  // Filtrer les classes en fonction du niveau ET de la filière sélectionnés
  const filterClasses = (niveau, filiere) => {
    console.log('Filtrage des classes avec:', { niveau, filiere, classes });
    console.log('Classes disponibles:', classes.map(c => `${c.nom} (niveau: ${c.niveau}, filière: ${c.filiere})`));
    
    if (!classes || classes.length === 0) {
      console.log('Aucune classe disponible');
      setFilteredClasses([]);
      return;
    }
    
    if (!niveau && !filiere) {
      console.log('Aucun filtre spécifié, affichage de toutes les classes');
      setFilteredClasses(classes);
      return;
    }
    
    // Réinitialiser les classes filtrées avec toutes les classes disponibles
    let filtered = [...classes];
    let appliedFilters = [];
    
    // Appliquer le filtre de niveau si spécifié
    if (niveau) {
      appliedFilters.push(`niveau=${niveau}`);
      filtered = filtered.filter(classe => {
        // Assurer que la comparaison est basée sur des chaînes pour éviter les problèmes de type
        const classeNiveau = classe.niveau?.toString() || '';
        const selectedNiveau = niveau?.toString() || '';
        const niveauMatch = classeNiveau === selectedNiveau;
        
        if (!niveauMatch) {
          console.log(`EXCLUS - Classe ${classe.nom}, niveau ${classeNiveau} ne correspond pas à ${selectedNiveau}`);
        }
        
        return niveauMatch;
      });
    }
    
    // Appliquer le filtre de filière si spécifié (ET logique avec le filtre de niveau)
    if (filiere) {
      appliedFilters.push(`filière=${filiere}`);
      filtered = filtered.filter(classe => {
        // Assurer que la comparaison est exacte
        const classeFilière = classe.filiere || '';
        const filièreMatch = classeFilière === filiere;
        
        if (!filièreMatch) {
          console.log(`EXCLUS - Classe ${classe.nom}, filière ${classeFilière} ne correspond pas à ${filiere}`);
        }
        
        return filièreMatch;
      });
    }
    
    console.log(`Classes filtrées (${appliedFilters.join(' ET ')}):`, 
      filtered.map(c => `${c.nom} (niveau: ${c.niveau}, filière: ${c.filiere})`));
    
    // Définir les classes filtrées pour être utilisées dans le formulaire
    setFilteredClasses(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Mettre à jour le state formData
    const updatedFormData = {
      ...formData,
      [name]: value
    };
    
    // Si le niveau ou la filière change, générer un nouveau numéro matricule et filtrer les classes
    if (name === 'niveau' || name === 'filiere') {
      // Mise à jour des valeurs de niveau et filière
      const niveau = name === 'niveau' ? value : formData.niveau;
      const filiere = name === 'filiere' ? value : formData.filiere;
      
      // Filtrer les classes en fonction du niveau ET de la filière
      filterClasses(niveau, filiere);
      
      // Réinitialiser la classe sélectionnée si le niveau ou la filière change
      updatedFormData.classe = '';
      
      // Générer un nouveau matricule si les deux valeurs sont disponibles
      if (niveau && filiere) {
        updatedFormData.numero_matricule = generateMatricule(niveau, filiere);
      }
    }
    
    // Mettre à jour le state
    setFormData(updatedFormData);
    
    // Effacer l'erreur lorsque l'utilisateur corrige le champ
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Pas besoin de handleDateChange spécifique car nous utilisons handleInputChange pour tous les champs

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nom) errors.nom = 'Le nom est requis';
    if (!formData.prenom) errors.prenom = 'Le prénom est requis';
    if (!formData.date_naissance) errors.date_naissance = 'La date de naissance est requise';
    if (!formData.email) errors.email = 'L\'email est requis';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Format d\'email invalide';
    if (!formData.numero_matricule) errors.numero_matricule = 'Le numéro de matricule est requis';
    if (!formData.classe) errors.classe = 'La classe est requise';
    if (!formData.niveau) errors.niveau = 'Le niveau est requis';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitForm = async () => {
    if (!validateForm()) return;
    
    try {
      // Préparer les données pour l'envoi
      const rawEtudiantData = {
        nom: formData.nom || '',
        prenom: formData.prenom || '',
        date_naissance: formData.date_naissance || new Date().toISOString().split('T')[0],
        sexe: formData.sexe || 'M',
        adresse: formData.adresse || '',
        email: formData.email || '',
        telephone: formData.telephone || '',
        classe: formData.classe || null,
        niveau: formData.niveau || null,
        numero_matricule: formData.numero_matricule || ''
      };
      
      // Générer automatiquement un mot de passe si c'est une création
      let generatedPassword = '';
      if (formType === 'create') {
        generatedPassword = `${formData.nom.toLowerCase()}@${formData.prenom.toLowerCase()}`;
        rawEtudiantData.password = generatedPassword;
        console.log('Mot de passe généré:', generatedPassword);
      }
      
      // Formater les données pour l'API
      const etudiantData = formatEtudiantData(rawEtudiantData);
      console.log('Envoi des données formatées:', etudiantData);
      
      if (formType === 'create') {
        // Créer un nouvel étudiant via l'API REST
        const response = await etudiantService.create(etudiantData);
        console.log('Réponse de l\'API (création):', response);
        
        // Transformer les données pour le frontend
        const newEtudiant = transformEtudiantFromApi(response);
        console.log('Étudiant transformé:', newEtudiant);
        
        // Ajouter l'étudiant à la liste existante
        setEtudiants([...etudiants, newEtudiant]);
        showSnackbar('Étudiant ajouté avec succès', 'success');
        
      } else if (formType === 'edit' && currentEtudiant) {
        // Mettre à jour l'étudiant via l'API REST
        const response = await etudiantService.update(currentEtudiant.id, etudiantData);
        console.log('Réponse de l\'API (mise à jour):', response);
        
        // Transformer les données pour le frontend
        const updatedEtudiant = transformEtudiantFromApi(response);
        console.log('Étudiant transformé:', updatedEtudiant);
        
        // Mettre à jour la liste des étudiants
        const updatedEtudiants = etudiants.map(etudiant => 
          etudiant.id === currentEtudiant.id ? updatedEtudiant : etudiant
        );
        setEtudiants(updatedEtudiants);
        showSnackbar('Étudiant mis à jour avec succès', 'success');
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

  const handleDeleteClick = (etudiant) => {
    setEtudiantToDelete(etudiant);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (etudiantToDelete) {
        // Suppression via l'API REST
        await etudiantService.delete(etudiantToDelete.id);
        
        // Mettre à jour l'état local
        const updatedEtudiants = etudiants.filter(etudiant => etudiant.id !== etudiantToDelete.id);
        setEtudiants(updatedEtudiants);
        
        showSnackbar('Étudiant supprimé avec succès', 'success');
      } else if (selectedRows.length > 0) {
        // Suppression multiple via l'API REST
        for (const id of selectedRows) {
          await etudiantService.delete(id);
        }
        
        // Mettre à jour l'état local
        const updatedEtudiants = etudiants.filter(etudiant => !selectedRows.includes(etudiant.id));
        setEtudiants(updatedEtudiants);
        
        showSnackbar(`${selectedRows.length} étudiants supprimés avec succès`, 'success');
        setSelectedRows([]);
      } else {
        return; // Aucun élément à supprimer
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showSnackbar('Erreur lors de la suppression', 'error');
    } finally {
      setOpenConfirm(false);
      setEtudiantToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setOpenConfirm(false);
    setEtudiantToDelete(null);
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
    { field: 'numero_matricule', headerName: 'Matricule', width: 130 },
    { field: 'nom', headerName: 'Nom', width: 130 },
    { field: 'prenom', headerName: 'Prénom', width: 130 },
    { 
      field: 'date_naissance', 
      headerName: 'Date de naissance', 
      width: 150 
    },
    { 
      field: 'sexe', 
      headerName: 'Sexe', 
      width: 100,
      valueFormatter: (params) => params.value === 'M' ? 'Masculin' : 'Féminin'
    },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'telephone', headerName: 'Téléphone', width: 130 },
    { 
      field: 'classe', 
      headerName: 'Classe', 
      width: 150,
      valueGetter: (params) => params.row.classe ? params.row.classe.nom : ''
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
          Gestion des étudiants
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Exporter la liste des étudiants en Excel">
            <Button
              variant="outlined"
              color="success"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportExcel}
            >
              Exporter Excel
            </Button>
          </Tooltip>
          {selectedRows.length > 0 && (
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<DeleteIcon />}
              onClick={() => {
                setEtudiantToDelete(null);
                setOpenConfirm(true);
              }}
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
            Ajouter un étudiant
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
            rows={etudiants}
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
          {formType === 'create' ? 'Ajouter un étudiant' : 'Modifier un étudiant'}
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
                  name="date_naissance"
                  label="Date de naissance (YYYY-MM-DD)"
                  type="date"
                  value={formData.date_naissance}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  error={Boolean(formErrors.date_naissance)}
                  helperText={formErrors.date_naissance || 'Format: YYYY-MM-DD'}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel id="sexe-label">Sexe</InputLabel>
                  <Select
                    labelId="sexe-label"
                    name="sexe"
                    value={formData.sexe}
                    onChange={handleInputChange}
                    label="Sexe"
                  >
                    <MenuItem value="M">Masculin</MenuItem>
                    <MenuItem value="F">Féminin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="adresse"
                  label="Adresse"
                  value={formData.adresse || ''}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={2}
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
                <FormControl fullWidth required error={Boolean(formErrors.niveau)}>
                  <InputLabel id="niveau-label">Niveau</InputLabel>
                  <Select
                    labelId="niveau-label"
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
                  <InputLabel id="filiere-label">Filière</InputLabel>
                  <Select
                    labelId="filiere-label"
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
                <FormControl fullWidth required error={Boolean(formErrors.classe)}>
                  <InputLabel id="classe-label">Classe</InputLabel>
                  <Select
                    labelId="classe-label"
                    name="classe"
                    value={formData.classe}
                    onChange={handleInputChange}
                    label="Classe"
                    disabled={!formData.niveau}
                  >
                    {/* Utiliser uniquement les classes filtrées, jamais toutes les classes */}
                    {filteredClasses.map((classe) => {
                      // Trouver le nom complet de la filière à partir du code
                      const filiereLabel = FILIERES_CHOICES.find(f => f.value === classe.filiere)?.label || classe.filiere;
                      // Trouver le nom complet du niveau à partir de l'ID
                      const niveauLabel = NIVEAUX_INGENIEUR.find(n => n.id.toString() === classe.niveau?.toString())?.nom || classe.niveau;
                      
                      return (
                        <MenuItem key={classe.id} value={classe.id}>
                          {classe.nom} - {niveauLabel} - {filiereLabel}
                        </MenuItem>
                      );
                    })}
                    {filteredClasses.length === 0 && formData.niveau && formData.filiere && (
                      <MenuItem disabled value="">
                        Aucune classe disponible pour {NIVEAUX_INGENIEUR.find(n => n.id.toString() === formData.niveau)?.nom} en {FILIERES_CHOICES.find(f => f.value === formData.filiere)?.label}
                      </MenuItem>
                    )}
                  </Select>
                  {formErrors.classe && (
                    <Typography color="error" variant="caption">
                      {formErrors.classe}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="numero_matricule"
                  label="Numéro de matricule (généré automatiquement)"
                  value={formData.numero_matricule}
                  fullWidth
                  required
                  error={Boolean(formErrors.numero_matricule)}
                  helperText={formErrors.numero_matricule || 'Généré automatiquement en fonction du niveau et de la filière'}
                  InputProps={{
                    readOnly: true,
                  }}
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
          {etudiantToDelete ? (
            <Typography>
              Êtes-vous sûr de vouloir supprimer l'étudiant <strong>{etudiantToDelete?.prenom} {etudiantToDelete?.nom}</strong> ?
              Cette action est irréversible.
            </Typography>
          ) : (
            <Typography>
              Êtes-vous sûr de vouloir supprimer les <strong>{selectedRows.length}</strong> étudiants sélectionnés ?
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

export default AdminStudents; 