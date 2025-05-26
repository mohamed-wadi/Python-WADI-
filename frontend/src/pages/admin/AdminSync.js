import React from 'react';
import { Container, Typography, Paper } from '@mui/material';
import SyncManager from '../../components/SyncManager';

const AdminSync = () => {
  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h4" gutterBottom component="h1">
          Synchronisation des données
        </Typography>
        <Typography variant="body1" paragraph>
          Cette page vous permet d'envoyer les données du localStorage vers le serveur Django.
          Toutes les modifications que vous avez effectuées localement (ajouts, modifications, suppressions)
          seront synchronisées avec la base de données du backend.
        </Typography>
        <SyncManager />
      </Paper>
    </Container>
  );
};

export default AdminSync;
