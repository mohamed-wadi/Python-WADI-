import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

const AdminSettings = () => {
  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Paramètres
      </Typography>
      
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="body1">
          Cette page permet de configurer les paramètres de l'application.
        </Typography>
      </Paper>
    </Box>
  );
};

export default AdminSettings; 