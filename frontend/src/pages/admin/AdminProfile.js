import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Box,
  Button,
  Grid,
  TextField,
  Avatar,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import { PhotoCamera, Save } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const AdminProfile = () => {
  const { user, profile } = useAuth();
  console.log('AdminProfile rendered with:', { user, profile });
  
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Initialiser le formulaire avec les données de l'utilisateur
  useEffect(() => {
    console.log('AdminProfile useEffect - user:', user);
    console.log('AdminProfile useEffect - profile:', profile);
    
    // Utiliser des valeurs par défaut si nécessaire
    const nom = user?.last_name || 'Admin';
    const prenom = user?.first_name || 'Super';
    const email = user?.email || 'admin@example.com';
    
    setFormData({
      nom: nom,
      prenom: prenom,
      email: email,
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    // Récupérer l'image du profil depuis localStorage si elle existe
    try {
      const savedImage = localStorage.getItem('user_profile_image');
      if (savedImage) {
        console.log('Image de profil récupérée depuis localStorage');
        setPreviewImage(savedImage);
        
        // Mettre à jour les avatars existants dans l'interface
        setTimeout(() => {
          const avatarElements = document.querySelectorAll('.MuiAvatar-root');
          avatarElements.forEach(avatar => {
            if (avatar.tagName === 'DIV') {
              // Remplacer le texte par l'image
              avatar.innerHTML = '';
              avatar.style.backgroundImage = `url(${savedImage})`;
              avatar.style.backgroundSize = 'cover';
            }
          });
        }, 500);
      } else {
        // Image de profil par défaut
        setPreviewImage('https://via.placeholder.com/150');
      }
    } catch (e) {
      console.error('Erreur lors de la récupération de l\'image depuis localStorage:', e);
      // Image de profil par défaut en cas d'erreur
      setPreviewImage('https://via.placeholder.com/150');
    }
  }, [user, profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Effacer l'erreur pour ce champ si elle existe
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Créer un aperçu de l'image
      const reader = new FileReader();
      reader.onload = () => {
        const imageDataUrl = reader.result;
        setPreviewImage(imageDataUrl);
        
        // Sauvegarder l'image dans localStorage pour la rendre persistante
        try {
          localStorage.setItem('user_profile_image', imageDataUrl);
          console.log('Image de profil sauvegardée dans localStorage');
          
          // Mettre à jour l'avatar dans l'en-tête
          const avatarElements = document.querySelectorAll('.MuiAvatar-root');
          avatarElements.forEach(avatar => {
            if (avatar.tagName === 'DIV') {
              // Remplacer le texte par l'image
              avatar.innerHTML = '';
              avatar.style.backgroundImage = `url(${imageDataUrl})`;
              avatar.style.backgroundSize = 'cover';
            }
          });
        } catch (e) {
          console.error('Erreur lors de la sauvegarde de l\'image dans localStorage:', e);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validation des champs obligatoires
    if (!formData.nom) newErrors.nom = 'Le nom est requis';
    if (!formData.prenom) newErrors.prenom = 'Le prénom est requis';
    if (!formData.email) newErrors.email = 'L\'email est requis';
    
    // Validation du mot de passe uniquement si l'utilisateur essaie de le changer
    if (formData.oldPassword || formData.newPassword || formData.confirmPassword) {
      if (!formData.oldPassword) newErrors.oldPassword = 'L\'ancien mot de passe est requis';
      if (!formData.newPassword) newErrors.newPassword = 'Le nouveau mot de passe est requis';
      if (!formData.confirmPassword) newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
      
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
      
      if (formData.newPassword && formData.newPassword.length < 8) {
        newErrors.newPassword = 'Le mot de passe doit contenir au moins 8 caractères';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      
      // Préparation des données à envoyer
      const formDataToSend = new FormData();
      formDataToSend.append('nom', formData.nom);
      formDataToSend.append('prenom', formData.prenom);
      formDataToSend.append('email', formData.email);
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }
      
      if (formData.oldPassword && formData.newPassword) {
        formDataToSend.append('old_password', formData.oldPassword);
        formDataToSend.append('new_password', formData.newPassword);
      }
      
      // Simuler la mise à jour du profil
      console.log('Données à envoyer:', Object.fromEntries(formDataToSend));
      
      // Simuler un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Enregistrer dans localStorage pour persistance
      try {
        const userProfile = {
          ...profile,
          nom: formData.nom,
          prenom: formData.prenom,
          image: previewImage
        };
        localStorage.setItem('user_profile', JSON.stringify(userProfile));
      } catch (e) {
        console.error('Erreur lors de la sauvegarde du profil dans localStorage:', e);
      }
      
      showSnackbar('Profil mis à jour avec succès', 'success');
      
      // Réinitialiser les champs de mot de passe
      setFormData({
        ...formData,
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      showSnackbar('Erreur lors de la mise à jour du profil', 'error');
    } finally {
      setSaving(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };



  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Mon Profil
      </Typography>
      
      <Paper sx={{ p: 3, mt: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Section image de profil */}
            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                src={previewImage}
                sx={{ width: 150, height: 150, mb: 2 }}
                alt={`${formData.prenom} ${formData.nom}`}
              />
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCamera />}
                sx={{ mt: 2 }}
              >
                Changer l'image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
            </Grid>
            
            {/* Section informations personnelles */}
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Informations personnelles
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    error={Boolean(errors.nom)}
                    helperText={errors.nom}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Prénom"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleInputChange}
                    error={Boolean(errors.prenom)}
                    helperText={errors.prenom}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={Boolean(errors.email)}
                    helperText={errors.email}
                    required
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                Changer le mot de passe
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Ancien mot de passe"
                    name="oldPassword"
                    type="password"
                    value={formData.oldPassword}
                    onChange={handleInputChange}
                    error={Boolean(errors.oldPassword)}
                    helperText={errors.oldPassword}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nouveau mot de passe"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    error={Boolean(errors.newPassword)}
                    helperText={errors.newPassword}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirmer le mot de passe"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    error={Boolean(errors.confirmPassword)}
                    helperText={errors.confirmPassword}
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<Save />}
                  disabled={saving}
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminProfile;
