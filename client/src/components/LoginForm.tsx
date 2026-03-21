import React, { useState } from 'react';
import { Shield, LogIn } from 'lucide-react';
import { PasswordInput, Button, Group, Stack, Text, Alert } from '@mantine/core';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Modal from './Modal';

interface LoginFormProps {
  onClose?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onClose }) => {
  const { login } = useAuth();
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      setError('Please enter the admin password');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const success = await login(password);

      if (success) {
        setPassword('');
        toast.success('Welcome! You are now logged in as admin.');
        if (onClose) onClose();
      } else {
        setError('Invalid admin password. Please try again.');
        setPassword('');
      }
    } catch {
      setError('Failed to connect to server. Please try again.');
      setPassword('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (onClose) onClose();
  };

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title="Admin Access"
      titleIcon={<Shield size={20} />}
      size="sm"
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Please enter the admin password to access tournament management features.
        </Text>

        {error && (
          <Alert color="red" variant="light" title="Error">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <PasswordInput
              label="Admin Password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              disabled={isSubmitting}
              autoFocus
            />

            <Group justify="flex-end" gap="sm">
              {onClose && (
                <Button variant="default" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={!password.trim()}
                leftSection={<LogIn size={16} />}
              >
                Login
              </Button>
            </Group>
          </Stack>
        </form>

        <Text size="xs" c="dimmed">
          <strong>Note:</strong> Rankings and Statistics are publicly accessible without login.
        </Text>
      </Stack>
    </Modal>
  );
};

export default LoginForm;
