import React, { useState } from 'react';
import { Button, Box, Typography, CircularProgress, Alert, Snackbar, Paper, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Sync as SyncIcon, CheckCircle, Error as ErrorIcon, Info as InfoIcon } from '@mui/icons-material';
import { syncAllData, updateSyncTimestamp } from '../utils/syncService';

const SyncManager = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const handleSync = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      const syncResults = await syncAllData();
      setResults(syncResults);
      
      // Vérifier si toutes les synchronisations ont réussi
      const allSuccess = Object.values(syncResults).every(result => result.success);
      
      if (allSuccess) {
        // Mettre à jour le timestamp de synchronisation si tout a réussi
        updateSyncTimestamp();
        showSnackbar('Synchronisation réussie avec le serveur Django', 'success');
      } else {
        showSnackbar('Certaines données n\'ont pas pu être synchronisées', 'warning');
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de la synchronisation');
      showSnackbar('Erreur lors de la synchronisation', 'error');
    } finally {
      setLoading(false);
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

  // Formater les résultats pour l'affichage
  const renderResults = () => {
    if (!results) return null;
    
    return (
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6" gutterBottom>Résultats de la synchronisation</Typography>
        <List>
          {Object.entries(results).map(([key, result]) => (
            <ListItem key={key}>
              <ListItemIcon>
                {result.success ? <CheckCircle color="success" /> : <ErrorIcon color="error" />}
              </ListItemIcon>
              <ListItemText 
                primary={`${key.charAt(0).toUpperCase() + key.slice(1)}`} 
                secondary={result.success ? 'Synchronisation réussie' : (result.message || 'Échec de la synchronisation')}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    );
  };

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h5" gutterBottom>
        Synchronisation avec le serveur Django
      </Typography>
      <Typography variant="body1" paragraph sx={{ mb: 2 }}>
        Cette fonctionnalité vous permet d'envoyer toutes les données stockées localement vers le serveur Django. 
        Assurez-vous que le serveur est en cours d'exécution avant de lancer la synchronisation.
      </Typography>
      
      <Button
        variant="contained"
        color="primary"
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SyncIcon />}
        onClick={handleSync}
        disabled={loading}
      >
        {loading ? 'Synchronisation en cours...' : 'Synchroniser avec le serveur Django'}
      </Button>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      
      {renderResults()}
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SyncManager;
