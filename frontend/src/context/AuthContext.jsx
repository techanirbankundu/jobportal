import { createContext, useContext, useState, useEffect } from 'react';
import { getUser, isAuthenticated, saveUser } from '../utils/token';
import { login as loginApi, register as registerApi, logout as logoutApi } from '../services/authApi';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    if (isAuthenticated()) {
      const userData = getUser();
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const response = await loginApi(credentials);
    setUser(response.user);
    return response;
  };

  const register = async (userData) => {
    const response = await registerApi(userData);
    setUser(response.user);
    return response;
  };

  const logout = () => {
    logoutApi();
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    saveUser(userData);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

