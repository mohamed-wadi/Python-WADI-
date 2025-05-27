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
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Assignment as AssignmentIcon,
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Simulation des API calls - à remplacer par de vraies requêtes API
import { 
  fetchClasses, 
  fetchMatieres, 
  fetchEtudiantsByClasse, 
  fetchNotesByProfesseur,
  createNote,
  updateNote,
  deleteNote
} from '../../utils/api';

const ProfessorNotes = () => {
  // États pour les données
  const [classes, setClasses] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [notes, setNotes] = useState([]);
  const [professeurId, setProfesseurId] = useState(1); // À remplacer par l'ID du professeur connecté
  
  // États pour les filtres
  const [selectedClasse, setSelectedClasse] = useState('');
  const [selectedMatiere, setSelectedMatiere] = useState('');
  const [selectedTrimestre, setSelectedTrimestre] = useState(1);
  
  // États pour le formulaire de notes
  const [openNoteDialog, setOpenNoteDialog] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteForm, setNoteForm] = useState({
    etudiant: '',
    matiere: '',
    valeur: '',
    date_evaluation: new Date().toISOString().split('T')[0],
    type_evaluation: 'Examen',
    commentaire: '',
    trimestre: 1
  });
  
  // États pour la confirmation de suppression
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  
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
  
  // Charger les données initiales
  useEffect(() => {
    loadInitialData();
  }, []);
  
  // Charger les étudiants lorsque la classe sélectionnée change
  useEffect(() => {
    if (selectedClasse) {
      loadEtudiants(selectedClasse);
    } else {
      setEtudiants([]);
    }
  }, [selectedClasse]);
  
  // Charger les notes en fonction des filtres
  useEffect(() => {
    loadNotes();
  }, [selectedClasse, selectedMatiere, selectedTrimestre]);
  
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
      
      // Sélectionner automatiquement la première matière du professeur
      if (matieresData.length > 0) {
        setSelectedMatiere(matieresData[0].id.toString());
      }
      
      // Sélectionner automatiquement la première classe
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
  
  const loadEtudiants = async (classeId) => {
    try {
      // Données statiques pour les étudiants
      const etudiantsData = [
        { id: 1, nom: 'wadi', prenom: '3abdo', classe: 1, classe_nom: 'ijh', numero_matricule: 'E001' },
        { id: 2, nom: 'Dupont', prenom: 'Jean', classe: 1, classe_nom: 'ijh', numero_matricule: 'E002' },
        { id: 3, nom: 'Martin', prenom: 'Sophie', classe: 2, classe_nom: 'vg66', numero_matricule: 'E003' }
      ];
      
      setEtudiants(etudiantsData.filter(e => e.classe === parseInt(classeId)));
    } catch (error) {
      console.error('Erreur lors du chargement des étudiants:', error);
      showSnackbar('Erreur lors du chargement des étudiants', 'error');
    }
  };
  
  const loadNotes = async () => {
    if (!selectedMatiere) return;
    
    setLoading(true);
    try {
      // Données statiques pour les notes
      const notesData = [
        { id: 1, etudiant: 1, matiere: 1, professeur: 1, valeur: 15.5, date_evaluation: '2025-05-20', type_evaluation: 'Examen', trimestre: 1, commentaire: 'Excellent travail' },
        { id: 2, etudiant: 1, matiere: 4, professeur: 1, valeur: 14, date_evaluation: '2025-05-15', type_evaluation: 'Contrôle', trimestre: 1, commentaire: 'Bon travail' },
        { id: 3, etudiant: 1, matiere: 3, professeur: 3, valeur: 16, date_evaluation: '2025-05-10', type_evaluation: 'TP', trimestre: 1, commentaire: 'Très bien' },
        { id: 4, etudiant: 2, matiere: 1, professeur: 1, valeur: 12, date_evaluation: '2025-05-12', type_evaluation: 'Examen', trimestre: 1, commentaire: 'Peut mieux faire' },
        { id: 5, etudiant: 2, matiere: 4, professeur: 1, valeur: 13, date_evaluation: '2025-05-13', type_evaluation: 'Contrôle', trimestre: 1, commentaire: 'Assez bien' },
        { id: 6, etudiant: 3, matiere: 1, professeur: 1, valeur: 17, date_evaluation: '2025-05-14', type_evaluation: 'Examen', trimestre: 1, commentaire: 'Excellent' },
        { id: 7, etudiant: 3, matiere: 4, professeur: 1, valeur: 16, date_evaluation: '2025-05-17', type_evaluation: 'Contrôle', trimestre: 1, commentaire: 'Très bien' },
        { id: 8, etudiant: 1, matiere: 1, professeur: 1, valeur: 14.5, date_evaluation: '2025-05-25', type_evaluation: 'Examen', trimestre: 2, commentaire: 'Bon travail' },
        { id: 9, etudiant: 2, matiere: 1, professeur: 1, valeur: 13, date_evaluation: '2025-05-26', type_evaluation: 'Examen', trimestre: 2, commentaire: 'Peut mieux faire' }
      ];
      
      // Filtrer les notes selon les critères sélectionnés
      let filteredNotes = notesData.filter(note => 
        note.matiere === parseInt(selectedMatiere) && 
        note.trimestre === selectedTrimestre
      );
      
      if (selectedClasse) {
        // Filtrer par classe en utilisant la liste des étudiants
        const etudiantIds = etudiants.map(e => e.id);
        filteredNotes = filteredNotes.filter(note => etudiantIds.includes(note.etudiant));
      }
      
      // Enrichir les notes avec les noms des étudiants et matières pour l'affichage
      const enrichedNotes = filteredNotes.map(note => ({
        ...note,
        etudiant_nom: getEtudiantNom(note.etudiant),
        matiere_nom: getMatiereNom(note.matiere)
      }));
      
      setNotes(enrichedNotes);
    } catch (error) {
      console.error('Erreur lors du chargement des notes:', error);
      showSnackbar('Erreur lors du chargement des notes', 'error');
    } finally {
      setLoading(false);
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
    switch (name) {
      case 'classe':
        setSelectedClasse(value);
        break;
      case 'matiere':
        setSelectedMatiere(value);
        break;
      case 'trimestre':
        setSelectedTrimestre(value);
        break;
      default:
        break;
    }
  };
  
  const handleOpenNoteDialog = (note = null) => {
    if (note) {
      // Mode édition
      setEditingNote(note);
      setNoteForm({
        etudiant: note.etudiant.toString(),
        matiere: note.matiere.toString(),
        valeur: note.valeur.toString(),
        date_evaluation: note.date_evaluation,
        type_evaluation: note.type_evaluation,
        commentaire: note.commentaire || '',
        trimestre: note.trimestre
      });
    } else {
      // Mode création
      setEditingNote(null);
      setNoteForm({
        etudiant: '',
        matiere: selectedMatiere,
        valeur: '',
        date_evaluation: new Date().toISOString().split('T')[0],
        type_evaluation: 'Examen',
        commentaire: '',
        trimestre: selectedTrimestre
      });
    }
    setOpenNoteDialog(true);
  };
  
  const handleCloseNoteDialog = () => {
    setOpenNoteDialog(false);
    setEditingNote(null);
  };
  
  const handleNoteFormChange = (event) => {
    const { name, value } = event.target;
    setNoteForm({
      ...noteForm,
      [name]: value
    });
  };
  
  const handleSaveNote = async () => {
    try {
      // Validation basique
      if (!noteForm.etudiant || !noteForm.matiere || !noteForm.valeur) {
        showSnackbar('Veuillez remplir tous les champs obligatoires', 'error');
        return;
      }
      
      // Valider que la note est entre 0 et 20
      const noteValue = parseFloat(noteForm.valeur);
      if (isNaN(noteValue) || noteValue < 0 || noteValue > 20) {
        showSnackbar('La note doit être comprise entre 0 et 20', 'error');
        return;
      }
      
      // Préparer les données pour l'API
      const noteData = {
        etudiant: parseInt(noteForm.etudiant),
        matiere: parseInt(noteForm.matiere),
        valeur: parseFloat(noteForm.valeur),
        date_evaluation: noteForm.date_evaluation,
        type_evaluation: noteForm.type_evaluation,
        commentaire: noteForm.commentaire,
        trimestre: parseInt(noteForm.trimestre)
      };
      
      let response;
      if (editingNote) {
        // Mode édition
        response = await updateNote(editingNote.id, noteData);
        showSnackbar('Note modifiée avec succès', 'success');
      } else {
        // Mode création
        response = await createNote(noteData);
        showSnackbar('Note ajoutée avec succès', 'success');
      }
      
      // Fermer le dialogue et recharger les notes
      handleCloseNoteDialog();
      loadNotes();
      
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la note:', error);
      showSnackbar(
        error.response?.data?.message || 'Erreur lors de l\'enregistrement de la note', 
        'error'
      );
    }
  };
  
  const handleDeleteClick = (note) => {
    setNoteToDelete(note);
    setOpenDeleteDialog(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!noteToDelete) return;
    
    try {
      await deleteNote(noteToDelete.id);
      showSnackbar('Note supprimée avec succès', 'success');
      setOpenDeleteDialog(false);
      setNoteToDelete(null);
      loadNotes();
    } catch (error) {
      console.error('Erreur lors de la suppression de la note:', error);
      showSnackbar('Erreur lors de la suppression de la note', 'error');
    }
  };
  
  const handleCancelDelete = () => {
    setOpenDeleteDialog(false);
    setNoteToDelete(null);
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
    return etudiant ? `${etudiant.prenom} ${etudiant.nom}` : `Étudiant #${id}`;
  };
  
  const getMatiereNom = (id) => {
    const matiere = matieres.find(m => m.id === id);
    return matiere ? matiere.nom : `Matière #${id}`;
  };
  
  const getClasseNom = (id) => {
    const classe = classes.find(c => c.id === id);
    return classe ? classe.nom : `Classe #${id}`;
  };
  
  // Calculer la moyenne des notes pour un étudiant donné
  const calculerMoyenneEtudiant = (etudiantId) => {
    const notesEtudiant = notes.filter(n => n.etudiant === etudiantId);
    if (notesEtudiant.length === 0) return 'N/A';
    
    const sum = notesEtudiant.reduce((acc, note) => acc + parseFloat(note.valeur), 0);
    return (sum / notesEtudiant.length).toFixed(2);
  };
  
  // Grouper les notes par étudiant pour l'affichage
  const notesParEtudiant = {};
  notes.forEach(note => {
    if (!notesParEtudiant[note.etudiant]) {
      notesParEtudiant[note.etudiant] = [];
    }
    notesParEtudiant[note.etudiant].push(note);
  });
  
  // Préparer les données pour l'affichage paginé
  const etudiantIds = Object.keys(notesParEtudiant);
  const paginatedEtudiantIds = etudiantIds.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  
  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gestion des notes
      </Typography>
      
      {/* Filtres */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={3}>
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
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel id="matiere-select-label">Matière</InputLabel>
              <Select
                labelId="matiere-select-label"
                id="matiere-select"
                name="matiere"
                value={selectedMatiere}
                label="Matière"
                onChange={handleFilterChange}
              >
                {matieres.map((matiere) => (
                  <MenuItem key={matiere.id} value={matiere.id.toString()}>
                    {matiere.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
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
          <Grid item xs={12} sm={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenNoteDialog()}
              disabled={!selectedClasse || !selectedMatiere}
            >
              Ajouter une note
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Tableau des notes */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : paginatedEtudiantIds.length > 0 ? (
        <>
          {paginatedEtudiantIds.map(etudiantId => {
            const etudiantNotes = notesParEtudiant[etudiantId];
            const etudiantNom = getEtudiantNom(parseInt(etudiantId));
            const moyenne = calculerMoyenneEtudiant(parseInt(etudiantId));
            
            return (
              <Card key={etudiantId} sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">{etudiantNom}</Typography>
                    <Chip 
                      label={`Moyenne: ${moyenne}`} 
                      color={parseFloat(moyenne) >= 10 ? "success" : "error"}
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Type</TableCell>
                          <TableCell>Note /20</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Commentaire</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {etudiantNotes.map(note => (
                          <TableRow key={note.id}>
                            <TableCell>{note.type_evaluation}</TableCell>
                            <TableCell>
                              <Typography 
                                variant="body2" 
                                color={parseFloat(note.valeur) >= 10 ? "success.main" : "error.main"}
                                fontWeight="bold"
                              >
                                {parseFloat(note.valeur).toFixed(2)}
                              </Typography>
                            </TableCell>
                            <TableCell>{new Date(note.date_evaluation).toLocaleDateString()}</TableCell>
                            <TableCell>{note.commentaire || '-'}</TableCell>
                            <TableCell align="right">
                              <Tooltip title="Modifier">
                                <IconButton size="small" onClick={() => handleOpenNoteDialog(note)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Supprimer">
                                <IconButton size="small" onClick={() => handleDeleteClick(note)}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            );
          })}
          
          <TablePagination
            component="div"
            count={etudiantIds.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Étudiants par page:"
          />
        </>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            Aucune note trouvée. Veuillez sélectionner une classe et une matière, puis ajouter des notes.
          </Typography>
        </Paper>
      )}
      
      {/* Dialogue d'ajout/modification de note */}
      <Dialog open={openNoteDialog} onClose={handleCloseNoteDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingNote ? 'Modifier la note' : 'Ajouter une nouvelle note'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth sx={{ mt: 1 }}>
                <InputLabel id="etudiant-select-label">Étudiant</InputLabel>
                <Select
                  labelId="etudiant-select-label"
                  id="etudiant-select"
                  name="etudiant"
                  value={noteForm.etudiant}
                  label="Étudiant"
                  onChange={handleNoteFormChange}
                  disabled={editingNote}
                >
                  {etudiants.map((etudiant) => (
                    <MenuItem key={etudiant.id} value={etudiant.id.toString()}>
                      {`${etudiant.prenom} ${etudiant.nom}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Note /20"
                name="valeur"
                type="number"
                inputProps={{ min: 0, max: 20, step: 0.25 }}
                value={noteForm.valeur}
                onChange={handleNoteFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="type-evaluation-select-label">Type d'évaluation</InputLabel>
                <Select
                  labelId="type-evaluation-select-label"
                  id="type-evaluation-select"
                  name="type_evaluation"
                  value={noteForm.type_evaluation}
                  label="Type d'évaluation"
                  onChange={handleNoteFormChange}
                >
                  <MenuItem value="Examen">Examen</MenuItem>
                  <MenuItem value="Contrôle">Contrôle</MenuItem>
                  <MenuItem value="TP">TP</MenuItem>
                  <MenuItem value="Projet">Projet</MenuItem>
                  <MenuItem value="Oral">Oral</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date d'évaluation"
                name="date_evaluation"
                type="date"
                value={noteForm.date_evaluation}
                onChange={handleNoteFormChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="trimestre-form-select-label">Trimestre</InputLabel>
                <Select
                  labelId="trimestre-form-select-label"
                  id="trimestre-form-select"
                  name="trimestre"
                  value={noteForm.trimestre}
                  label="Trimestre"
                  onChange={handleNoteFormChange}
                >
                  <MenuItem value={1}>1er Trimestre</MenuItem>
                  <MenuItem value={2}>2ème Trimestre</MenuItem>
                  <MenuItem value={3}>3ème Trimestre</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Commentaire"
                name="commentaire"
                multiline
                rows={3}
                value={noteForm.commentaire}
                onChange={handleNoteFormChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNoteDialog}>Annuler</Button>
          <Button onClick={handleSaveNote} variant="contained" startIcon={<SaveIcon />}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialogue de confirmation de suppression */}
      <Dialog open={openDeleteDialog} onClose={handleCancelDelete}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Êtes-vous sûr de vouloir supprimer cette note ?
            {noteToDelete && (
              <>
                <br />
                <strong>Étudiant:</strong> {getEtudiantNom(noteToDelete.etudiant)}<br />
                <strong>Note:</strong> {parseFloat(noteToDelete.valeur).toFixed(2)}/20<br />
                <strong>Type:</strong> {noteToDelete.type_evaluation}
              </>
            )}
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
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfessorNotes; 