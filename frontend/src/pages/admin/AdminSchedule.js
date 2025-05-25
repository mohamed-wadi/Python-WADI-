import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

const AdminSchedule = () => {
  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gestion des emplois du temps
      </Typography>
      
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="body1">
          Cette page permet de gérer les emplois du temps des classes et des professeurs.
        </Typography>
      </Paper>
    </Box>
  );
};

export default AdminSchedule; 