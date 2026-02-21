import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from './LoginForm';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback 
}) => {
  const { checkAdminAccess } = useAuth();
  const [showLogin, setShowLogin] = useState(!checkAdminAccess());

  if (!checkAdminAccess()) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    if (showLogin) {
      return (
        <LoginForm 
          onClose={() => {
            setShowLogin(false);
            // Redirect to public page
            window.location.href = '/rankings';
          }} 
        />
      );
    }

    return (
      <div className="container" style={{ textAlign: 'center', padding: 'var(--spacing-12)' }}>
        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--spacing-8)',
          maxWidth: '500px',
          margin: '0 auto',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--color-neutral-200)'
        }}>
          <div style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--spacing-4)' }}>
            🔒
          </div>
          <h2 style={{
            color: 'var(--color-primary)',
            marginBottom: 'var(--spacing-4)',
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-bold)'
          }}>
            Admin Access Required
          </h2>
          <p style={{
            color: 'var(--color-neutral-600)',
            marginBottom: 'var(--spacing-6)',
            fontSize: 'var(--font-size-lg)'
          }}>
            This page requires admin authentication to access tournament management features.
          </p>
          <div style={{ display: 'flex', gap: 'var(--spacing-4)', justifyContent: 'center' }}>
            <button
              onClick={() => setShowLogin(true)}
              className="btn btn-primary"
              style={{
                fontSize: 'var(--font-size-lg)',
                padding: 'var(--spacing-4) var(--spacing-8)'
              }}
            >
              <span>🔑</span>
              Admin Login
            </button>
            <a
              href="/rankings"
              className="btn btn-secondary"
              style={{
                fontSize: 'var(--font-size-lg)',
                padding: 'var(--spacing-4) var(--spacing-8)'
              }}
            >
              <span>📊</span>
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