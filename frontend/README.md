# Gestion École - Frontend

Interface React pour le système de gestion d'école. Ce projet utilise React avec Material UI pour fournir une interface utilisateur moderne et responsive pour les différents utilisateurs du système (étudiants, professeurs, administrateurs).

## Technologies utilisées

- React 18
- Material UI 5
- React Router v6
- Chart.js pour les visualisations
- Axios pour les requêtes API
- Framer Motion pour les animations

## Structure du projet

```
src/
  ├── components/       # Composants réutilisables
  ├── contexts/         # Contextes React (auth, etc.)
  ├── layouts/          # Layouts pour différents types d'utilisateurs
  ├── pages/            # Pages de l'application
  │   ├── admin/        # Pages pour les administrateurs
  │   ├── professor/    # Pages pour les professeurs
  │   ├── student/      # Pages pour les étudiants
  ├── utils/            # Utilitaires et services (API, etc.)
  ├── App.js            # Composant principal
  └── index.js          # Point d'entrée
```

## Installation

1. Assurez-vous d'avoir Node.js (v14 ou supérieur) installé
2. Clonez ce dépôt
3. Installez les dépendances:

```
cd frontend
npm install
```

## Exécution en développement

```
npm start
```

L'application sera disponible sur http://localhost:3000

## Construction pour la production

```
npm run build
```

## Communication avec le backend

L'application communique avec le backend Django via les API REST. La configuration proxy dans package.json permet de rediriger les requêtes API vers le serveur Django pendant le développement.

## Fonctionnalités par type d'utilisateur

### Étudiants

- Tableau de bord avec statistiques
- Consultation des notes
- Consultation des bulletins
- Visualisation de l'emploi du temps

### Professeurs

- Tableau de bord avec statistiques de classe
- Gestion des notes
- Génération des bulletins
- Gestion des cours

### Administrateurs

- Tableau de bord complet
- Gestion des utilisateurs
- Gestion des classes
- Gestion des matières
- Gestion de l'emploi du temps

## Authentification

L'authentification utilise les sessions Django. L'application React gère l'état de connexion via le contexte AuthContext. 