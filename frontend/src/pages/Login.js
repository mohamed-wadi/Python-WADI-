import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Avatar,
  Alert,
  CircularProgress
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SchoolIcon from '@mui/icons-material/School';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100
    }
  }
};

const logoVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      duration: 0.8,
      bounce: 0.4
    }
  }
};

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <Container component="main" maxWidth="lg">
      <Grid container spacing={2} sx={{ minHeight: '100vh', alignItems: 'center' }}>
        {/* Left side - Login Form */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={6} 
            sx={{ 
              p: 4, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              borderRadius: 3
            }}
            component={motion.div}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={logoVariants}>
              <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
                <LockOutlinedIcon fontSize="large" />
              </Avatar>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Typography component="h1" variant="h4" sx={{ mt: 2, fontWeight: 'bold' }}>
                Connexion
              </Typography>
            </motion.div>
            
            {error && (
              <motion.div variants={itemVariants}>
                <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                  {error}
                </Alert>
              </motion.div>
            )}
            
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
              <motion.div variants={itemVariants}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Nom d'utilisateur"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Mot de passe"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Se connecter'}
                </Button>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Box sx={{ textAlign: 'center', mt: 1 }}>
                  <Typography
                    component="a"
                    href="http://localhost:8002/reset-admin-password/"
                    variant="body2"
                    sx={{ 
                      color: 'primary.main', 
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      } 
                    }}
                  >
                    Mot de passe oublié ?
                  </Typography>
                </Box>
              </motion.div>
            </Box>
          </Paper>
        </Grid>
        
        {/* Right side - Logo and info */}
        <Grid item xs={12} md={6}>
          <Box
            component={motion.div}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              px: 4
            }}
          >
            <SchoolIcon sx={{ fontSize: 100, color: 'primary.main', mb: 2 }} />
            <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
              Système de Gestion d'École
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, textAlign: 'center', color: 'text.secondary' }}>
              La plateforme intégrée pour la gestion efficace de votre établissement scolaire
            </Typography>
            
            <Box
              component={motion.div}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
              sx={{ 
                p: 3, 
                bgcolor: 'rgba(25, 118, 210, 0.05)', 
                borderRadius: 3,
                border: '1px solid rgba(25, 118, 210, 0.2)',
                maxWidth: 450
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Connectez-vous pour accéder à:
              </Typography>
              <Typography variant="body1" component="div">
                <ul>
                  <li>Gestion des étudiants et professeurs</li>
                  <li>Suivi des notes et bulletins</li>
                  <li>Gestion des emplois du temps</li>
                  <li>Tableaux de bord personnalisés</li>
                </ul>
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Login; 