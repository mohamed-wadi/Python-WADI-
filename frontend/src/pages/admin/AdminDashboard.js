import React, { useState, useEffect } from 'react';
import { Grid, Typography, Paper, Box, Divider, Skeleton, Alert, Button, Card, CardContent, CardActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  People as PeopleIcon, 
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { fetchAdminDashboard } from '../../utils/api';
import StatCard from '../../components/Dashboard/StatCard';
import { STORAGE_KEYS, EVENTS, getActiveItems } from '../../utils/localStorageManager';
import EventBus from '../../utils/eventBus';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Charger les données initiales
    loadDynamicDashboardData();
    
    // Écouter les changements dans le localStorage depuis d'autres onglets
    window.addEventListener('storage', handleStorageChange);
    
    // S'abonner aux événements de changement de données dans la même fenêtre
    const unsubscribeDataChanged = EventBus.subscribe(EVENTS.DATA_CHANGED, () => {
      console.log('Tableau de bord: Notification de changement de données reçue');
      loadDynamicDashboardData();
    });
    
    // Nettoyage des listeners si le composant est démonté
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      unsubscribeDataChanged(); // Se désabonner de l'événement
    };
  }, []);
  
  // Fonction pour gérer les changements dans le localStorage depuis d'autres onglets
  const handleStorageChange = (event) => {
    console.log('Détection de changement dans localStorage:', event.key);
    if ([
      STORAGE_KEYS.ETUDIANTS, 
      STORAGE_KEYS.PROFESSEURS, 
      STORAGE_KEYS.CLASSES, 
      STORAGE_KEYS.MATIERES
    ].includes(event.key)) {
      loadDynamicDashboardData();
    }
  };
  
  // Rafraîchir manuellement les données du tableau de bord
  const refreshDashboard = () => {
    console.log('Rafraîchissement manuel du tableau de bord');
    loadDynamicDashboardData();
  };
  
  // Charger les données dynamiquement depuis le localStorage
  const loadDynamicDashboardData = () => {
    setLoading(true);
    
    try {
      // Récupérer les éléments actifs uniquement (non supprimés)
      const etudiantsActifs = getActiveItems(STORAGE_KEYS.ETUDIANTS);
      const professeursActifs = getActiveItems(STORAGE_KEYS.PROFESSEURS);
      const classesActives = getActiveItems(STORAGE_KEYS.CLASSES);
      const matieresActives = getActiveItems(STORAGE_KEYS.MATIERES);
      
      // Compter par niveau d'ingénieur (ING1 à ING5)
      const etudiantsParNiveau = {};
      etudiantsActifs.forEach(etudiant => {
        const niveau = etudiant.niveau || '1';
        etudiantsParNiveau[niveau] = (etudiantsParNiveau[niveau] || 0) + 1;
      });
      
      const dashboardData = {
        nb_etudiants: etudiantsActifs.length,
        nb_professeurs: professeursActifs.length,
        nb_classes: classesActives.length,
        nb_matieres: matieresActives.length,
        etudiants_par_niveau: etudiantsParNiveau
      };
      
      console.log('Données dynamiques du tableau de bord:', dashboardData);
      setDashboardData(dashboardData);
    } catch (error) {
      console.error('Erreur lors du chargement des données du tableau de bord:', error);
      setError('Erreur lors du chargement des données');
      // Utiliser des valeurs par défaut en cas d'erreur
      setDashboardData({
        nb_etudiants: 0,
        nb_professeurs: 0,
        nb_classes: 0,
        nb_matieres: 0,
        etudiants_par_niveau: {}
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ padding: 2 }}>
        <Typography variant="h4" gutterBottom>
          Tableau de bord
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      padding: 2,
      paddingLeft: { xs: 2, md: 1 }, // Réduction du padding à gauche
      marginLeft: 0 // S'assurer qu'il n'y a pas de marge à gauche
    }}>
      <Typography variant="h4" gutterBottom>
        Tableau de bord
      </Typography>
      
      <Box sx={{ mb: 3 }}> {/* Réduction de l'espacement */}
        <Typography variant="h6" gutterBottom>
          État de l'école
        </Typography>
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 3 }}> {/* Réduction de l'espacement */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Étudiants" 
            value={dashboardData?.nb_etudiants || 0} 
            icon={<PeopleIcon fontSize="large" />}
            color="#1565c0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Professeurs" 
            value={dashboardData?.nb_professeurs || 0} 
            icon={<PersonIcon fontSize="large" />}
            color="#00897b"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Classes" 
            value={dashboardData?.nb_classes || 0} 
            icon={<SchoolIcon fontSize="large" />}
            color="#ff6d00"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Matières" 
            value={dashboardData?.nb_matieres || 0} 
            icon={<MenuBookIcon fontSize="large" />}
            color="#e91e63"
          />
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bienvenue sur le panneau d'administration
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1">
              Utilisez le menu de gauche pour gérer les différentes ressources de l'école.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;