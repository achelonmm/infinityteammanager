import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import {
  Trophy,
  TrendingUp,
  LayoutDashboard,
  UserPlus,
  Users,
  Swords,
  User,
  LogOut,
  KeyRound,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import LoginForm from './LoginForm';
import styles from './Navigation.module.css';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const Navigation: React.FC = () => {
  const location = useLocation();
  const { checkAdminAccess, logout } = useAuth();
  const toast = useToast();
  const isAdmin = checkAdminAccess();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const publicNavItems: NavItem[] = [
    { path: '/rankings', label: 'Rankings', icon: <Trophy size={16} /> },
    { path: '/statistics', label: 'Statistics', icon: <TrendingUp size={16} /> },
  ];

  const adminNavItems: NavItem[] = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { path: '/registration', label: 'Register Team', icon: <UserPlus size={16} /> },
    { path: '/teams', label: 'Teams & Players', icon: <Users size={16} /> },
    { path: '/pairings', label: 'Pairings', icon: <Swords size={16} /> },
  ];

  const navItems = isAdmin ? [...adminNavItems, ...publicNavItems] : publicNavItems;

  const handleLogout = async () => {
    const confirmed = await toast.confirm('Are you sure you want to logout?');
    if (confirmed) {
      logout();
      toast.success('You have been logged out');
    }
  };

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  return (
    <>
      <nav className={styles.nav}>
        <div className={styles.container}>
          {/* Brand */}
          <span className={styles.brand}>
            <Swords size={24} />
            Infinity TM
          </span>

          {/* Desktop nav links */}
          <ul className={styles.navList}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={clsx(styles.navLink, isActive && styles.navLinkActive)}
                    {...(isActive ? { 'aria-current': 'page' as const } : {})}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Desktop auth section */}
          <div className={styles.authSection}>
            {isAdmin ? (
              <>
                <div className={styles.adminBadge}>
                  <User size={16} />
                  Admin
                </div>
                <button
                  onClick={handleLogout}
                  className={clsx(styles.authButton, styles.logoutButton)}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleLoginClick}
                className={clsx(styles.authButton, styles.loginButton)}
              >
                <KeyRound size={16} />
                <span>Admin Login</span>
              </button>
            )}
          </div>

          {/* Hamburger toggle (mobile only) */}
          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        <div
          id="mobile-nav"
          className={clsx(styles.mobileMenu, menuOpen && styles.mobileMenuOpen)}
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(styles.mobileNavLink, isActive && styles.mobileNavLinkActive)}
                {...(isActive ? { 'aria-current': 'page' as const } : {})}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className={styles.mobileDivider} />

          {isAdmin ? (
            <>
              <div className={styles.mobileAdminBadge}>
                <User size={16} />
                Admin
              </div>
              <button
                onClick={handleLogout}
                className={clsx(styles.mobileAuthButton, styles.mobileLogoutButton)}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleLoginClick}
              className={clsx(styles.mobileAuthButton, styles.mobileLoginButton)}
            >
              <KeyRound size={16} />
              <span>Admin Login</span>
            </button>
          )}
        </div>
      </nav>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginForm onClose={() => setShowLoginModal(false)} />
      )}
    </>
  );
};

export default Navigation;
