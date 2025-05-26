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

import { NIVEAUX_INGENIEUR, TYPES_EVALUATION } from '../../utils/constants';
import { etudiantService, matiereService, professeurService, classeService, noteService } from '../../utils/apiService';

const AdminNotes = () => {
  // États pour les données
  const [classes, setClasses] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [professeurs, setProfesseurs] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [notes, setNotes] = useState([]);
  
  // États pour les filtres
  const [selectedNiveau, setSelectedNiveau] = useState('');
  const [selectedClasse, setSelectedClasse] = useState('1');
  const [selectedMatiere, setSelectedMatiere] = useState('');
  const [selectedProfesseur, setSelectedProfesseur] = useState('');
  const [selectedTrimestre, setSelectedTrimestre] = useState(1);
  
  // États pour le formulaire de notes
  const [openNoteDialog, setOpenNoteDialog] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteForm, setNoteForm] = useState({
    etudiant: '',
    matiere: '',
    professeur: '',
    niveau: '',
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
  const [loading, setLoading] = useState(false);
  
  // Fonction pour charger les étudiants depuis l'API
  const loadEtudiants = async () => {
    try {
      const data = await etudiantService.getAll();
      setEtudiants(Array.isArray(data) ? data : []);
      console.log('Chargement des étudiants depuis l\'API:', data);
    } catch (error) {
      console.error('Erreur lors du chargement des étudiants depuis l\'API:', error);
      setEtudiants([]);
    }
  };
  
  // Fonction pour charger les matières depuis l'API
  const loadMatieres = async () => {
    try {
      const data = await matiereService.getAll();
      setMatieres(Array.isArray(data) ? data : []);
      console.log('Chargement des matières depuis l\'API:', data);
    } catch (error) {
      console.error('Erreur lors du chargement des matières depuis l\'API:', error);
      setMatieres([]);
    }
  };
  
  // Fonction pour charger les professeurs depuis l'API
  const loadProfesseurs = async () => {
    try {
      const data = await professeurService.getAll();
      setProfesseurs(Array.isArray(data) ? data : []);
      console.log('Chargement des professeurs depuis l\'API:', data);
    } catch (error) {
      console.error('Erreur lors du chargement des professeurs depuis l\'API:', error);
      setProfesseurs([]);
    }
  };
  
  // Fonction pour charger les classes depuis l'API
  const loadClasses = async () => {
    try {
      const data = await classeService.getAll();
      setClasses(Array.isArray(data) ? data : []);
      console.log('Chargement des classes depuis l\'API:', data);
    } catch (error) {
      console.error('Erreur lors du chargement des classes depuis l\'API:', error);
      setClasses([]);
    }
  };
  
  // Fonction pour charger les notes depuis l'API
  const loadNotes = async () => {
    try {
      const data = await noteService.getAll();
      setNotes(Array.isArray(data) ? data : []);
      console.log('Chargement des notes depuis l\'API:', data);
    } catch (error) {
      console.error('Erreur lors du chargement des notes depuis l\'API:', error);
      setNotes([]);
    }
  };
  
  // Charger les données depuis l'API au chargement de la page
  useEffect(() => {
    loadEtudiants();
    loadMatieres();
    loadProfesseurs();
    loadClasses();
    loadNotes();
  }, []);
  
  // Filtrer les notes en fonction des critères sélectionnés
  const filteredNotes = notes.filter(note => {
    let match = true;
    
    // Filtrer par niveau (prioritaire)
    if (selectedNiveau) {
      // Vérifier le niveau de l'étudiant
      const etudiant = etudiants.find(e => e.id === note.etudiant);
      match = match && etudiant && etudiant.niveau === selectedNiveau;

      // Si la note a son propre niveau, vérifier également
      if (note.niveau) {
        match = match && note.niveau === selectedNiveau;
      }
    }
    
    // Filtrer par classe
    if (selectedClasse) {
      const etudiant = etudiants.find(e => e.id === note.etudiant);
      match = match && etudiant && etudiant.classe === parseInt(selectedClasse);
    }
    
    // Filtrer par matière
    if (selectedMatiere) {
      match = match && note.matiere === parseInt(selectedMatiere);
    }
    
    // Filtrer par professeur
    if (selectedProfesseur) {
      match = match && note.professeur === parseInt(selectedProfesseur);
      
      // Vérifier que le professeur enseigne à ce niveau
      if (selectedNiveau && match) {
        const prof = professeurs.find(p => p.id === parseInt(selectedProfesseur));
        if (prof && prof.niveaux) {
          match = match && prof.niveaux.includes(selectedNiveau);
        }
      }
    }
    
    // Filtrer par trimestre
    if (selectedTrimestre) {
      match = match && note.trimestre === parseInt(selectedTrimestre);
    }
    
    return match;
  });
  
  // Pagination des résultats
  const paginatedNotes = filteredNotes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  
  // Gestion de la pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Gestion des filtres
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    
    if (name === 'niveau') {
      setSelectedNiveau(value);
      
      // Si on change le niveau, on peut filtrer les professeurs qui enseignent à ce niveau
      if (value && professeurs.length > 0) {
        const profsNiveau = professeurs.filter(p => 
          p.niveaux && p.niveaux.includes(value)
        );
        // Mettre à jour le filtre des professeurs si nécessaire
        if (profsNiveau.length > 0 && selectedProfesseur) {
          const profActuel = professeurs.find(p => p.id.toString() === selectedProfesseur);
          if (profActuel && (!profActuel.niveaux || !profActuel.niveaux.includes(value))) {
            setSelectedProfesseur(''); // Réinitialiser si le prof actuel n'enseigne pas à ce niveau
          }
        }
      }
      
      setPage(0);
    } else if (name === 'classe') {
      setSelectedClasse(value);
      setPage(0);
    } else if (name === 'matiere') {
      setSelectedMatiere(value);
      setPage(0);
    } else if (name === 'professeur') {
      setSelectedProfesseur(value);
      setPage(0);
    } else if (name === 'trimestre') {
      setSelectedTrimestre(parseInt(value));
      setPage(0);
    }
  };
  
  // Gestion du formulaire de notes
  const handleOpenNoteDialog = (note = null) => {
    // Si on édite une note existante
    if (note) {
      setEditingNote(note);
      setNoteForm({
        etudiant: note.etudiant.toString(),
        matiere: note.matiere.toString(),
        professeur: note.professeur.toString(),
        niveau: note.niveau || selectedNiveau || '',
        valeur: note.valeur.toString(),
        date_evaluation: note.date_evaluation,
        type_evaluation: note.type_evaluation,
        commentaire: note.commentaire || '',
        trimestre: note.trimestre
      });
    } else {
      // Nouvelle note
      setEditingNote(null);
      
      // Vérifier si des étudiants sont disponibles
      if (etudiants.length === 0) {
        showSnackbar('Aucun étudiant disponible. Veuillez sélectionner une classe contenant des étudiants.', 'warning');
      }
      
      setNoteForm({
        etudiant: etudiants.length > 0 ? etudiants[0].id.toString() : '',
        matiere: selectedMatiere || (matieres.length > 0 ? matieres[0].id.toString() : ''),
        professeur: selectedProfesseur || '1',
        niveau: selectedNiveau || '',
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
      setLoading(true);
      
      // Validation basique
      if (!noteForm.etudiant || !noteForm.matiere || !noteForm.valeur || !noteForm.date_evaluation) {
        showSnackbar('Veuillez remplir tous les champs obligatoires', 'error');
        setLoading(false);
        return;
      }
      
      // Préparer les données
      const noteData = {
        ...noteForm,
        valeur: parseFloat(noteForm.valeur),
        etudiant: parseInt(noteForm.etudiant),
        matiere: parseInt(noteForm.matiere),
        professeur: parseInt(noteForm.professeur),
        niveau: noteForm.niveau,
        trimestre: parseInt(noteForm.trimestre)
      };
      
      // En mode édition ou création?
      if (editingNote) {
        // Édition d'une note existante via l'API REST
        console.log('Mise à jour de la note:', editingNote.id, noteData);
        
        const updatedNote = await noteService.update(editingNote.id, noteData);
        
        // Mettre à jour l'état local des notes
        const updatedNotes = notes.map(note => 
          note.id === editingNote.id ? updatedNote : note
        );
        
        setNotes(updatedNotes);
        showSnackbar('Note mise à jour avec succès', 'success');
      } else {
        // Création d'une nouvelle note via l'API REST
        console.log('Création d\'une nouvelle note:', noteData);
        
        const newNote = await noteService.create(noteData);
        
        // Ajouter la note à l'état local
        setNotes([...notes, newNote]);
        showSnackbar('Note ajoutée avec succès', 'success');
      }
      
      // Fermer le dialogue
      handleCloseNoteDialog();
      
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la note:', error);
      showSnackbar('Erreur lors de l\'enregistrement de la note: ' + (error.message || 'Erreur inconnue'), 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Gestion de la suppression de notes
  const handleDeleteClick = (note) => {
    setNoteToDelete(note);
    setOpenDeleteDialog(true);
  };
  
  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      
      if (!noteToDelete) return;
      
      console.log('Suppression de la note:', noteToDelete.id);
      
      // Supprimer la note via l'API REST
      await noteService.delete(noteToDelete.id);
      
      // Mettre à jour l'état local des notes
      setNotes(notes.filter(note => note.id !== noteToDelete.id));
      
      showSnackbar('Note supprimée avec succès', 'success');
      setOpenDeleteDialog(false);
      setNoteToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression de la note:', error);
      showSnackbar('Erreur lors de la suppression de la note: ' + (error.message || 'Erreur inconnue'), 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelDelete = () => {
    setOpenDeleteDialog(false);
    setNoteToDelete(null);
  };
  
  // Gestion des notifications
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
  
  // Fonctions utilitaires pour récupérer les noms à partir des IDs
  const getEtudiantNom = (id) => {
    const etudiant = etudiants.find(e => e.id === parseInt(id));
    return etudiant ? `${etudiant.prenom} ${etudiant.nom}` : 'Inconnu';
  };
  
  const getMatiereNom = (id) => {
    const matiere = matieres.find(m => m.id === parseInt(id));
    return matiere ? matiere.nom : 'Inconnue';
  };
  
  const getProfesseurNom = (id) => {
    const professeur = professeurs.find(p => p.id === parseInt(id));
    return professeur ? `${professeur.prenom} ${professeur.nom}` : 'Inconnu';
  };
  
  const getClasseNom = (id) => {
    const classe = classes.find(c => c.id === parseInt(id));
    return classe ? classe.nom : 'Inconnue';
  };
  
  // Calculer la moyenne des notes pour un étudiant donné
  const calculerMoyenneEtudiant = (etudiantId) => {
    const notesEtudiant = notes.filter(note => note.etudiant === parseInt(etudiantId));
    if (notesEtudiant.length === 0) return 'N/A';
    
    const somme = notesEtudiant.reduce((acc, note) => acc + parseFloat(note.valeur), 0);
    return (somme / notesEtudiant.length).toFixed(2);
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gestion des Notes
      </Typography>
      
      {/* Filtres */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filtres
        </Typography>
        <Grid container spacing={2} sx={{ p: 2 }}>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel id="niveau-select-label">Niveau</InputLabel>
              <Select
                labelId="niveau-select-label"
                id="niveau-select"
                name="niveau"
                value={selectedNiveau}
                label="Niveau"
                onChange={handleFilterChange}
              >
                <MenuItem value="">Tous les niveaux</MenuItem>
                {NIVEAUX_INGENIEUR.map((niveau) => (
                  <MenuItem key={niveau.id} value={niveau.id.toString()}>
                    {niveau.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
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
                <MenuItem value="">Toutes les classes</MenuItem>
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
                <MenuItem value="">Toutes les matières</MenuItem>
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
              <InputLabel id="professeur-select-label">Professeur</InputLabel>
              <Select
                labelId="professeur-select-label"
                id="professeur-select"
                name="professeur"
                value={selectedProfesseur}
                label="Professeur"
                onChange={handleFilterChange}
              >
                <MenuItem value="">Tous les professeurs</MenuItem>
                {professeurs.map((prof) => (
                  <MenuItem key={prof.id} value={prof.id.toString()}>
                    {prof.prenom} {prof.nom}
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
        </Grid>
      </Paper>
      
      {/* Statistiques */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Nombre d'étudiants
              </Typography>
              <Typography variant="h4">
                {etudiants.filter(e => e.classe === parseInt(selectedClasse)).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Nombre de notes
              </Typography>
              <Typography variant="h4">
                {filteredNotes.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Moyenne générale
              </Typography>
              <Typography variant="h4">
                {filteredNotes.length > 0 
                  ? (filteredNotes.reduce((acc, note) => acc + parseFloat(note.valeur), 0) / filteredNotes.length).toFixed(2)
                  : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Note maximale
              </Typography>
              <Typography variant="h4">
                {filteredNotes.length > 0 
                  ? Math.max(...filteredNotes.map(note => parseFloat(note.valeur))).toFixed(2)
                  : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Liste des notes */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Typography variant="h6">
            Liste des Notes
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenNoteDialog()}
          >
            Ajouter une note
          </Button>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Étudiant</TableCell>
                <TableCell>Matière</TableCell>
                <TableCell>Professeur</TableCell>
                <TableCell>Niveau</TableCell>
                <TableCell>Note</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Commentaire</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress sx={{ my: 2 }} />
                  </TableCell>
                </TableRow>
              ) : paginatedNotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Aucune note trouvée pour les critères sélectionnés
                  </TableCell>
                </TableRow>
              ) : (
                paginatedNotes.map((note) => (
                  <TableRow key={note.id}>
                    <TableCell>{getEtudiantNom(note.etudiant)}</TableCell>
                    <TableCell>{getMatiereNom(note.matiere)}</TableCell>
                    <TableCell>{getProfesseurNom(note.professeur)}</TableCell>
                    <TableCell>
                      {note.niveau ? (
                        NIVEAUX_INGENIEUR.find(n => n.id.toString() === note.niveau)?.nom || 'Niveau ' + note.niveau
                      ) : (
                        'Non défini'
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${parseFloat(note.valeur).toFixed(2)}/20`} 
                        color={note.valeur >= 10 ? "success" : "error"} 
                        variant="outlined" 
                      />
                    </TableCell>
                    <TableCell>{note.type_evaluation}</TableCell>
                    <TableCell>{new Date(note.date_evaluation).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {note.commentaire && note.commentaire.length > 20 
                        ? `${note.commentaire.substring(0, 20)}...` 
                        : note.commentaire}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Modifier">
                        <IconButton onClick={() => handleOpenNoteDialog(note)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton color="error" onClick={() => handleDeleteClick(note)}>
                          <DeleteIcon />
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
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredNotes.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
        />
      </Paper>
      
      {/* Dialogue d'ajout/modification de notes */}
      <Dialog open={openNoteDialog} onClose={handleCloseNoteDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingNote ? 'Modifier une note' : 'Ajouter une note'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="etudiant-select-label">Étudiant</InputLabel>
                <Select
                  labelId="etudiant-select-label"
                  id="etudiant-select"
                  name="etudiant"
                  value={noteForm.etudiant}
                  label="Étudiant"
                  onChange={handleNoteFormChange}
                >
                  {etudiants
                    .filter(e => !selectedClasse || e.classe === parseInt(selectedClasse))
                    .map((etudiant) => (
                      <MenuItem key={etudiant.id} value={etudiant.id.toString()}>
                        {etudiant.prenom} {etudiant.nom}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="niveau-form-select-label">Niveau</InputLabel>
                <Select
                  labelId="niveau-form-select-label"
                  id="niveau-form-select"
                  name="niveau"
                  value={noteForm.niveau}
                  label="Niveau"
                  onChange={handleNoteFormChange}
                >
                  {NIVEAUX_INGENIEUR.map((niveau) => (
                    <MenuItem key={niveau.id} value={niveau.id.toString()}>
                      {niveau.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="matiere-form-select-label">Matière</InputLabel>
                <Select
                  labelId="matiere-form-select-label"
                  id="matiere-form-select"
                  name="matiere"
                  value={noteForm.matiere}
                  label="Matière"
                  onChange={handleNoteFormChange}
                >
                  {matieres.map((matiere) => (
                    <MenuItem key={matiere.id} value={matiere.id.toString()}>
                      {matiere.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Note sur 20"
                name="valeur"
                type="number"
                value={noteForm.valeur}
                onChange={handleNoteFormChange}
                inputProps={{ min: 0, max: 20, step: 0.25 }}
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

export default AdminNotes;
