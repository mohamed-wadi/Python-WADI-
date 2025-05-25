import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Typography, 
  Paper, 
  Box, 
  Divider, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Card,
  CardContent,
  Skeleton,
  Alert
} from '@mui/material';
import {
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
  Assessment as AssessmentIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { fetchEtudiantDashboard } from '../../utils/api';
import StatCard from '../../components/Dashboard/StatCard';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const StudentDashboard = () => {
  const { profile } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const response = await fetchEtudiantDashboard();
        setDashboardData(response.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Impossible de charger les données du tableau de bord");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Generate chart data for grades by subject
  const getGradesChartData = () => {
    if (!dashboardData?.moyennes_par_matiere) return null;

    // Group by matiere and get the most recent trimester's grade for each
    const latestGrades = {};
    dashboardData.moyennes_par_matiere.forEach(item => {
      const matiereId = item.matiere.id;
      
      if (!latestGrades[matiereId] || item.trimestre > latestGrades[matiereId].trimestre) {
        latestGrades[matiereId] = item;
      }
    });

    const labels = Object.values(latestGrades).map(item => item.matiere.nom);
    const data = Object.values(latestGrades).map(item => item.moyenne);

    return {
      labels,
      datasets: [
        {
          label: 'Moyenne par matière',
          data,
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          borderColor: 'rgb(53, 162, 235)',
          borderWidth: 1,
        },
      ],
    };
  };

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
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
          <Grid item xs={12} md={4}>
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
          {dashboardData?.etudiant?.classe_nom} - Année scolaire {new Date().getFullYear()}
        </Typography>
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Moyenne générale" 
            value={dashboardData?.moyenne_generale?.toFixed(2) || 'N/A'} 
            icon={<AssessmentIcon fontSize="large" />}
            color="#1565c0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Bulletins" 
            value={dashboardData?.bulletins?.length || 0} 
            icon={<SchoolIcon fontSize="large" />}
            color="#00897b"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Matières" 
            value={dashboardData?.moyennes_par_matiere?.filter((v, i, a) => 
              a.findIndex(t => t.matiere.id === v.matiere.id) === i
            ).length || 0} 
            icon={<MenuBookIcon fontSize="large" />}
            color="#ff6d00"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Jours d'absence" 
            value={dashboardData?.absences?.length || 0} 
            icon={<EventIcon fontSize="large" />}
            color="#e91e63"
          />
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Mes notes par matière
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {getGradesChartData() ? (
              <Box sx={{ height: 300 }}>
                <Bar 
                  data={getGradesChartData()} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 20,
                      }
                    },
                    plugins: {
                      legend: {
                        display: true,
                        position: 'top',
                      },
                    },
                  }}
                />
              </Box>
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', my: 5 }}>
                Aucune note disponible
              </Typography>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Dernières notes
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {dashboardData?.notes?.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Matière</TableCell>
                      <TableCell align="right">Note</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.notes.slice(0, 5).map((note) => (
                      <TableRow key={note.id}>
                        <TableCell>{note.matiere_nom}</TableCell>
                        <TableCell align="right">{note.valeur}/20</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', my: 5 }}>
                Aucune note récente
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard; 