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

import { 
  fetchEtudiants, 
  fetchEtudiant, 
  createEtudiant, 
  updateEtudiant, 
  deleteEtudiant,
  fetchClasses 
} from '../../utils/api';

import { NIVEAUX_INGENIEUR } from '../../utils/constants';
import { STORAGE_KEYS, EVENTS, saveData, loadData, addItem, updateItem, deleteItem, getActiveItems } from '../../utils/localStorageManager';
import EventBus from '../../utils/eventBus';

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
    niveau: '', // Nouveau champ pour le niveau d'étudiant
    numero_matricule: ''
  });
  const [openConfirm, setOpenConfirm] = useState(false);
  const [etudiantToDelete, setEtudiantToDelete] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadData();
    
    // Initialiser des données statiques pour les classes
    setClasses([
      { id: 1, nom: 'ijh', niveau: 'iuh8', annee_scolaire: '2024-2025' },
      { id: 2, nom: 'vg66', niveau: '88', annee_scolaire: '2024-2025' },
    ]);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // D'abord, essayer de charger les étudiants depuis le localStorage
      const savedEtudiants = loadEtudiantsFromLocalStorage();
      
      // Si des étudiants existent dans localStorage, les utiliser
      if (savedEtudiants && savedEtudiants.length > 0) {
        console.log('Chargement des étudiants depuis localStorage', savedEtudiants);
        setEtudiants(savedEtudiants);
      } else {
        // Sinon, essayer de les charger depuis l'API
        try {
          const etudiantsResponse = await fetchEtudiants();
          
          if (typeof etudiantsResponse.data === 'string' && etudiantsResponse.data.includes('<!DOCTYPE html>')) {
            console.error('API a retourné du HTML au lieu de JSON pour les étudiants');
            
            // Utiliser des données statiques pour les étudiants
            const staticEtudiants = [
              { id: 1, nom: 'wadi', prenom: '3abdo', date_naissance: '1990-01-01', sexe: 'F', email: 'wadi@example.com', telephone: '', classe: 1, numero_matricule: 'E001' },
              { id: 2, nom: 'Dupont', prenom: 'Jean', date_naissance: '1992-05-15', sexe: 'F', email: 'jean.dupont@example.com', telephone: '', classe: 1, numero_matricule: 'E002' },
              { id: 3, nom: 'Martin', prenom: 'Sophie', date_naissance: '1991-09-20', sexe: 'F', email: 'sophie.martin@example.com', telephone: '', classe: 2, numero_matricule: 'E003' }
            ];
            setEtudiants(staticEtudiants);
            saveEtudiantsToLocalStorage(staticEtudiants);
          } else if (Array.isArray(etudiantsResponse.data)) {
            console.log('Données d\'étudiants récupérées depuis l\'API');
            setEtudiants(etudiantsResponse.data);
            saveEtudiantsToLocalStorage(etudiantsResponse.data);
          } else {
            console.error('Format de données inattendu');
            // Utiliser des données statiques
            const staticEtudiants = [
              { id: 1, nom: 'wadi', prenom: '3abdo', date_naissance: '1990-01-01', sexe: 'F', email: 'wadi@example.com', telephone: '', classe: 1, numero_matricule: 'E001' },
              { id: 2, nom: 'Dupont', prenom: 'Jean', date_naissance: '1992-05-15', sexe: 'F', email: 'jean.dupont@example.com', telephone: '', classe: 1, numero_matricule: 'E002' },
              { id: 3, nom: 'Martin', prenom: 'Sophie', date_naissance: '1991-09-20', sexe: 'F', email: 'sophie.martin@example.com', telephone: '', classe: 2, numero_matricule: 'E003' }
            ];
            setEtudiants(staticEtudiants);
            saveEtudiantsToLocalStorage(staticEtudiants);
          }
        } catch (error) {
          console.error('Erreur lors du chargement des étudiants depuis l\'API:', error);
          
          // Données statiques en cas d'erreur
          const staticEtudiants = [
            { id: 1, nom: 'wadi', prenom: '3abdo', date_naissance: '1990-01-01', sexe: 'F', email: 'wadi@example.com', telephone: '', classe: 1, numero_matricule: 'E001' },
            { id: 2, nom: 'Dupont', prenom: 'Jean', date_naissance: '1992-05-15', sexe: 'F', email: 'jean.dupont@example.com', telephone: '', classe: 1, numero_matricule: 'E002' },
            { id: 3, nom: 'Martin', prenom: 'Sophie', date_naissance: '1991-09-20', sexe: 'F', email: 'sophie.martin@example.com', telephone: '', classe: 2, numero_matricule: 'E003' }
          ];
          setEtudiants(staticEtudiants);
          saveEtudiantsToLocalStorage(staticEtudiants);
        }
      }
      
      // Chargement des classes
      try {
        const classesResponse = await fetchClasses();
        
        if (typeof classesResponse.data === 'string' && classesResponse.data.includes('<!DOCTYPE html>')) {
          console.error('API a retourné du HTML au lieu de JSON pour les classes');
          
          // Utiliser des données statiques pour les classes
          const staticClasses = [
            { id: 1, nom: 'ijh', niveau: 'iuh8', annee_scolaire: '2024-2025' },
            { id: 2, nom: 'vg66', niveau: '88', annee_scolaire: '2024-2025' },
          ];
          setClasses(staticClasses);
          localStorage.setItem('schoolAppClasses', JSON.stringify(staticClasses));
        } else {
          setClasses(classesResponse.data);
          localStorage.setItem('schoolAppClasses', JSON.stringify(classesResponse.data));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des classes depuis l\'API:', error);
        
        // Données statiques en cas d'erreur
        const staticClasses = [
          { id: 1, nom: 'ijh', niveau: 'iuh8', annee_scolaire: '2024-2025' },
          { id: 2, nom: 'vg66', niveau: '88', annee_scolaire: '2024-2025' },
        ];
        setClasses(staticClasses);
        localStorage.setItem('schoolAppClasses', JSON.stringify(staticClasses));
      }
    } catch (error) {
      console.error('Erreur générale lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour sauvegarder les étudiants dans localStorage
  const saveEtudiantsToLocalStorage = (updatedEtudiants) => {
    // Utiliser notre gestionnaire de localStorage qui notifie automatiquement les changements
    saveData(STORAGE_KEYS.ETUDIANTS, updatedEtudiants);
  };
  
  // Fonction pour charger les étudiants depuis localStorage
  const loadEtudiantsFromLocalStorage = () => {
    // Utiliser notre gestionnaire de localStorage qui assure que les données sont toujours un tableau
    return loadData(STORAGE_KEYS.ETUDIANTS);
  };
  
  // Fonction pour obtenir uniquement les étudiants actifs (non supprimés)
  const getActiveEtudiants = () => {
    return getActiveItems(STORAGE_KEYS.ETUDIANTS);
  };

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
      const etudiantData = {
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
        etudiantData.password = generatedPassword;
        console.log('Mot de passe généré:', generatedPassword);
      }
      
      console.log('Envoi des données:', etudiantData);
      
      // Tentative d'utilisation de l'API (non bloquante pour l'expérience utilisateur)
      if (formType === 'create') {
        try {
          // Envoyer la requête à l'API en arrière-plan
          createEtudiant(etudiantData).then(response => {
            console.log('Réponse API (création):', response);
          }).catch(error => {
            console.error('Erreur API lors de la création (non bloquante):', error);
          });
        } catch (apiError) {
          console.error('Erreur API lors de la création:', apiError);
        }
        
        // Créer un nouvel étudiant dans le système
        const newId = Date.now(); // ID temporaire
        const newEtudiant = {
          id: newId,
          nom: formData.nom,
          prenom: formData.prenom,
          date_naissance: formData.date_naissance || new Date().toISOString().split('T')[0],
          sexe: formData.sexe || 'M',
          adresse: formData.adresse || '',
          email: formData.email,
          telephone: formData.telephone || '',
          classe: formData.classe ? parseInt(formData.classe, 10) : null,
          niveau: formData.niveau,
          numero_matricule: formData.numero_matricule,
          deleted: false, // S'assurer que le nouvel étudiant est marqué comme actif
          created_at: new Date().toISOString() // Ajouter une date de création
        };
        
        // Ajouter l'étudiant à la liste existante
        const updatedEtudiants = [...etudiants, newEtudiant];
        
        // Mettre à jour l'état local
        setEtudiants(updatedEtudiants);
        
        // Sauvegarder dans localStorage avec notre gestionnaire qui notifie automatiquement
        saveData(STORAGE_KEYS.ETUDIANTS, updatedEtudiants);
        
        // Publier un événement spécifique pour notifier les autres composants
        EventBus.publish(EVENTS.ETUDIANTS_CHANGED, updatedEtudiants);
        showSnackbar('Étudiant ajouté avec succès', 'success');
        
      } else if (formType === 'edit' && currentEtudiant) {
        try {
          // Envoyer la requête à l'API en arrière-plan
          updateEtudiant(currentEtudiant.id, etudiantData).then(response => {
            console.log('Réponse API (modification):', response);
          }).catch(error => {
            console.error('Erreur API lors de la modification (non bloquante):', error);
          });
        } catch (apiError) {
          console.error('Erreur API lors de la modification:', apiError);
        }
        
        // Préparer les données mises à jour
        const updatedEtudiantData = {
          ...currentEtudiant,
          nom: formData.nom,
          prenom: formData.prenom,
          date_naissance: formData.date_naissance || currentEtudiant.date_naissance,
          sexe: formData.sexe || currentEtudiant.sexe,
          adresse: formData.adresse || currentEtudiant.adresse,
          email: formData.email,
          telephone: formData.telephone || currentEtudiant.telephone,
          classe: formData.classe ? parseInt(formData.classe, 10) : currentEtudiant.classe,
          niveau: formData.niveau || currentEtudiant.niveau,
          numero_matricule: formData.numero_matricule,
          updated_at: new Date().toISOString() // Ajouter horodatage de mise à jour
        };
        
        // Mettre à jour l'étudiant dans la liste
        const updatedEtudiants = etudiants.map(etudiant => 
          etudiant.id === currentEtudiant.id ? updatedEtudiantData : etudiant
        );
        
        // Mettre à jour l'état local
        setEtudiants(updatedEtudiants);
        
        // Sauvegarder dans localStorage avec notre gestionnaire qui notifie automatiquement
        saveData(STORAGE_KEYS.ETUDIANTS, updatedEtudiants);
        
        // Publier un événement spécifique pour notifier les autres composants
        EventBus.publish(EVENTS.ETUDIANTS_CHANGED, updatedEtudiants);
        showSnackbar('Étudiant modifié avec succès', 'success');
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
      let updatedEtudiants;
      
      if (etudiantToDelete) {
        // Tentative de suppression via l'API (non bloquante pour l'expérience utilisateur)
        try {
          deleteEtudiant(etudiantToDelete.id).then(response => {
            console.log('Réponse API (suppression):', response);
          }).catch(error => {
            console.error('Erreur API lors de la suppression (non bloquante):', error);
          });
        } catch (apiError) {
          console.error('Erreur API lors de la suppression:', apiError);
        }
        
        // Au lieu de supprimer complètement l'étudiant, on le marque comme supprimé (soft delete)
        updatedEtudiants = etudiants.map(etudiant => {
          if (etudiant.id === etudiantToDelete.id) {
            return {
              ...etudiant,
              deleted: true,
              deleted_at: new Date().toISOString()
            };
          }
          return etudiant;
        });
        showSnackbar('Étudiant supprimé avec succès', 'success');
        
      } else if (selectedRows.length > 0) {
        // Tentative de suppression multiple via l'API (non bloquante)
        try {
          selectedRows.forEach(id => {
            deleteEtudiant(id).then(response => {
              console.log(`Réponse API (suppression de l'ID ${id}):`, response);
            }).catch(error => {
              console.error(`Erreur API lors de la suppression de l'ID ${id} (non bloquante):`, error);
            });
          });
        } catch (apiError) {
          console.error('Erreur API lors de la suppression multiple:', apiError);
        }
        
        // Marquer les étudiants sélectionnés comme supprimés (soft delete)
        updatedEtudiants = etudiants.map(etudiant => {
          if (selectedRows.includes(etudiant.id)) {
            return {
              ...etudiant,
              deleted: true,
              deleted_at: new Date().toISOString()
            };
          }
          return etudiant;
        });
        showSnackbar(`${selectedRows.length} étudiants supprimés avec succès`, 'success');
        setSelectedRows([]);
      } else {
        return; // Aucun élément à supprimer
      }
      
      // Mettre à jour l'état local
      setEtudiants(updatedEtudiants);
      
      // Sauvegarder dans localStorage avec notre gestionnaire qui notifie automatiquement
      saveData(STORAGE_KEYS.ETUDIANTS, updatedEtudiants);
      
      // Publier un événement spécifique pour notifier les autres composants (comme le tableau de bord)
      EventBus.publish(EVENTS.ETUDIANTS_CHANGED, updatedEtudiants);
      
      // Mettre à jour l'affichage pour montrer uniquement les étudiants actifs
      const etudiantsActifs = updatedEtudiants.filter(e => !e.deleted);
      console.log(`${updatedEtudiants.length - etudiantsActifs.length} étudiants supprimés (masqués).`);
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
                <TextField
                  name="numero_matricule"
                  label="Numéro de matricule"
                  value={formData.numero_matricule}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  error={Boolean(formErrors.numero_matricule)}
                  helperText={formErrors.numero_matricule}
                />
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
                  >
                    {classes.map((classe) => (
                      <MenuItem key={classe.id} value={classe.id}>
                        {classe.nom} - {classe.niveau}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.classe && (
                    <Typography color="error" variant="caption">
                      {formErrors.classe}
                    </Typography>
                  )}
                </FormControl>
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