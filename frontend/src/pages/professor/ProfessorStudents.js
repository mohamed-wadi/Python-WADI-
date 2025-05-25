import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

const ProfessorStudents = () => {
  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Mes étudiants
      </Typography>
      
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="body1">
          Cette page affiche la liste de vos étudiants.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ProfessorStudents; 