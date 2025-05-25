import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  EventNote as EventNoteIcon,
} from '@mui/icons-material';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminStudents from '../pages/admin/AdminStudents';
import AdminProfessors from '../pages/admin/AdminProfessors';
import AdminClasses from '../pages/admin/AdminClasses';
import AdminSubjects from '../pages/admin/AdminSubjects';
import AdminTimetable from '../pages/admin/AdminTimetable';
import AdminSettings from '../pages/admin/AdminSettings';
import NotFoundPage from '../pages/NotFoundPage';

const AdminLayout = () => {
  const { user } = useAuth();
  
  const menuItems = [
    {
      text: 'Tableau de bord',
      icon: <DashboardIcon />,
      path: '/admin',
    },
    {
      text: 'Étudiants',
      icon: <PeopleIcon />,
      path: '/admin/etudiants',
    },
    {
      text: 'Professeurs',
      icon: <PersonIcon />,
      path: '/admin/professeurs',
    },
    {
      text: 'Classes',
      icon: <SchoolIcon />,
      path: '/admin/classes',
    },
    {
      text: 'Matières',
      icon: <MenuBookIcon />,
      path: '/admin/matieres',
    },
    {
      text: 'Emploi du temps',
      icon: <EventNoteIcon />,
      path: '/admin/emploi-du-temps',
    },
    {
      text: 'Paramètres',
      icon: <SettingsIcon />,
      path: '/admin/parametres',
    },
  ];
  
  const avatarText = user?.username?.charAt(0).toUpperCase() || 'A';
  
  return (
    <DashboardLayout 
      title="Espace Administration" 
      menuItems={menuItems}
      avatarText={avatarText}
    >
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/etudiants" element={<AdminStudents />} />
        <Route path="/professeurs" element={<AdminProfessors />} />
        <Route path="/classes" element={<AdminClasses />} />
        <Route path="/matieres" element={<AdminSubjects />} />
        <Route path="/emploi-du-temps" element={<AdminTimetable />} />
        <Route path="/parametres" element={<AdminSettings />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </DashboardLayout>
  );
};

export default AdminLayout; 