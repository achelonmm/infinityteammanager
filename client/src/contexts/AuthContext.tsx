import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { apiService, setToken, clearToken, hasToken, isTokenValid } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  checkAdminAccess: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isTokenValid()) {
      setIsAuthenticated(true);
      setIsAdmin(true);
    } else if (hasToken()) {
      // Token exists but is expired — clean it up
      clearToken();
    }
  }, []);

  const login = async (password: string): Promise<boolean> => {
    try {
      const { token } = await apiService.login(password);
      setToken(token);
      setIsAuthenticated(true);
      setIsAdmin(true);
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    clearToken();
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  const checkAdminAccess = (): boolean => {
    return isAuthenticated && isAdmin;
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isAdmin,
      login,
      logout,
      checkAdminAccess
    }}>
      {children}
    </AuthContext.Provider>
  );
};
