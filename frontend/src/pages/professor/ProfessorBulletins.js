import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

const ProfessorBulletins = () => {
  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Bulletins scolaires
      </Typography>
      
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="body1">
          Cette page permet de gérer les bulletins scolaires.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ProfessorBulletins; 