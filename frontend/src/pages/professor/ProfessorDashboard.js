import React, { useState, useEffect } from 'react';
import { Grid, Typography, Paper, Box, Divider, Skeleton, Alert } from '@mui/material';
import {
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
  Assessment as AssessmentIcon,
  EventNote as EventNoteIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { fetchProfesseurDashboard } from '../../utils/api';
import StatCard from '../../components/Dashboard/StatCard';

const ProfessorDashboard = () => {
  const { profile } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Utiliser des données statiques au lieu de l'API
        const mockDashboardData = {
          statistiques_classes: [
            {
              classe_id: 1,
              classe_nom: 'ijh',
              nb_etudiants: 2,
              moyenne_generale: 14.2,
              nb_notes: 5
            },
            {
              classe_id: 2,
              classe_nom: 'vg66',
              nb_etudiants: 1,
              moyenne_generale: 16.5,
              nb_notes: 2
            }
          ],
          matieres: [
            { id: 1, nom: 'Mathématiques', coefficient: 3 },
            { id: 4, nom: 'Anglais', coefficient: 2 }
          ],
          emploi_du_temps: [
            { jour: 'Lundi', heure_debut: '08:00', heure_fin: '10:00', matiere: 'Mathématiques', classe: 'ijh' },
            { jour: 'Mardi', heure_debut: '14:00', heure_fin: '16:00', matiere: 'Anglais', classe: 'ijh' },
            { jour: 'Jeudi', heure_debut: '10:00', heure_fin: '12:00', matiere: 'Mathématiques', classe: 'vg66' }
          ],
          total_etudiants: 3,
          total_notes: 7
        };
        
        setDashboardData(mockDashboardData);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError("Impossible de charger les données du tableau de bord");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ padding: 3 }}>
        <Typography variant="h4" gutterBottom>
          Tableau de bord
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tableau de bord
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Bienvenue, {profile?.prenom} {profile?.nom}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Année scolaire {new Date().getFullYear()}
        </Typography>
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Classes" 
            value={dashboardData?.statistiques_classes?.length || 0} 
            icon={<SchoolIcon fontSize="large" />}
            color="#1565c0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Matières" 
            value={dashboardData?.matieres?.length || 0}
            icon={<MenuBookIcon fontSize="large" />}
            color="#00897b"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Cours par semaine" 
            value={dashboardData?.emploi_du_temps?.length || 0}
            icon={<EventNoteIcon fontSize="large" />}
            color="#ff6d00"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Moyenne générale" 
            value={dashboardData?.statistiques_classes?.[0]?.moyenne_generale?.toFixed(2) || 'N/A'}
            icon={<AssessmentIcon fontSize="large" />}
            color="#e91e63"
          />
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Vue d'ensemble
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1">
              Utilisez le menu de gauche pour gérer vos notes, bulletins et consulter votre emploi du temps.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfessorDashboard; 