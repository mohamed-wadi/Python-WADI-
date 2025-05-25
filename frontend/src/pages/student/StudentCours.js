import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

const StudentCours = () => {
  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Emploi du temps
      </Typography>
      
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="body1">
          Cette page affiche votre emploi du temps et informations sur les cours.
        </Typography>
      </Paper>
    </Box>
  );
};

export default StudentCours; 