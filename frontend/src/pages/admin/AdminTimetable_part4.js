    
    {/* Formulaire d'ajout/modification */}
    <Dialog open={openForm} onClose={handleCloseForm} maxWidth="md" fullWidth>
      <DialogTitle>
        {formType === 'add' ? 'Ajouter un cours' : 'Modifier un cours'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={Boolean(formErrors.matiere)}>
              <InputLabel id="matiere-label">Matière</InputLabel>
              <Select
                labelId="matiere-label"
                name="matiere"
                value={formData.matiere}
                onChange={handleInputChange}
                label="Matière"
              >
                {matieres.map(matiere => (
                  <MenuItem key={matiere.id} value={matiere.id.toString()}>
                    {matiere.nom}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.matiere && <Typography color="error" variant="caption">{formErrors.matiere}</Typography>}
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={Boolean(formErrors.professeur)}>
              <InputLabel id="professeur-label">Professeur</InputLabel>
              <Select
                labelId="professeur-label"
                name="professeur"
                value={formData.professeur}
                onChange={handleInputChange}
                label="Professeur"
              >
                {professeurs.map(prof => (
                  <MenuItem key={prof.id} value={prof.id.toString()}>
                    {prof.prenom} {prof.nom}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.professeur && <Typography color="error" variant="caption">{formErrors.professeur}</Typography>}
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={Boolean(formErrors.classe)}>
              <InputLabel id="classe-label">Classe</InputLabel>
              <Select
                labelId="classe-label"
                name="classe"
                value={formData.classe}
                onChange={handleInputChange}
                label="Classe"
                disabled={viewMode === 'classe'} // Désactiver si on est en mode vue par classe
              >
                {classes.map(classe => (
                  <MenuItem key={classe.id} value={classe.id.toString()}>
                    {classe.nom}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.classe && <Typography color="error" variant="caption">{formErrors.classe}</Typography>}
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={Boolean(formErrors.jour)}>
              <InputLabel id="jour-label">Jour</InputLabel>
              <Select
                labelId="jour-label"
                name="jour"
                value={formData.jour}
                onChange={handleInputChange}
                label="Jour"
              >
                {JOURS.map(jour => (
                  <MenuItem key={jour} value={jour}>
                    {jour}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.jour && <Typography color="error" variant="caption">{formErrors.jour}</Typography>}
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={Boolean(formErrors.heure_debut)}>
              <InputLabel id="heure-debut-label">Heure de début</InputLabel>
              <Select
                labelId="heure-debut-label"
                name="heure_debut"
                value={formData.heure_debut}
                onChange={handleInputChange}
                label="Heure de début"
              >
                {HEURES.map(heure => (
                  <MenuItem key={heure.value} value={heure.value}>
                    {heure.label}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.heure_debut && <Typography color="error" variant="caption">{formErrors.heure_debut}</Typography>}
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={Boolean(formErrors.heure_fin)}>
              <InputLabel id="heure-fin-label">Heure de fin</InputLabel>
              <Select
                labelId="heure-fin-label"
                name="heure_fin"
                value={formData.heure_fin}
                onChange={handleInputChange}
                label="Heure de fin"
              >
                {HEURES.map(heure => (
                  <MenuItem key={heure.value} value={heure.value}>
                    {heure.label}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.heure_fin && <Typography color="error" variant="caption">{formErrors.heure_fin}</Typography>}
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Salle"
              name="salle"
              value={formData.salle}
              onChange={handleInputChange}
              error={Boolean(formErrors.salle)}
              helperText={formErrors.salle}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseForm} color="inherit">
          Annuler
        </Button>
        <Button onClick={handleSubmitForm} color="primary" variant="contained">
          {formType === 'add' ? 'Ajouter' : 'Modifier'}
        </Button>
      </DialogActions>
    </Dialog>
    
    {/* Dialogue de confirmation de suppression */}
    <Dialog open={openConfirm} onClose={handleCancelDelete}>
      <DialogTitle>Confirmer la suppression</DialogTitle>
      <DialogContent>
        <Typography>
          Êtes-vous sûr de vouloir supprimer ce cours ?
          {coursToDelete && (
            <Box component="span" sx={{ fontWeight: 'bold', display: 'block', mt: 1 }}>
              {coursToDelete.matiere_nom} - {coursToDelete.jour} {coursToDelete.heure_debut} à {coursToDelete.heure_fin}
            </Box>
          )}
          Cette action est irréversible.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancelDelete} color="inherit">
          Annuler
        </Button>
        <Button onClick={handleConfirmDelete} color="error" variant="contained">
          Supprimer
        </Button>
      </DialogActions>
    </Dialog>
    
    {/* Snackbar pour les notifications */}
    <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={handleCloseSnackbar}>
      <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
        {snackbar.message}
      </Alert>
    </Snackbar>
  </Box>
);
};

export default AdminTimetable;
