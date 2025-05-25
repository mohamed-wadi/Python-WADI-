import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import createAppTheme from './utils/theme';

// Layouts
import LoginLayout from './layouts/LoginLayout';
import StudentLayout from './layouts/StudentLayout';
import ProfessorLayout from './layouts/ProfessorLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected Route component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, role, loading } = useAuth();
  
  if (loading) return null;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && role !== requiredRole) {
    // Redirect to appropriate dashboard based on role
    if (role === 'etudiant') return <Navigate to="/etudiant" replace />;
    if (role === 'professeur') return <Navigate to="/professeur" replace />;
    if (role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function AppContent() {
  const { role } = useAuth();
  const theme = createAppTheme(role);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginLayout><LoginPage /></LoginLayout>} />
          
          {/* Protected routes - Student */}
          <Route path="/etudiant/*" element={
            <ProtectedRoute requiredRole="etudiant">
              <StudentLayout />
            </ProtectedRoute>
          } />
          
          {/* Protected routes - Professor */}
          <Route path="/professeur/*" element={
            <ProtectedRoute requiredRole="professeur">
              <ProfessorLayout />
            </ProtectedRoute>
          } />
          
          {/* Protected routes - Admin */}
          <Route path="/admin/*" element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          } />
          
          {/* Redirect root to login or dashboard based on auth status */}
          <Route path="/" element={
            <AuthRedirect />
          } />
          
          {/* Not found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

// Redirect based on auth status
const AuthRedirect = () => {
  const { user, role, loading } = useAuth();
  
  if (loading) return null;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (role === 'etudiant') return <Navigate to="/etudiant" replace />;
  if (role === 'professeur') return <Navigate to="/professeur" replace />;
  if (role === 'admin') return <Navigate to="/admin" replace />;
  
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App; 