# Gestion École

Un système complet de gestion scolaire avec Django et React.

## Architecture du projet

Le projet est divisé en deux parties principales:

1. **Backend (Django)** - API REST et application serveur
2. **Frontend (React)** - Interface utilisateur moderne

## Fonctionnalités

- Authentification avec différents rôles (étudiant, professeur, administrateur)
- Gestion des étudiants, professeurs, classes et matières
- Gestion des notes et génération des bulletins
- Emploi du temps et suivi des absences
- Tableaux de bord spécifiques pour chaque type d'utilisateur
- API REST pour l'intégration avec le frontend React

## Installation et configuration

### Prérequis
- Python 3.8+
- Node.js 14+
- MySQL

### Configuration de la base de données

```sql
CREATE DATABASE gestion_ecole CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Backend (Django)

1. Installer les dépendances Python :
```bash
pip install -r requirements.txt
```

2. Configurer la base de données dans `backend/settings.py`

3. Appliquer les migrations :
```bash
cd backend
python manage.py migrate
```

4. Créer les utilisateurs initiaux :
```bash
python manage.py shell < create_users.py
```

5. Lancer le serveur Django :
```bash
python manage.py runserver
```

### Frontend (React)

1. Installer les dépendances Javascript :
```bash
cd frontend
npm install
```

2. Lancer le serveur de développement React :
```bash
npm start
```

L'application sera disponible sur http://localhost:3000

## Comptes utilisateurs par défaut

### Administrateur
- Nom d'utilisateur: admin
- Mot de passe: admin123

### Professeur
- Nom d'utilisateur: professeur
- Mot de passe: prof123

### Étudiant
- Nom d'utilisateur: etudiant
- Mot de passe: etudiant123

## Structure du projet

```
project/
  ├── backend/               # Application Django
  │   ├── base/              # Application principale
  │   │   ├── api_serializers.py  # Sérialiseurs pour l'API REST
  │   │   ├── api_views.py        # Vues pour l'API REST
  │   │   ├── api_urls.py         # URLs pour l'API REST
  │   │   ├── models.py      # Modèles de données
  │   │   ├── views.py       # Vues Django traditionnelles
  │   │   ├── templates/     # Templates HTML
  │   │   ├── static/        # Fichiers statiques
  │   │   ├── auth_views.py    # Vues d'authentification
  │   │   ├── dashboard_views.py # Tableaux de bord
  │   │   ├── professor_views.py # Vues spécifiques aux professeurs
  │   │   ├── urls.py        # URLs du projet
  │
  ├── frontend/              # Application React
  │   ├── public/            # Fichiers publics
  │   ├── src/               # Code source React
  │   │   ├── components/    # Composants réutilisables
  │   │   ├── contexts/      # Contextes React
  │   │   ├── layouts/       # Layouts pour différents rôles
  │   │   ├── pages/         # Pages de l'application
  │   │   ├── utils/         # Utilitaires et services
  │   │   ├── App.js         # Composant principal
  │   │   ├── index.js       # Point d'entrée
  │
  ├── requirements.txt       # Dépendances Python
  └── README.md              # Documentation
```

## Déploiement

### Backend
Pour le déploiement en production, utilisez un serveur WSGI comme Gunicorn et un serveur web comme Nginx.

### Frontend
Pour le déploiement du frontend, construisez l'application React avec `npm run build` et servez les fichiers statiques générés avec Nginx ou un service d'hébergement statique.

## Technologies utilisées

- Django 5.2
- MySQL
- Bootstrap 5
- HTML/CSS/JavaScript

## Captures d'écran

*(Captures d'écran à venir)*

## Contribuer

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails. 