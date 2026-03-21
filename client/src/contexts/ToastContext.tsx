import React, { createContext, useContext, useCallback, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { Modal, Button, Group, Stack, Text } from '@mantine/core';
import { AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

const toastColorMap: Record<ToastType, string> = {
  success: 'teal',
  error: 'red',
  warning: 'yellow',
  info: 'cyan',
};

interface ToastContextValue {
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  confirm: (message: string, options?: { confirmLabel?: string; cancelLabel?: string; variant?: 'warning' | 'danger' }) => Promise<boolean>;
}

const ToastContext = createContext<ToastContextValue | null>(null);

interface ConfirmState {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'warning' | 'danger';
  resolve: (value: boolean) => void;
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const addToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    notifications.show({
      message,
      color: toastColorMap[type],
      autoClose: duration,
    });
  }, []);

  const confirm = useCallback((
    message: string,
    options?: { confirmLabel?: string; cancelLabel?: string; variant?: 'warning' | 'danger' }
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        message,
        confirmLabel: options?.confirmLabel,
        cancelLabel: options?.cancelLabel,
        variant: options?.variant,
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    confirmState?.resolve(true);
    setConfirmState(null);
  }, [confirmState]);

  const handleCancel = useCallback(() => {
    confirmState?.resolve(false);
    setConfirmState(null);
  }, [confirmState]);

  const value: ToastContextValue = {
    addToast,
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    warning: (msg) => addToast(msg, 'warning'),
    info: (msg) => addToast(msg, 'info'),
    confirm,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Modal
        opened={!!confirmState}
        onClose={handleCancel}
        title={
          <Group gap="xs">
            <AlertTriangle size={20} color={confirmState?.variant === 'danger' ? 'var(--mantine-color-red-6)' : 'var(--mantine-color-yellow-6)'} />
            <Text fw={600}>Confirm</Text>
          </Group>
        }
        centered
        size="sm"
      >
        <Stack gap="lg">
          <Text>{confirmState?.message}</Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={handleCancel}>
              {confirmState?.cancelLabel ?? 'Cancel'}
            </Button>
            <Button
              color={confirmState?.variant === 'danger' ? 'red' : 'cyan'}
              onClick={handleConfirm}
            >
              {confirmState?.confirmLabel ?? 'Confirm'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
