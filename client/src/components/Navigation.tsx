import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from './LoginForm';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { checkAdminAccess, logout } = useAuth();
  const isAdmin = checkAdminAccess();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const publicNavItems = [
    { path: '/rankings', label: 'Rankings', icon: '🏆' },
    { path: '/statistics', label: 'Statistics', icon: '📈' },
  ];

  const adminNavItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/registration', label: 'Register Team', icon: '➕' },
    { path: '/teams', label: 'Teams & Players', icon: '👥' },
    { path: '/pairings', label: 'Pairings', icon: '⚔️' },
  ];

  const navItems = isAdmin ? [...adminNavItems, ...publicNavItems] : publicNavItems;

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      setToast('Goodbye! You have been logged out.');
      setTimeout(() => setToast(null), 3000);

      // Redirect to rankings page
      window.location.href = '/rankings';
    }
  };

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const navStyle = {
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
    boxShadow: 'var(--shadow-lg)',
    borderBottom: '1px solid var(--color-primary-dark)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
    backdropFilter: 'blur(10px)',
  };

  const containerStyle = {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 var(--spacing-4)',
  };

  const navListStyle = {
    display: 'flex',
    gap: 'var(--spacing-2)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 'var(--spacing-4) 0',
    flexWrap: 'wrap' as const,
  };

  const getLinkStyle = (isActive: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3) var(--spacing-4)',
    color: isActive ? 'white' : 'rgba(255, 255, 255, 0.8)',
    textDecoration: 'none',
    borderRadius: 'var(--radius-lg)',
    fontWeight: isActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
    fontSize: 'var(--font-size-sm)',
    background: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
    border: isActive ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
    transition: 'all var(--transition-fast)',
    position: 'relative' as const,
    overflow: 'hidden',
    minHeight: '44px',
    backdropFilter: isActive ? 'blur(10px)' : 'none',
  });

  const getButtonStyle = () => ({
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3) var(--spacing-4)',
    color: 'rgba(255, 255, 255, 0.9)',
    background: 'rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: 'var(--radius-lg)',
    fontWeight: 'var(--font-weight-medium)',
    fontSize: 'var(--font-size-sm)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    minHeight: '44px',
    fontFamily: 'inherit',
  });

  const iconStyle = {
    fontSize: 'var(--font-size-lg)',
    filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))',
  };

  return (
    <>
      {toast && (
        <div className="alert alert-success" style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1001,
        }}>
          <strong>👋 {toast}</strong>
        </div>
      )}
      <nav style={navStyle}>
        <div style={containerStyle}>
          <div style={navListStyle}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={getLinkStyle(isActive)}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <span style={iconStyle}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            {/* Authentication Section */}
            <div style={{
              height: '30px',
              width: '1px',
              background: 'rgba(255, 255, 255, 0.3)',
              margin: '0 var(--spacing-2)'
            }} />
            
            {isAdmin ? (
              <>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-2)',
                  padding: 'var(--spacing-2) var(--spacing-4)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 'var(--font-weight-medium)'
                }}>
                  <span>👤</span>
                  Admin
                </div>
                
                <button
                  onClick={handleLogout}
                  style={getButtonStyle()}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <span style={iconStyle}>🚪</span>
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleLoginClick}
                style={{
                  ...getButtonStyle(),
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  color: 'white',
                  fontWeight: 'var(--font-weight-semibold)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span style={iconStyle}>🔑</span>
                <span>Admin Login</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginForm 
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </>
  );
};

export default Navigation;