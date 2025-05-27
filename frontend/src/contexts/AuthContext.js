import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Configuration d'axios pour l'authentification
const authApi = axios.create({
  baseURL: 'http://localhost:8001/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        setLoading(true);
        const response = await authApi.get('/auth/user/');
        
        if (response.status === 200) {
          setUser(response.data.user);
          setProfile(response.data.profile);
          setRole(response.data.role);
        }
      } catch (err) {
        // User is not logged in, that's okay
        setUser(null);
        setProfile(null);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Tentative de connexion avec:', { username, password });
      
      // Accès direct pour l'utilisateur admin (mode développement)
      if (username.toLowerCase() === 'admin') {
        console.log('Mode développement: accès automatique pour admin');
        
        // Créer un utilisateur factice pour le mode développement
        const mockUser = {
          id: 1,
          username: 'admin',
          email: 'admin@gmail.com',
          first_name: 'Admin',
          last_name: 'User',
          is_staff: true,
          is_superuser: true
        };
        
        setUser(mockUser);
        setProfile(null); // Pas de profil spécifique nécessaire
        setRole('admin');
        
        return true;
      }
      
      // Connexion normale pour les autres utilisateurs
      const response = await authApi.post('/auth/login/', {
        username,
        password
      });
      
      console.log('Réponse de connexion:', response.data);
      
      setUser(response.data.user);
      setProfile(response.data.profile);
      setRole(response.data.role);
      
      return true;
    } catch (err) {
      console.error('Erreur de connexion:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Login failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authApi.post('/auth/logout/');
      
      setUser(null);
      setProfile(null);
      setRole(null);
      return true;
    } catch (err) {
      console.error('Logout error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
    role,
    loading,
    error,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 