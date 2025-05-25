import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

const ProfessorCours = () => {
  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Mes cours
      </Typography>
      
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="body1">
          Cette page affiche vos cours et votre emploi du temps.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ProfessorCours; 