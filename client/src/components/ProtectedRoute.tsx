import React, { useState } from 'react';
import { Lock, KeyRound, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from './LoginForm';
import styles from './ProtectedRoute.module.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback
}) => {
  const { checkAdminAccess } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  if (!checkAdminAccess()) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showLogin) {
      return (
        <LoginForm
          onClose={() => {
            setShowLogin(false);
            window.location.href = '/rankings';
          }}
        />
      );
    }

    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.iconWrapper}>
            <Lock size={40} />
          </div>
          <h2 className={styles.title}>Admin Access Required</h2>
          <p className={styles.description}>
            This page requires admin authentication to access tournament management features.
          </p>
          <div className={styles.actions}>
            <button
              onClick={() => setShowLogin(true)}
              className={styles.loginButton}
            >
              <KeyRound size={18} />
              Admin Login
            </button>
            <a
              href="/rankings"
              className={styles.rankingsLink}
            >
              <BarChart3 size={18} />
              View Rankings
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
