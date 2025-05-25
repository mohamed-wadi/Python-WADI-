import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

const StudentBulletins = () => {
  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Mes bulletins
      </Typography>
      
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="body1">
          Cette page affiche vos bulletins trimestriels.
        </Typography>
      </Paper>
    </Box>
  );
};

export default StudentBulletins; 