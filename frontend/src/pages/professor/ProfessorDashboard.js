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
        // Récupérer l'ID du professeur à partir du profil utilisateur
        const professeurId = profile?.id || 1; // Utiliser 1 comme valeur par défaut si non disponible
        
        // Utiliser l'API pour récupérer les données du tableau de bord
        const timestamp = new Date().getTime(); // Pour éviter le cache
        const response = await fetch(`/api/professeurs/${professeurId}/dashboard/?timestamp=${timestamp}`);
        
        let dashboardData;
        
        if (response.ok) {
          dashboardData = await response.json();
          console.log('Données du tableau de bord chargées depuis l\'API:', dashboardData);
        } else {
          console.error('Erreur lors du chargement des données du tableau de bord:', response.statusText);
          // Utiliser un objet vide en cas d'erreur
          dashboardData = {
            statistiques_classes: [],
            matieres: [],
            emploi_du_temps: [],
            total_etudiants: 0,
            total_notes: 0
          };
        }
        
        setDashboardData(dashboardData);
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