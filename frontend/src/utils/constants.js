// Définition des niveaux d'ingénieur
export const NIVEAUX_INGENIEUR = [
  { id: 1, nom: "1ère année", code: "ING1" },
  { id: 2, nom: "2ème année", code: "ING2" },
  { id: 3, nom: "3ème année", code: "ING3" },
  { id: 4, nom: "4ème année", code: "ING4" },
  { id: 5, nom: "5ème année", code: "ING5" }
];

// Définition des niveaux d'ingénieur (nouvelle version)
// export const NIVEAUX_INGENIEUR = [
//   'Classe Préparatoire 1',
//   'Classe Préparatoire 2',
//   'Ingénieur 1ère Année',
//   'Ingénieur 2ème Année',
//   'Ingénieur 3ème Année',
// ];

export const FILIERES_CHOICES = [
  { value: 'IIR', label: 'Ingénierie Informatique & Réseaux' },
  { value: 'GESI', label: 'Génie Électrique et Systèmes Intelligents' },
  { value: 'GCBTP', label: 'Génie Civil, Bâtiments et Travaux Publics' },
  { value: 'GI', label: 'Génie Industriel' },
  { value: 'GF', label: 'Génie Financier' },
];

// Options pour le type d'évaluation
export const TYPES_EVALUATION = [
  "Examen", 
  "Contrôle", 
  "TP", 
  "Projet", 
  "Oral"
];

// Trimestres de l'année scolaire
export const TRIMESTRES = [
  { id: 1, nom: "1er trimestre" },
  { id: 2, nom: "2ème trimestre" },
  { id: 3, nom: "3ème trimestre" }
];

// Jours de la semaine pour l'emploi du temps
export const JOURS_SEMAINE = [
  'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
];

// Heures de la journée (8h à 18h)
export const HEURES_JOURNEE = Array.from({ length: 11 }, (_, i) => ({
  label: `${i + 8}:00`,
  value: `${(i + 8).toString().padStart(2, '0')}:00:00`
}));
