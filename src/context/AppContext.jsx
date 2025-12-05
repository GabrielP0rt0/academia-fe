import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load students - memoized to prevent infinite loops
  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.students.list();
      setStudents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load classes - memoized to prevent infinite loops
  const loadClasses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.classes.list();
      setClasses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add student to cache
  const addStudent = (student) => {
    setStudents((prev) => [...prev, student]);
  };

  // Update student in cache
  const updateStudent = (updatedStudent) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );
  };

  // Add class to cache
  const addClass = (newClass) => {
    setClasses((prev) => [...prev, newClass]);
  };

  // Load initial data and reload when token changes
  useEffect(() => {
    const checkAndLoadData = () => {
      const token = localStorage.getItem('token');
      if (token) {
        loadStudents();
        loadClasses();
      } else {
        // Clear data when token is removed
        setStudents([]);
        setClasses([]);
      }
    };

    // Load data on mount
    checkAndLoadData();

    // Listen for storage changes (e.g., when token is set after login)
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        checkAndLoadData();
      }
    };

    // Listen for custom event when login happens
    const handleLogin = () => {
      checkAndLoadData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogin', handleLogin);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleLogin);
    };
  }, [loadStudents, loadClasses]);

  const value = {
    students,
    classes,
    loading,
    error,
    loadStudents,
    loadClasses,
    addStudent,
    updateStudent,
    addClass,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

