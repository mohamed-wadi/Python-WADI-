import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  Grid,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Info as InfoIcon 
} from '@mui/icons-material';

// Jours de la semaine - exclus dimanche comme demandé
const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

// Horaires de cours (8h à 18h avec pas de 1h)
const HORAIRES = Array.from({ length: 11 }, (_, i) => ({
  label: `${i + 8}:00`,
  value: `${(i + 8).toString().padStart(2, '0')}:00:00`
}));

const CalendarSchedule = ({ 
  cours, 
  onEdit, 
  onDelete, 
  viewMode = 'classe', 
  classes = [], 
  professeurs = [], 
  selectedEntity 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [coursDetails, setCoursDetails] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  // Filtrer les cours selon le mode de vue et l'entité sélectionnée
  const filteredCours = cours.filter(c => {
    const classeId = c.classe?.toString ? c.classe.toString() : String(c.classe);
    const professeurId = c.professeur?.toString ? c.professeur.toString() : String(c.professeur);
    
    return viewMode === 'classe' 
      ? classeId === selectedEntity
      : professeurId === selectedEntity;
  });

  // Organiser les cours par jour et par heure
  const coursParJourEtHeure = {};
  
  // Initialiser la structure pour chaque jour et chaque heure
  JOURS.forEach(jour => {
    coursParJourEtHeure[jour] = {};
    HORAIRES.forEach(horaire => {
      coursParJourEtHeure[jour][horaire.value] = [];
    });
  });

  // Placer chaque cours dans le bon créneau
  filteredCours.forEach(c => {
    if (!c.jour || !c.heure_debut) return;
    
    // Trouver le créneau le plus proche pour l'heure de début
    const creneauIndex = HORAIRES.findIndex(h => {
      // Convertir heure_debut en valeur numérique (heures)
      const coursHeure = parseInt(c.heure_debut.split(':')[0], 10);
      const creneauHeure = parseInt(h.value.split(':')[0], 10);
      
      // Placer le cours au créneau le plus proche
      return coursHeure <= creneauHeure;
    });
    
    if (creneauIndex >= 0 && creneauIndex < HORAIRES.length) {
      const creneau = HORAIRES[creneauIndex].value;
      if (coursParJourEtHeure[c.jour] && coursParJourEtHeure[c.jour][creneau]) {
        coursParJourEtHeure[c.jour][creneau].push(c);
      }
    }
  });

  // Déterminer la hauteur d'un cours en fonction de sa durée
  const getCoursHeight = (cours) => {
    if (!cours.heure_debut || !cours.heure_fin) return 60; // Par défaut 1h
    
    const debut = cours.heure_debut.split(':');
    const fin = cours.heure_fin.split(':');
    
    if (debut.length < 2 || fin.length < 2) return 60;
    
    const debutHeure = parseInt(debut[0], 10);
    const debutMinutes = parseInt(debut[1], 10);
    const finHeure = parseInt(fin[0], 10);
    const finMinutes = parseInt(fin[1], 10);
    
    const dureeMinutes = (finHeure - debutHeure) * 60 + (finMinutes - debutMinutes);
    
    // Limiter à un minimum de 30 minutes et maximum de 4 heures
    return Math.min(Math.max(dureeMinutes, 30), 240);
  };

  // Convertir l'heure au format HH:MM
  const formatHeure = (heure) => {
    if (!heure) return '--:--';
    return heure.substring(0, 5);
  };

  // Obtenir la couleur du cours
  const getCoursColor = (matiereId) => {
    // Tableau de couleurs variées
    const colors = [
      '#4CAF50', // vert
      '#2196F3', // bleu
      '#FF9800', // orange
      '#9C27B0', // violet
      '#F44336', // rouge
      '#009688', // teal
      '#3F51B5', // indigo
      '#FFC107', // ambre
      '#795548', // marron
      '#607D8B'  // bleu-gris
    ];
    
    // Utiliser l'ID de la matière pour choisir une couleur
    const colorIndex = (matiereId % colors.length);
    return colors[colorIndex];
  };

  const handleShowDetails = (cours) => {
    setCoursDetails(cours);
    setOpenDetailsDialog(true);
  };

  const handleCloseDetails = () => {
    setOpenDetailsDialog(false);
  };

  return (
    <Paper sx={{ p: 2, overflow: 'auto', mt: 3 }}>
      <Box sx={{ display: 'flex', minWidth: isMobile ? 800 : '100%' }}>
        {/* Colonne des horaires */}
        <Box sx={{ width: '80px', flexShrink: 0, pr: 1, borderRight: '1px solid #eee' }}>
          <Box sx={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="subtitle2" color="textSecondary">Horaires</Typography>
          </Box>
          {HORAIRES.map((horaire, index) => (
            <Box key={index} sx={{ 
              height: '60px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderTop: '1px solid #eee'
            }}>
              <Typography variant="body2">{horaire.label}</Typography>
            </Box>
          ))}
        </Box>
        
        {/* Grille des jours et cours */}
        <Grid container sx={{ flexGrow: 1 }}>
          <Grid container>
            {JOURS.map((jour) => (
              <Grid item xs key={jour} sx={{ borderRight: '1px solid #eee', flexGrow: 1 }}>
                <Box sx={{ 
                  height: '60px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  borderBottom: '1px solid #eee'
                }}>
                  <Typography variant="subtitle1">{jour}</Typography>
                </Box>
                
                {HORAIRES.map((horaire, hIndex) => (
                  <Box key={hIndex} sx={{ 
                    position: 'relative',
                    height: '60px', 
                    borderTop: '1px solid #eee'
                  }}>
                    {coursParJourEtHeure[jour][horaire.value].map((cours, cIndex) => (
                      <Box
                        key={`${cours.id}-${cIndex}`}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: '5px',
                          right: '5px',
                          height: `${getCoursHeight(cours)}px`,
                          backgroundColor: getCoursColor(cours.matiere),
                          color: 'white',
                          borderRadius: '4px',
                          padding: '8px',
                          overflow: 'hidden',
                          zIndex: 2,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          display: 'flex',
                          flexDirection: 'column',
                          '&:hover': {
                            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                          }
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {cours.matiere_nom}
                        </Typography>
                        <Typography variant="caption" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {viewMode === 'classe' ? cours.professeur_nom : cours.classe_nom}
                        </Typography>
                        <Typography variant="caption">
                          {formatHeure(cours.heure_debut)} - {formatHeure(cours.heure_fin)}
                        </Typography>
                        <Typography variant="caption" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          Salle: {cours.salle}
                        </Typography>
                        
                        <Box sx={{ position: 'absolute', top: '2px', right: '2px', display: 'flex' }}>
                          <Tooltip title="Détails">
                            <IconButton 
                              size="small" 
                              onClick={() => handleShowDetails(cours)}
                              sx={{ color: 'white', padding: '2px' }}
                            >
                              <InfoIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Modifier">
                            <IconButton 
                              size="small" 
                              onClick={() => onEdit(cours)}
                              sx={{ color: 'white', padding: '2px' }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton 
                              size="small" 
                              onClick={() => onDelete(cours)}
                              sx={{ color: 'white', padding: '2px' }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ))}
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Box>

      {/* Dialogue de détails du cours */}
      <Dialog open={openDetailsDialog} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
        <DialogTitle>Détails du cours</DialogTitle>
        <DialogContent dividers>
          {coursDetails && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6">{coursDetails.matiere_nom}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Professeur:</Typography>
                <Typography variant="body2">{coursDetails.professeur_nom}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Classe:</Typography>
                <Typography variant="body2">{coursDetails.classe_nom}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Horaire:</Typography>
                <Typography variant="body2">
                  {formatHeure(coursDetails.heure_debut)} - {formatHeure(coursDetails.heure_fin)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Salle:</Typography>
                <Typography variant="body2">{coursDetails.salle}</Typography>
              </Grid>
              {coursDetails.description && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Description:</Typography>
                  <Typography variant="body2">{coursDetails.description}</Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Fermer</Button>
          {coursDetails && (
            <>
              <Button onClick={() => {
                handleCloseDetails();
                onEdit(coursDetails);
              }} color="primary">
                Modifier
              </Button>
              <Button onClick={() => {
                handleCloseDetails();
                onDelete(coursDetails);
              }} color="error">
                Supprimer
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default CalendarSchedule;
