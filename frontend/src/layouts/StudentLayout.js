import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
  Assessment as AssessmentIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';

// Student pages
import StudentDashboard from '../pages/student/StudentDashboard';
import StudentNotes from '../pages/student/StudentNotes';
import StudentBulletins from '../pages/student/StudentBulletins';
import StudentCours from '../pages/student/StudentCours';
import NotFoundPage from '../pages/NotFoundPage';

const StudentLayout = () => {
  const { profile } = useAuth();
  
  const menuItems = [
    {
      text: 'Tableau de bord',
      icon: <DashboardIcon />,
      path: '/etudiant',
    },
    {
      text: 'Mes notes',
      icon: <AssessmentIcon />,
      path: '/etudiant/notes',
    },
    {
      text: 'Mes bulletins',
      icon: <SchoolIcon />,
      path: '/etudiant/bulletins',
    },
    {
      text: 'Emploi du temps',
      icon: <EventIcon />,
      path: '/etudiant/cours',
    },
    {
      text: 'Mes cours',
      icon: <MenuBookIcon />,
      path: '/etudiant/matieres',
    },
  ];
  
  const avatarText = profile?.prenom?.charAt(0) || 'E';
  
  return (
    <DashboardLayout 
      title="Espace Étudiant" 
      menuItems={menuItems}
      avatarText={avatarText}
    >
      <Routes>
        <Route path="/" element={<StudentDashboard />} />
        <Route path="/notes" element={<StudentNotes />} />
        <Route path="/bulletins" element={<StudentBulletins />} />
        <Route path="/cours" element={<StudentCours />} />
        <Route path="/matieres" element={<StudentCours />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </DashboardLayout>
  );
};

export default StudentLayout; 