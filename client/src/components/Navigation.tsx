import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  ListTodo,
} from 'lucide-react';
import NanopulsersLogo from './NanopulsersLogo';
import {
  Group,
  Text,
  Badge,
  Button,
  UnstyledButton,
  Burger,
  Collapse,
  Divider,
  Box,
} from '@mantine/core';
import { useAuth } from '../contexts/AuthContext';
import { useTournamentData } from '../contexts/TournamentDataContext';
import { useToast } from '../contexts/ToastContext';
import LoginForm from './LoginForm';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const Navigation: React.FC = () => {
  const location = useLocation();
  const { checkAdminAccess, logout } = useAuth();
  const { tournament } = useTournamentData();
  const toast = useToast();
  const isAdmin = checkAdminAccess();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const publicNavItems: NavItem[] = [
    { path: '/pairings', label: 'Pairings', icon: <Swords size={16} /> },
    { path: '/rankings', label: 'Rankings', icon: <Trophy size={16} /> },
    { path: '/statistics', label: 'Statistics', icon: <TrendingUp size={16} /> },
  ];

  const adminNavItems: NavItem[] = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { path: '/tournaments', label: 'Tournaments', icon: <ListTodo size={16} /> },
    { path: '/registration', label: 'Register Team', icon: <UserPlus size={16} /> },
    { path: '/teams', label: 'Teams & Players', icon: <Users size={16} /> },
  ];

  const navItems = isAdmin ? [...adminNavItems, ...publicNavItems] : publicNavItems;

  const handleLogout = async () => {
    const confirmed = await toast.confirm('Are you sure you want to logout?');
    if (confirmed) {
      logout();
      toast.success('You have been logged out');
    }
  };

  return (
    <>
      <Box
        component="nav"
        style={{
          background: 'var(--mantine-color-dark-9)',
          borderBottom: '1px solid var(--mantine-color-dark-6)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Group
          h={56}
          px="md"
          justify="space-between"
          maw={1280}
          mx="auto"
          wrap="nowrap"
        >
          {/* Brand */}
          <Group gap="xs" style={{ flexShrink: 0 }}>
            <NanopulsersLogo size={28} />
            <Text fw={700} size="lg" c="white">Infinity TM</Text>
          </Group>

          {/* Desktop nav links */}
          <Group gap={4} visibleFrom="md">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <UnstyledButton
                  key={item.path}
                  component={Link}
                  to={item.path}
                  px="sm"
                  py={6}
                  style={{
                    borderRadius: 'var(--mantine-radius-sm)',
                    background: isActive ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                    borderBottom: isActive ? '2px solid var(--mantine-color-cyan-5)' : '2px solid transparent',
                  }}
                  {...(isActive ? { 'aria-current': 'page' as const } : {})}
                >
                  <Group gap={6}>
                    {item.icon}
                    <Text size="sm" c={isActive ? 'white' : 'dimmed'} fw={isActive ? 600 : 400}>
                      {item.label}
                    </Text>
                  </Group>
                </UnstyledButton>
              );
            })}
          </Group>

          {/* Desktop auth section */}
          <Group gap="xs" visibleFrom="md" style={{ flexShrink: 0 }}>
            {isAdmin ? (
              <>
                <Badge variant="light" color="cyan" leftSection={<User size={12} />}>
                  Admin
                </Badge>
                <Button
                  variant="subtle"
                  color="red"
                  size="xs"
                  leftSection={<LogOut size={14} />}
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                variant="subtle"
                size="xs"
                leftSection={<KeyRound size={14} />}
                onClick={() => setShowLoginModal(true)}
              >
                Admin Login
              </Button>
            )}
          </Group>

          {/* Mobile burger */}
          <Burger
            opened={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            hiddenFrom="md"
            size="sm"
            color="white"
          />
        </Group>

        {/* Active tournament bar */}
        {isAdmin && tournament && (
          <Box
            px="md"
            py={4}
            style={{
              background: 'rgba(6, 182, 212, 0.08)',
              borderTop: '1px solid var(--mantine-color-dark-6)',
            }}
          >
            <Group gap="xs" maw={1280} mx="auto">
              <Trophy size={14} color="var(--mantine-color-cyan-5)" />
              <Text size="xs" c="dimmed">Active Tournament:</Text>
              <Text size="xs" fw={600} c="cyan">{tournament.name}</Text>
            </Group>
          </Box>
        )}

        {/* Mobile dropdown menu */}
        <Collapse in={menuOpen}>
          <Box px="md" pb="md" hiddenFrom="md">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <UnstyledButton
                  key={item.path}
                  component={Link}
                  to={item.path}
                  display="flex"
                  w="100%"
                  py="xs"
                  px="sm"
                  mb={2}
                  style={{
                    borderRadius: 'var(--mantine-radius-sm)',
                    background: isActive ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                  }}
                  {...(isActive ? { 'aria-current': 'page' as const } : {})}
                >
                  <Group gap="xs">
                    {item.icon}
                    <Text size="sm" c={isActive ? 'white' : 'dimmed'} fw={isActive ? 600 : 400}>
                      {item.label}
                    </Text>
                  </Group>
                </UnstyledButton>
              );
            })}

            <Divider my="xs" />

            {isAdmin ? (
              <>
                <Badge variant="light" color="cyan" leftSection={<User size={12} />} mb="xs">
                  Admin
                </Badge>
                <Button
                  variant="subtle"
                  color="red"
                  size="sm"
                  fullWidth
                  leftSection={<LogOut size={14} />}
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                variant="subtle"
                size="sm"
                fullWidth
                leftSection={<KeyRound size={14} />}
                onClick={() => setShowLoginModal(true)}
              >
                Admin Login
              </Button>
            )}
          </Box>
        </Collapse>
      </Box>

      {showLoginModal && (
        <LoginForm onClose={() => setShowLoginModal(false)} />
      )}
    </>
  );
};

export default Navigation;
