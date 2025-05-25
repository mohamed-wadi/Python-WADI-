import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  MenuBook as MenuBookIcon,
  Assessment as AssessmentIcon,
  EventNote as EventNoteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';

// Professor pages
import ProfessorDashboard from '../pages/professor/ProfessorDashboard';
import ProfessorStudents from '../pages/professor/ProfessorStudents';
import ProfessorNotes from '../pages/professor/ProfessorNotes';
import ProfessorBulletins from '../pages/professor/ProfessorBulletins';
import ProfessorCours from '../pages/professor/ProfessorCours';
import NotFoundPage from '../pages/NotFoundPage';

const ProfessorLayout = () => {
  const { profile } = useAuth();
  
  const menuItems = [
    {
      text: 'Tableau de bord',
      icon: <DashboardIcon />,
      path: '/professeur',
    },
    {
      text: 'Mes étudiants',
      icon: <PeopleIcon />,
      path: '/professeur/etudiants',
    },
    {
      text: 'Gestion des notes',
      icon: <EditIcon />,
      path: '/professeur/notes',
    },
    {
      text: 'Bulletins scolaires',
      icon: <AssessmentIcon />,
      path: '/professeur/bulletins',
    },
    {
      text: 'Mes cours',
      icon: <MenuBookIcon />,
      path: '/professeur/cours',
    },
    {
      text: 'Emploi du temps',
      icon: <EventNoteIcon />,
      path: '/professeur/emploi-du-temps',
    },
  ];
  
  const avatarText = profile?.prenom?.charAt(0) || 'P';
  
  return (
    <DashboardLayout 
      title="Espace Professeur" 
      menuItems={menuItems}
      avatarText={avatarText}
    >
      <Routes>
        <Route path="/" element={<ProfessorDashboard />} />
        <Route path="/etudiants" element={<ProfessorStudents />} />
        <Route path="/notes" element={<ProfessorNotes />} />
        <Route path="/bulletins" element={<ProfessorBulletins />} />
        <Route path="/cours" element={<ProfessorCours />} />
        <Route path="/emploi-du-temps" element={<ProfessorCours />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </DashboardLayout>
  );
};

export default ProfessorLayout; 