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
  AccountCircle as AccountCircleIcon,
  Edit as EditIcon,
  Assessment as AssessmentIcon,
  Sync as SyncIcon,
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
import AdminProfile from '../pages/admin/AdminProfile';
import AdminNotes from '../pages/admin/AdminNotes';
import AdminBulletins from '../pages/admin/AdminBulletins';
import AdminSync from '../pages/admin/AdminSync';
import NotFoundPage from '../pages/NotFoundPage';

const AdminLayout = () => {
  const { user, role } = useAuth();
  console.log('AdminLayout - current role:', role);
  console.log('AdminLayout - current path:', window.location.pathname);
  
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
      text: 'Notes',
      icon: <EditIcon />,
      path: '/admin/notes',
    },
    {
      text: 'Bulletins',
      icon: <AssessmentIcon />,
      path: '/admin/bulletins',
    },
    {
      text: 'Mon Profil',
      icon: <AccountCircleIcon />,
      path: '/admin/profil',
    },
    {
      text: 'Paramètres',
      icon: <SettingsIcon />,
      path: '/admin/parametres',
    },
    {
      text: 'Synchronisation',
      icon: <SyncIcon />,
      path: '/admin/sync',
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
        <Route path="/notes" element={<AdminNotes />} />
        <Route path="/bulletins" element={<AdminBulletins />} />
        <Route path="/profil" element={<AdminProfile />} />
        <Route path="/parametres" element={<AdminSettings />} />
        <Route path="/sync" element={<AdminSync />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </DashboardLayout>
  );
};

export default AdminLayout; 