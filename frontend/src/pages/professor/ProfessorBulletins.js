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
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  Tabs,
  Tab,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Print as PrintIcon,
  Description as DescriptionIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  PictureAsPdf as PdfIcon,
  School as SchoolIcon,
  Warning as WarningIcon,
  Edit as EditIcon
} from '@mui/icons-material';

// Simulation des API calls - à remplacer par de vraies requêtes API
import {
  fetchClasses,
  fetchMatieres,
  fetchEtudiantsByClasse,
  fetchNotesByClasse,
  fetchBulletinsByClasse,
  generateBulletin,
  updateBulletin,
  downloadBulletinPdf
} from '../../utils/api';

// Composant pour afficher une matière dans le bulletin
const MatiereRow = ({ matiere, notes }) => {
  const getNote = (matiereId) => {
    const note = notes.find(n => n.matiere === matiereId);
    return note ? parseFloat(note.valeur).toFixed(2) : 'N/A';
  };

  const noteValue = getNote(matiere.id);
  const isNumeric = noteValue !== 'N/A';
  
  return (
    <TableRow>
      <TableCell>{matiere.nom}</TableCell>
      <TableCell align="center">{matiere.coefficient}</TableCell>
      <TableCell align="center">
        <Typography 
          variant="body2" 
          color={isNumeric && parseFloat(noteValue) >= 10 ? "success.main" : "error.main"}
          fontWeight="bold"
        >
          {noteValue}
        </Typography>
      </TableCell>
      <TableCell align="center">
        {isNumeric ? (parseFloat(noteValue) * matiere.coefficient).toFixed(2) : 'N/A'}
      </TableCell>
    </TableRow>
  );
};

// Composant pour afficher un bulletin complet
const BulletinCard = ({ bulletin, etudiant, notes, matieres, onUpdateAppreciation, onDownloadPdf }) => {
  const [expanded, setExpanded] = useState(false);
  const [appreciation, setAppreciation] = useState(bulletin.appreciation || '');
  const [editMode, setEditMode] = useState(false);
  
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  
  const handleSaveAppreciation = () => {
    onUpdateAppreciation(bulletin.id, appreciation);
    setEditMode(false);
  };
  
  // Calcul du rang en fonction de la moyenne
  const rangColor = () => {
    if (bulletin.rang === 1) return 'success.main';
    if (bulletin.rang <= 3) return 'info.main';
    return 'text.primary';
  };
  
  // Filtrer les matières pour n'afficher que celles qui ont des notes
  const matieresWithNotes = matieres.filter(matiere => {
    return notes.some(note => note.matiere === matiere.id && note.etudiant === etudiant.id);
  });
  
  // Constantes pour l'affichage du statut
  const isPassed = bulletin.moyenne_generale >= 10;
  
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">
              {etudiant.prenom} {etudiant.nom}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Classe: {etudiant.classe_nom} - Matricule: {etudiant.numero_matricule}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Chip 
              icon={<SchoolIcon />} 
              label={`Moyenne: ${parseFloat(bulletin.moyenne_generale).toFixed(2)}/20`} 
              color={isPassed ? "success" : "error"}
              sx={{ fontWeight: 'bold' }}
            />
            <Chip 
              label={`Rang: ${bulletin.rang}/${bulletin.total_eleves}`} 
              color="primary"
              sx={{ fontWeight: 'bold', color: rangColor() }}
            />
            <Chip 
              icon={isPassed ? <CheckCircleIcon /> : null} 
              label={isPassed ? "Admis" : "Non admis"} 
              color={isPassed ? "success" : "error"}
              variant="outlined"
            />
          </Grid>
        </Grid>
        
        <Button
          onClick={handleExpandClick}
          startIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{ mt: 2 }}
        >
          {expanded ? "Masquer les détails" : "Voir les détails"}
        </Button>
      </CardContent>
      
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.light' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Matière</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Coefficient</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Note /20</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Points</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {matieresWithNotes.map(matiere => (
                  <MatiereRow key={matiere.id} matiere={matiere} notes={notes} />
                ))}
                <TableRow sx={{ backgroundColor: 'grey.100' }}>
                  <TableCell colSpan={2} sx={{ fontWeight: 'bold' }}>Total</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    {parseFloat(bulletin.moyenne_generale).toFixed(2)}/20
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    {bulletin.total_points ? parseFloat(bulletin.total_points).toFixed(2) : 'N/A'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          
          <Typography variant="subtitle1" gutterBottom>
            Appréciation:
          </Typography>
          
          {editMode ? (
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={appreciation}
                onChange={(e) => setAppreciation(e.target.value)}
                variant="outlined"
              />
              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={() => setEditMode(false)} sx={{ mr: 1 }}>
                  Annuler
                </Button>
                <Button 
                  onClick={handleSaveAppreciation} 
                  variant="contained" 
                  startIcon={<SaveIcon />}
                >
                  Enregistrer
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ mb: 2 }}>
              <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'grey.50' }}>
                <Typography variant="body2">
                  {appreciation || "Aucune appréciation pour le moment."}
                </Typography>
              </Paper>
              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  onClick={() => setEditMode(true)} 
                  startIcon={<EditIcon />}
                  size="small"
                >
                  Modifier
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Collapse>
      
      <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
        <Button
          variant="outlined"
          startIcon={<PdfIcon />}
          onClick={() => onDownloadPdf(bulletin.id)}
        >
          Télécharger PDF
        </Button>
      </CardActions>
    </Card>
  );
};

// Composant principal
const ProfessorBulletins = () => {
  // États pour les données
  const [classes, setClasses] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [notes, setNotes] = useState([]);
  const [bulletins, setBulletins] = useState([]);
  const [professeurId, setProfesseurId] = useState(1); // À remplacer par l'ID du professeur connecté
  
  // États pour les filtres
  const [selectedClasse, setSelectedClasse] = useState('');
  const [selectedTrimestre, setSelectedTrimestre] = useState(1);
  const [selectedTab, setSelectedTab] = useState(0); // 0: tous, 1: à compléter, 2: complets
  
  // États pour les notifications et le chargement
  const [loading, setLoading] = useState(true);
  const [loadingClasseData, setLoadingClasseData] = useState(false);
  const [generatingBulletin, setGeneratingBulletin] = useState(false);
  const [allBulletinsGenerated, setAllBulletinsGenerated] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Charger les données initiales
  useEffect(() => {
    loadInitialData();
  }, []);
  
  // Charger les données spécifiques à la classe et au trimestre
  useEffect(() => {
    if (selectedClasse) {
      loadClasseData();
    }
  }, [selectedClasse, selectedTrimestre]);
  
  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Charger les classes depuis l'API
      let classesData = [];
      try {
        // Utiliser un timestamp pour éviter le cache du navigateur
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/classes/?timestamp=${timestamp}`);
        if (response.ok) {
          classesData = await response.json();
          console.log('Classes chargées depuis l\'API:', classesData);
        } else {
          console.error('Erreur lors du chargement des classes:', response.statusText);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des classes:', error);
      }
      
      // Charger les matières du professeur depuis l'API
      let matieresData = [];
      try {
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/matieres/?professeur=${professeurId}&timestamp=${timestamp}`);
        if (response.ok) {
          matieresData = await response.json();
          console.log('Matières chargées depuis l\'API:', matieresData);
        } else {
          console.error('Erreur lors du chargement des matières:', response.statusText);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des matières:', error);
      }
      
      setClasses(classesData);
      setMatieres(matieresData);
      
      // Sélectionner la première classe par défaut
      if (classesData.length > 0) {
        setSelectedClasse(classesData[0].id.toString());
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données initiales:', error);
      showSnackbar('Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const loadClasseData = async () => {
    setLoadingClasseData(true);
    try {
      if (!selectedClasse) {
        console.log('Aucune classe sélectionnée');
        setEtudiants([]);
        setBulletins([]);
        return;
      }
      
      // Récupérer les étudiants de la classe sélectionnée depuis l'API
      let etudiantsData = [];
      try {
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/etudiants/?classe=${selectedClasse}&timestamp=${timestamp}`);
        if (response.ok) {
          etudiantsData = await response.json();
          console.log('Étudiants chargés depuis l\'API:', etudiantsData);
        } else {
          console.error('Erreur lors du chargement des étudiants:', response.statusText);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des étudiants:', error);
      }
      
      // Récupérer les notes des étudiants pour le trimestre sélectionné depuis l'API
      let notesData = [];
      try {
        if (etudiantsData.length > 0) {
          const etudiantIds = etudiantsData.map(e => e.id).join(',');
          const timestamp = new Date().getTime();
          const response = await fetch(`/api/notes/?etudiants=${etudiantIds}&trimestre=${selectedTrimestre}&timestamp=${timestamp}`);
          if (response.ok) {
            notesData = await response.json();
            console.log('Notes chargées depuis l\'API:', notesData);
          } else {
            console.error('Erreur lors du chargement des notes:', response.statusText);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des notes:', error);
      }
      
      // Organiser les données par étudiant pour le bulletin
      const etudiantsBulletins = etudiantsData.map(etudiant => {
        const etudiantNotes = notesData.filter(note => note.etudiant === etudiant.id);
        
        // Calculer la moyenne par matière
        const moyennesParMatiere = {};
        etudiantNotes.forEach(note => {
          if (!moyennesParMatiere[note.matiere]) {
            moyennesParMatiere[note.matiere] = {
              somme: 0,
              count: 0,
            };
          }
          moyennesParMatiere[note.matiere].somme += note.valeur;
          moyennesParMatiere[note.matiere].count += 1;
        });
        
        // Convertir en tableau pour l'affichage
        const notesTableau = Object.keys(moyennesParMatiere).map(matiereId => {
          const { somme, count } = moyennesParMatiere[matiereId];
          const moyenne = count > 0 ? somme / count : 0;
          const matiere = matieres.find(m => m.id === parseInt(matiereId));
          return {
            matiere_id: matiereId,
            matiere_nom: matiere ? matiere.nom : `Matière ${matiereId}`,
            moyenne: moyenne,
            coefficient: matiere ? matiere.coefficient : 1
          };
        });
        
        // Calculer la moyenne générale
        let sommeCoeffs = 0;
        let sommeNotes = 0;
        
        notesTableau.forEach(note => {
          sommeNotes += note.moyenne * note.coefficient;
          sommeCoeffs += note.coefficient;
        });
        
        const moyenneGenerale = sommeCoeffs > 0 ? sommeNotes / sommeCoeffs : 0;
        
        return {
          ...etudiant,
          notes: notesTableau,
          moyenne_generale: moyenneGenerale
        };
      });
      
      setEtudiants(etudiantsData);
      setBulletins(etudiantsBulletins);
    } catch (error) {
      console.error('Erreur lors du chargement des données de classe:', error);
      showSnackbar('Erreur lors du chargement des données', 'error');
    } finally {
      setLoadingClasseData(false);
    }
  };
  
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    if (name === 'classe') {
      setSelectedClasse(value);
    } else if (name === 'trimestre') {
      setSelectedTrimestre(parseInt(value));
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };
  
  const handleGenerateBulletins = async () => {
    if (!selectedClasse || !selectedTrimestre) {
      showSnackbar('Veuillez sélectionner une classe et un trimestre', 'error');
      return;
    }
    
    setGeneratingBulletin(true);
    try {
      const response = await generateBulletin(selectedClasse, selectedTrimestre);
      setBulletins(response.data);
      showSnackbar('Bulletins générés avec succès', 'success');
      loadClasseData(); // Recharger les données pour voir les nouveaux bulletins
    } catch (error) {
      console.error('Erreur lors de la génération des bulletins:', error);
      showSnackbar('Erreur lors de la génération des bulletins', 'error');
    } finally {
      setGeneratingBulletin(false);
    }
  };
  
  const handleUpdateAppreciation = async (bulletinId, appreciation) => {
    try {
      await updateBulletin(bulletinId, { appreciation });
      
      // Mettre à jour l'état local
      setBulletins(prev => prev.map(b => 
        b.id === bulletinId ? { ...b, appreciation } : b
      ));
      
      showSnackbar('Appréciation mise à jour avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'appréciation:', error);
      showSnackbar('Erreur lors de la mise à jour de l\'appréciation', 'error');
    }
  };
  
  const handleDownloadPdf = async (bulletinId) => {
    try {
      await downloadBulletinPdf(bulletinId);
      showSnackbar('Téléchargement du PDF démarré', 'success');
    } catch (error) {
      console.error('Erreur lors du téléchargement du PDF:', error);
      showSnackbar('Erreur lors du téléchargement du PDF', 'error');
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
  
  // Filtrer les bulletins selon l'onglet sélectionné
  const getFilteredBulletins = () => {
    if (selectedTab === 0) {
      // Tous les bulletins
      return bulletins;
    } else if (selectedTab === 1) {
      // Bulletins à compléter (sans appréciation)
      return bulletins.filter(b => !b.appreciation);
    } else {
      // Bulletins complets (avec appréciation)
      return bulletins.filter(b => b.appreciation);
    }
  };
  
  const filteredBulletins = getFilteredBulletins();
  
  // Mettre à jour l'état allBulletinsGenerated
  useEffect(() => {
    setAllBulletinsGenerated(etudiants.length > 0 && bulletins.length >= etudiants.length);
  }, [etudiants, bulletins]);
  
  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Bulletins
      </Typography>
      
      {/* Filtres et actions */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel id="classe-select-label">Classe</InputLabel>
              <Select
                labelId="classe-select-label"
                id="classe-select"
                name="classe"
                value={selectedClasse}
                label="Classe"
                onChange={handleFilterChange}
              >
                {classes.map((classe) => (
                  <MenuItem key={classe.id} value={classe.id.toString()}>
                    {classe.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
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
          <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<AssignmentIcon />}
              onClick={handleGenerateBulletins}
              disabled={generatingBulletin || !selectedClasse || etudiants.length === 0}
            >
              {generatingBulletin ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Générer les bulletins"
              )}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Onglets */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={handleTabChange} aria-label="bulletin-tabs">
          <Tab label="Tous les bulletins" />
          <Tab label="À compléter" />
          <Tab label="Complets" />
        </Tabs>
      </Box>
      
      {/* Contenu */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : etudiants.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            Aucun étudiant trouvé dans cette classe.
          </Typography>
        </Paper>
      ) : bulletins.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary" paragraph>
            Aucun bulletin n'a encore été généré pour cette classe et ce trimestre.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AssignmentIcon />}
            onClick={handleGenerateBulletins}
            disabled={generatingBulletin}
          >
            Générer maintenant
          </Button>
        </Paper>
      ) : filteredBulletins.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            Aucun bulletin ne correspond aux critères sélectionnés.
          </Typography>
        </Paper>
      ) : (
        <>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1">
              {filteredBulletins.length} bulletin{filteredBulletins.length > 1 ? 's' : ''} trouvé{filteredBulletins.length > 1 ? 's' : ''}
            </Typography>
            {!allBulletinsGenerated && (
              <Chip 
                label="Certains bulletins ne sont pas générés" 
                color="warning" 
                icon={<WarningIcon />} 
              />
            )}
          </Box>
          
          {/* Liste des bulletins */}
          {filteredBulletins.map(bulletin => {
            const etudiant = etudiants.find(e => e.id === bulletin.etudiant);
            if (!etudiant) return null;
            
            return (
              <BulletinCard
                key={bulletin.id}
                bulletin={bulletin}
                etudiant={etudiant}
                notes={notes.filter(n => n.etudiant === etudiant.id)}
                matieres={matieres}
                onUpdateAppreciation={handleUpdateAppreciation}
                onDownloadPdf={handleDownloadPdf}
              />
            );
          })}
        </>
      )}
      
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

export default ProfessorBulletins;