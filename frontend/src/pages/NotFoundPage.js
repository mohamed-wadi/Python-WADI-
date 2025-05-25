import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const NotFoundPage = () => {
  const { role } = useAuth();
  
  const getRedirectPath = () => {
    if (role === 'etudiant') return '/etudiant';
    if (role === 'professeur') return '/professeur';
    if (role === 'admin') return '/admin';
    return '/login';
  };
  
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
        }}
      >
        <Typography variant="h1" component="h1" color="primary" sx={{ fontSize: 120, fontWeight: 700 }}>
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          Page introuvable
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          La page que vous recherchez semble introuvable ou a été déplacée.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          component={Link}
          to={getRedirectPath()}
          sx={{ mt: 2 }}
        >
          Retour à la page d'accueil
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage; 