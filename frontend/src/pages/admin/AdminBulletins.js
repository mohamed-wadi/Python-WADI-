import React, { useState, useEffect } from 'react';
import {
  Typography, 
  Paper, 
  Box, 
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Alert,
  Tooltip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Card,
  CardContent,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  Rating
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Edit as EditIcon
} from '@mui/icons-material';

// API calls
import { 
  fetchClasses, 
  fetchMatieres, 
  fetchEtudiantsByClasse,
  fetchNotes,
  fetchBulletins,
  generateBulletin,
  updateBulletin
} from '../../utils/api';

const AdminBulletins = () => {
  // États pour les données
  const [classes, setClasses] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [notes, setNotes] = useState([]);
  const [bulletins, setBulletins] = useState([]);
  const [matieres, setMatieres] = useState([]);
  
  // États pour les filtres
  const [selectedClasse, setSelectedClasse] = useState('');
  const [selectedTrimestre, setSelectedTrimestre] = useState(1);
  const [selectedEtudiant, setSelectedEtudiant] = useState('');
  
  // États pour le bulletin actif
  const [activeBulletin, setActiveBulletin] = useState(null);
  const [appreciationDialog, setAppreciationDialog] = useState(false);
  const [appreciation, setAppreciation] = useState('');
  
  // États pour la pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // États pour les notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // États pour le chargement
  const [loading, setLoading] = useState(true);
  const [generatingBulletin, setGeneratingBulletin] = useState(false);
  
  // Charger les données initiales
  useEffect(() => {
    loadInitialData();
    
    // Ne plus utiliser de données statiques, laissons l'API backend gérer les données
    // Si aucune donnée n'est disponible, nous montrerons un message à l'utilisateur
    if (!classes || classes.length === 0) {
      console.log('Aucune classe disponible dans l\'API, affichage d\'un tableau vide');
      setClasses([]);
    }
    
    if (!matieres || matieres.length === 0) {
      console.log('Aucune matière disponible dans l\'API, affichage d\'un tableau vide');
      setMatieres([]);
    }
  }, []);
  
  // Charger les étudiants lorsque la classe sélectionnée change
  useEffect(() => {
    if (selectedClasse) {
      loadEtudiants(selectedClasse);
    } else {
      setEtudiants([]);
    }
  }, [selectedClasse]);
  
  // Charger les bulletins en fonction des filtres
  useEffect(() => {
    if (selectedClasse) {
      loadBulletins();
    }
  }, [selectedClasse, selectedTrimestre]);
  
  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Note: Nous n'utilisons pas fetchClasses() car il retourne du HTML au lieu de JSON
      // setClasses est maintenant géré directement dans le useEffect avec des données statiques
      
      // Sélectionner automatiquement la première classe
      setSelectedClasse('1'); // ID de la première classe
      
    } catch (error) {
      console.error('Erreur lors du chargement des données initiales:', error);
      showSnackbar('Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const loadEtudiants = async (classeId) => {
    try {
      const response = await fetchEtudiantsByClasse(classeId);
      
      // S'assurer que response.data est un tableau
      const etudiantsArray = Array.isArray(response.data) ? response.data : [];
      console.log('Étudiants chargés:', etudiantsArray);
      setEtudiants(etudiantsArray);
      
      // Sélectionner automatiquement le premier étudiant
      if (etudiantsArray.length > 0) {
        setSelectedEtudiant(etudiantsArray[0].id.toString());
      } else {
        setSelectedEtudiant('');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des étudiants:', error);
      // En cas d'erreur, initialiser avec un tableau vide
      setEtudiants([]);
    }
  };
  
  const loadBulletins = async () => {
    try {
      // Construire les paramètres de recherche en fonction des filtres
      const params = {
        classe: selectedClasse,
        trimestre: selectedTrimestre
      };
      
      const response = await fetchBulletins(params);
      
      // S'assurer que response.data est un tableau
      const bulletinsArray = Array.isArray(response.data) ? response.data : [];
      console.log('Bulletins chargés:', bulletinsArray);
      setBulletins(bulletinsArray);
    } catch (error) {
      console.error('Erreur lors du chargement des bulletins:', error);
      showSnackbar('Erreur lors du chargement des bulletins', 'error');
      // En cas d'erreur, initialiser avec un tableau vide
      setBulletins([]);
    }
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    
    if (name === 'classe') {
      setSelectedClasse(value);
      setSelectedEtudiant('');
    } else if (name === 'trimestre') {
      setSelectedTrimestre(value);
    } else if (name === 'etudiant') {
      setSelectedEtudiant(value);
    }
    
    // Réinitialiser la pagination lors d'un changement de filtre
    setPage(0);
  };
  
  const handleGenerateBulletin = async (etudiantId) => {
    try {
      setGeneratingBulletin(true);
      
      // Générer le bulletin
      const response = await generateBulletin({
        etudiant: etudiantId,
        trimestre: selectedTrimestre,
        classe: selectedClasse
      });
      
      // Recharger les bulletins
      await loadBulletins();
      
      showSnackbar('Bulletin généré avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de la génération du bulletin:', error);
      showSnackbar('Erreur lors de la génération du bulletin', 'error');
    } finally {
      setGeneratingBulletin(false);
    }
  };
  
  const handleDownloadBulletin = (bulletin) => {
    // Dans une implémentation réelle, cela appelerait un endpoint pour télécharger le PDF
    showSnackbar('Téléchargement du bulletin en PDF...', 'info');
    
    // Simulation d'un délai de téléchargement
    setTimeout(() => {
      showSnackbar('Bulletin téléchargé avec succès', 'success');
    }, 1500);
  };
  
  const handleOpenAppreciationDialog = (bulletin) => {
    setActiveBulletin(bulletin);
    setAppreciation(bulletin.appreciation || '');
    setAppreciationDialog(true);
  };
  
  const handleCloseAppreciationDialog = () => {
    setAppreciationDialog(false);
    setActiveBulletin(null);
  };
  
  const handleSaveAppreciation = async () => {
    try {
      if (!activeBulletin) return;
      
      // Mettre à jour l'appréciation
      await updateBulletin(activeBulletin.id, { appreciation });
      
      // Mettre à jour l'état local
      setBulletins(prevBulletins => 
        prevBulletins.map(bulletin => 
          bulletin.id === activeBulletin.id ? { ...bulletin, appreciation } : bulletin
        )
      );
      
      handleCloseAppreciationDialog();
      showSnackbar('Appréciation enregistrée avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'appréciation:', error);
      showSnackbar('Erreur lors de l\'enregistrement de l\'appréciation', 'error');
    }
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
  
  // Fonction utilitaires pour récupérer les noms à partir des IDs
  const getEtudiantNom = (id) => {
    const etudiant = etudiants.find(e => e.id === id);
    return etudiant ? `${etudiant.prenom} ${etudiant.nom}` : 'Étudiant inconnu';
  };
  
  const getClasseNom = (id) => {
    const classe = classes.find(c => c.id === id);
    return classe ? classe.nom : 'Classe inconnue';
  };
  
  // Calculer la moyenne générale d'un bulletin
  const calculerMoyenneGenerale = (bulletin) => {
    if (!bulletin || !bulletin.moyennes || bulletin.moyennes.length === 0) return 'N/A';
    
    const somme = bulletin.moyennes.reduce((acc, moyenne) => acc + parseFloat(moyenne.valeur), 0);
    return (somme / bulletin.moyennes.length).toFixed(2);
  };
  
  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gestion des bulletins
      </Typography>
      
      {/* Filtres */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="classe-select-label">Classe</InputLabel>
              <Select
                labelId="classe-select-label"
                id="classe-select"
                name="classe"
                value={selectedClasse}
                label="Classe"
                onChange={handleFilterChange}
              >
                {classes.map(classe => (
                  <MenuItem key={classe.id} value={classe.id.toString()}>
                    {classe.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="trimestre-select-label">Trimestre</InputLabel>
              <Select
                labelId="trimestre-select-label"
                id="trimestre-select"
                name="trimestre"
                value={selectedTrimestre}
                label="Trimestre"
                onChange={handleFilterChange}
              >
                <MenuItem value={1}>1er Trimestre</MenuItem>
                <MenuItem value={2}>2ème Trimestre</MenuItem>
                <MenuItem value={3}>3ème Trimestre</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="etudiant-select-label">Étudiant</InputLabel>
              <Select
                labelId="etudiant-select-label"
                id="etudiant-select"
                name="etudiant"
                value={selectedEtudiant}
                label="Étudiant"
                onChange={handleFilterChange}
                disabled={etudiants.length === 0}
              >
                {etudiants.map(etudiant => (
                  <MenuItem key={etudiant.id} value={etudiant.id.toString()}>
                    {etudiant.prenom} {etudiant.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                variant="contained"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={loadBulletins}
                disabled={!selectedClasse}
              >
                Actualiser
              </Button>
              {selectedEtudiant && (
                <Button 
                  variant="contained"
                  color="success"
                  startIcon={<PdfIcon />}
                  onClick={() => handleGenerateBulletin(parseInt(selectedEtudiant))}
                  disabled={generatingBulletin}
                >
                  {generatingBulletin ? 'Génération...' : 'Générer bulletin'}
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Tableau des bulletins */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell>Étudiant</TableCell>
                <TableCell>Classe</TableCell>
                <TableCell>Trimestre</TableCell>
                <TableCell>Moyenne générale</TableCell>
                <TableCell>Date de génération</TableCell>
                <TableCell>Appréciation</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress size={40} />
                  </TableCell>
                </TableRow>
              ) : bulletins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Aucun bulletin trouvé. Veuillez générer des bulletins pour les étudiants.
                  </TableCell>
                </TableRow>
              ) : (
                bulletins
                  .filter(bulletin => !selectedEtudiant || bulletin.etudiant.toString() === selectedEtudiant)
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((bulletin) => (
                    <TableRow key={bulletin.id} hover>
                      <TableCell>{getEtudiantNom(bulletin.etudiant)}</TableCell>
                      <TableCell>{getClasseNom(bulletin.classe)}</TableCell>
                      <TableCell>{`${bulletin.trimestre}ème Trimestre`}</TableCell>
                      <TableCell>
                        <Chip 
                          label={`${calculerMoyenneGenerale(bulletin)}/20`} 
                          color={parseFloat(calculerMoyenneGenerale(bulletin)) >= 10 ? 'success' : 'error'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{new Date(bulletin.date_generation).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {bulletin.appreciation ? 
                          bulletin.appreciation.substring(0, 30) + (bulletin.appreciation.length > 30 ? '...' : '') : 
                          'Non renseignée'}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Éditer l'appréciation">
                          <IconButton size="small" onClick={() => handleOpenAppreciationDialog(bulletin)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Télécharger en PDF">
                          <IconButton size="small" onClick={() => handleDownloadBulletin(bulletin)} color="primary">
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={bulletins.filter(bulletin => !selectedEtudiant || bulletin.etudiant.toString() === selectedEtudiant).length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
        />
      </Paper>
      
      {/* Dialog d'édition d'appréciation */}
      <Dialog open={appreciationDialog} onClose={handleCloseAppreciationDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Éditer l'appréciation
        </DialogTitle>
        <DialogContent dividers>
          {activeBulletin && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Étudiant: <strong>{getEtudiantNom(activeBulletin.etudiant)}</strong>
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  Classe: <strong>{getClasseNom(activeBulletin.classe)}</strong>
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  Trimestre: <strong>{`${activeBulletin.trimestre}ème Trimestre`}</strong>
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  Moyenne générale: <strong>{calculerMoyenneGenerale(activeBulletin)}/20</strong>
                </Typography>
              </Box>
              
              <TextField
                fullWidth
                label="Appréciation générale"
                multiline
                rows={6}
                value={appreciation}
                onChange={(e) => setAppreciation(e.target.value)}
                placeholder="Saisir une appréciation générale pour l'étudiant..."
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAppreciationDialog}>Annuler</Button>
          <Button onClick={handleSaveAppreciation} variant="contained" color="primary">
            Enregistrer
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
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminBulletins;
