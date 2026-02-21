import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (password: string) => boolean;
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

// Simple admin password - in production, this should be more secure
const ADMIN_PASSWORD = 'Nano2025'; // Change this to your preferred password

const AUTH_STORAGE_KEY = 'infinityTournamentAuth';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check for existing authentication on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        if (authData.isAdmin && authData.timestamp) {
          // Check if authentication is still valid (24 hours)
          const now = Date.now();
          const authTime = authData.timestamp;
          const isValid = (now - authTime) < (24 * 60 * 60 * 1000); // 24 hours
          
          if (isValid) {
            setIsAuthenticated(true);
            setIsAdmin(true);
          } else {
            localStorage.removeItem(AUTH_STORAGE_KEY);
          }
        }
      } catch (error) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }, []);

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setIsAdmin(true);
      
      // Save authentication state
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
        isAdmin: true,
        timestamp: Date.now()
      }));
      
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
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