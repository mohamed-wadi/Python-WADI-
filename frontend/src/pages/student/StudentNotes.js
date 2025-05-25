import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

const StudentNotes = () => {
  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Mes notes
      </Typography>
      
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="body1">
          Cette page affiche vos notes par matière et trimestre.
        </Typography>
      </Paper>
    </Box>
  );
};

export default StudentNotes; 