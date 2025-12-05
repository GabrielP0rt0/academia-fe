import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

/**
 * Custom hook for authentication management
 */
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.auth.login({ email, password });
      localStorage.setItem('token', response.token);
      setIsAuthenticated(true);
      // Dispatch custom event to notify AppContext to reload data
      window.dispatchEvent(new Event('userLogin'));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return {
    isAuthenticated,
    loading,
    login,
    logout,
  };
}

