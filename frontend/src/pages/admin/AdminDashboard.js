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
import StatCard from '../../components/Dashboard/StatCard';
import EventBus from '../../utils/eventBus';
import { ENTITY_KEYS, isEntityDeleted } from '../../utils/persistenceManager';

// Retour à l'utilisation des services API (avec URLs relatives)
import { etudiantService, professeurService, classeService, matiereService, dashboardService } from '../../utils/apiService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Charger les données initiales
    loadDynamicDashboardData();
    
    // S'abonner aux événements de changement de données dans la même fenêtre
    const unsubscribeDataChanged = EventBus.subscribe('data_changed', () => {
      console.log('Tableau de bord: Notification de changement de données reçue');
      loadDynamicDashboardData();
    });
    
    // Nettoyage des listeners si le composant est démonté
    return () => {
      unsubscribeDataChanged(); // Se désabonner de l'événement
    };
  }, []);
  
  // Rafraîchir manuellement les données du tableau de bord
  const refreshDashboard = () => {
    console.log('Rafraîchissement manuel du tableau de bord');
    loadDynamicDashboardData();
  };
  
  // Récupérer les données réelles du localStorage en cas d'échec de l'API
  const getLocalStorageData = () => {
    try {
      // Vérifier quelles entités ont été supprimées
      const classesDeleted = isEntityDeleted(ENTITY_KEYS.CLASSES);
      const professeursDeleted = isEntityDeleted(ENTITY_KEYS.PROFESSEURS);
      const matieresDeleted = isEntityDeleted(ENTITY_KEYS.MATIERES);
      const etudiantsDeleted = isEntityDeleted(ENTITY_KEYS.ETUDIANTS);
      
      // Récupérer les étudiants du localStorage
      const localEtudiants = etudiantsDeleted ? [] : JSON.parse(localStorage.getItem('schoolAppEtudiants')) || [];
      console.log('Etudiants récupérés du localStorage:', localEtudiants.length);
      
      // Récupérer les professeurs du localStorage
      const localProfesseurs = professeursDeleted ? [] : JSON.parse(localStorage.getItem('schoolAppProfesseurs')) || [];
      console.log('Professeurs récupérés du localStorage:', localProfesseurs.length);
      
      // Récupérer les classes du localStorage
      const localClasses = classesDeleted ? [] : JSON.parse(localStorage.getItem('schoolAppClasses')) || [];
      console.log('Classes récupérées du localStorage:', localClasses.length);
      
      // Récupérer les matières du localStorage
      const localMatieres = matieresDeleted ? [] : JSON.parse(localStorage.getItem('schoolAppMatieres')) || [];
      console.log('Matières récupérées du localStorage:', localMatieres.length);
      
      // Calculer la répartition des étudiants par classe
      const repartitionClasses = [];
      const etudiantsParNiveau = {};
      
      // Pour chaque classe, compter les étudiants
      localClasses.forEach(classe => {
        const etudiantsInClasse = localEtudiants.filter(e => e.classe === classe.id).length;
        const niveau = classe.niveau?.toString() || '1';
        
        repartitionClasses.push({
          classe: classe,
          nb_etudiants: etudiantsInClasse
        });
        
        // Ajouter au compteur par niveau
        etudiantsParNiveau[niveau] = (etudiantsParNiveau[niveau] || 0) + etudiantsInClasse;
      });
      
      return {
        nb_etudiants: localEtudiants.length,
        nb_professeurs: localProfesseurs.length,
        nb_classes: localClasses.length,
        nb_matieres: localMatieres.length,
        repartition_classes: repartitionClasses,
        etudiants_par_niveau: etudiantsParNiveau
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des données du localStorage:', error);
      // Données par défaut en cas d'erreur
      return {
        nb_etudiants: 0,
        nb_professeurs: 0,
        nb_classes: 0,
        nb_matieres: 0,
        repartition_classes: [],
        etudiants_par_niveau: {}
      };
    }
  };

  // Charger les données dynamiquement depuis l'API REST
  const loadDynamicDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Essayer de récupérer les données depuis l'API dashboard
      console.log('Tentative de connexion à l\'API dashboard...');
      const data = await dashboardService.getAdminStats();
      
      console.log('Données récupérées depuis l\'API dashboard:', data);
      
      // Créer un objet avec les données récupérées ou des valeurs par défaut
      const dashboardData = {
        nb_etudiants: data.nb_etudiants || 0,
        nb_professeurs: data.nb_professeurs || 0,
        nb_classes: data.nb_classes || 0,
        nb_matieres: data.nb_matieres || 0,
        repartition_classes: data.repartition_classes || [],
        repartition_matieres: data.repartition_matieres || []
      };
      
      // Extraire les données par niveau d'ingénieur si disponibles
      const etudiantsParNiveau = {};
      if (data.repartition_classes) {
        data.repartition_classes.forEach(item => {
          if (item.classe && item.classe.niveau) {
            const niveau = item.classe.niveau;
            etudiantsParNiveau[niveau] = (etudiantsParNiveau[niveau] || 0) + item.nb_etudiants;
          }
        });
        dashboardData.etudiants_par_niveau = etudiantsParNiveau;
      }
      
      console.log('Données traitées du tableau de bord:', dashboardData);
      setDashboardData(dashboardData);
    } catch (error) {
      console.error('Erreur lors du chargement des données du tableau de bord:', error);
      console.log('Utilisation des données réelles du localStorage comme fallback');
      
      // Récupérer les données réelles du localStorage au lieu des données mockées
      const localData = getLocalStorageData();
      console.log('Données récupérées du localStorage pour le tableau de bord:', localData);
      setDashboardData(localData);
      
      // Afficher un message d'avertissement au lieu d'une erreur
      setError('Connexion à l\'API impossible - Données locales utilisées');
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

  // Afficher une alerte si une erreur est détectée, mais continuer à afficher le dashboard avec les données mockées
  const errorAlert = error ? (
    <Box sx={{ mb: 2 }}>
      <Alert 
        severity="warning" 
        action={
          <Button color="inherit" size="small" onClick={refreshDashboard}>
            Réessayer
          </Button>
        }
      >
        {error}
      </Alert>
    </Box>
  ) : null;

  return (
    <Box sx={{ 
      padding: 2,
      paddingLeft: { xs: 2, md: 1 }, // Réduction du padding à gauche
      marginLeft: 0 // S'assurer qu'il n'y a pas de marge à gauche
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">
          Tableau de bord
        </Typography>
        <Button 
          startIcon={<RefreshIcon />} 
          variant="outlined" 
          onClick={refreshDashboard}
          size="small"
        >
          Actualiser
        </Button>
      </Box>
      
      {/* Afficher l'alerte d'erreur si nécessaire */}
      {errorAlert}
      
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