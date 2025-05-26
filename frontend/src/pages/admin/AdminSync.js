import React from 'react';
import { Container, Typography, Paper, Alert, Button, Box } from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const AdminSync = () => {
  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h4" gutterBottom component="h1">
          Statut du Système
        </Typography>
        
        <Alert severity="success" icon={<CheckCircleIcon fontSize="inherit" />} sx={{ mb: 3 }}>
          <Typography variant="h6">Migration vers l'API REST complétée</Typography>
          <Typography variant="body1">
            L'application a été entièrement migrée du localStorage vers l'API REST. 
            Toutes les données sont maintenant directement gérées par le backend Django et stockées dans la base de données MySQL.
          </Typography>
        </Alert>
        
        <Typography variant="body1" paragraph>
          Le module de synchronisation n'est plus nécessaire car l'application communique maintenant en temps réel avec le serveur via l'API REST.
          Toutes les opérations (création, lecture, mise à jour, suppression) sont effectuées directement sur la base de données.
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          <Button 
            variant="contained" 
            color="primary" 
            component={RouterLink} 
            to="/admin/dashboard"
          >
            Retour au Tableau de Bord
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminSync;
