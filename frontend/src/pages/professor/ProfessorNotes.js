import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

const ProfessorNotes = () => {
  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gestion des notes
      </Typography>
      
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="body1">
          Cette page permet de gérer les notes des étudiants.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ProfessorNotes; 