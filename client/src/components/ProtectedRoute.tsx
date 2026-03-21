import React, { useState } from 'react';
import { Lock, KeyRound, BarChart3 } from 'lucide-react';
import { Container, Paper, Stack, Title, Text, Button, Group, Center, ThemeIcon } from '@mantine/core';
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
      <Container size="sm" py="xl">
        <Paper p="xl" radius="md" withBorder>
          <Stack align="center" gap="md">
            <ThemeIcon size={64} radius="xl" variant="light" color="cyan">
              <Lock size={32} />
            </ThemeIcon>
            <Title order={2}>Admin Access Required</Title>
            <Text c="dimmed" ta="center">
              This page requires admin authentication to access tournament management features.
            </Text>
            <Group>
              <Button
                onClick={() => setShowLogin(true)}
                leftSection={<KeyRound size={18} />}
              >
                Admin Login
              </Button>
              <Button
                component="a"
                href="/rankings"
                variant="default"
                leftSection={<BarChart3 size={18} />}
              >
                View Rankings
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
