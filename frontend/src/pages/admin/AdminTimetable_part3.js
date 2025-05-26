const renderTimetable = () => {
  return (
    <Paper sx={{ p: 2 }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Jour</TableCell>
              <TableCell>Heure</TableCell>
              <TableCell>Matière</TableCell>
              {viewMode === 'classe' && <TableCell>Professeur</TableCell>}
              {viewMode === 'professeur' && <TableCell>Classe</TableCell>}
              <TableCell>Salle</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCours.length > 0 ? (
              filteredCours.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.jour}</TableCell>
                  <TableCell>{c.heure_debut} - {c.heure_fin}</TableCell>
                  <TableCell>{c.matiere_nom}</TableCell>
                  {viewMode === 'classe' && <TableCell>{c.professeur_nom}</TableCell>}
                  {viewMode === 'professeur' && <TableCell>{c.classe_nom}</TableCell>}
                  <TableCell>{c.salle}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleOpenForm('edit', c)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDeleteClick(c)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Aucun cours trouvé
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

// Fonction utilitaires pour récupérer les noms à partir des IDs
const getMatiereNom = (id) => {
  const matiere = matieres.find(m => m.id === id);
  return matiere ? matiere.nom : `Matière #${id}`;
};

const getProfesseurNom = (id) => {
  const prof = professeurs.find(p => p.id === id);
  return prof ? `${prof.prenom} ${prof.nom}` : `Professeur #${id}`;
};

const getClasseNom = (id) => {
  const classe = classes.find(c => c.id === id);
  return classe ? classe.nom : `Classe #${id}`;
};

return (
  <Box sx={{ p: 2 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
        Gestion des emplois du temps
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        startIcon={<AddIcon />}
        onClick={() => handleOpenForm('add')}
      >
        Ajouter un cours
      </Button>
    </Box>
    
    <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 2 }}>
      <Tab label="Vue par classe" />
      <Tab label="Vue par professeur" />
    </Tabs>
    
    <Box sx={{ mb: 3 }}>
      <FormControl fullWidth>
        <InputLabel id="entity-select-label">
          {viewMode === 'classe' ? 'Sélectionner une classe' : 'Sélectionner un professeur'}
        </InputLabel>
        <Select
          labelId="entity-select-label"
          value={selectedEntity}
          label={viewMode === 'classe' ? 'Sélectionner une classe' : 'Sélectionner un professeur'}
          onChange={handleEntityChange}
        >
          {viewMode === 'classe' ? (
            classes.map(classe => (
              <MenuItem key={classe.id} value={classe.id.toString()}>
                {classe.nom} ({classe.niveau})
              </MenuItem>
            ))
          ) : (
            professeurs.map(prof => (
              <MenuItem key={prof.id} value={prof.id.toString()}>
                {prof.prenom} {prof.nom} ({prof.specialite})
              </MenuItem>
            ))
          )}
        </Select>
      </FormControl>
    </Box>
    
    {loading ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    ) : (
      renderTimetable()
    )}
