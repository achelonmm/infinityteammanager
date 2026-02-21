import React, { createContext, useContext, useReducer, useCallback, useState } from 'react';
import ToastContainer, { Toast, ToastType } from '../components/ToastContainer';
import ConfirmDialog from '../components/ConfirmDialog';

interface ToastContextValue {
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  confirm: (message: string, options?: { confirmLabel?: string; cancelLabel?: string; variant?: 'warning' | 'danger' }) => Promise<boolean>;
}

type ToastAction =
  | { type: 'ADD'; payload: Toast }
  | { type: 'REMOVE'; payload: string };

function toastReducer(state: Toast[], action: ToastAction): Toast[] {
  switch (action.type) {
    case 'ADD':
      return [...state, action.payload];
    case 'REMOVE':
      return state.filter((t) => t.id !== action.payload);
    default:
      return state;
  }
}

const ToastContext = createContext<ToastContextValue | null>(null);

let idCounter = 0;

interface ConfirmState {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'warning' | 'danger';
  resolve: (value: boolean) => void;
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, dispatch] = useReducer(toastReducer, []);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const addToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = `toast-${++idCounter}`;
    dispatch({ type: 'ADD', payload: { id, message, type, duration, createdAt: Date.now() } });
    setTimeout(() => dispatch({ type: 'REMOVE', payload: id }), duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    dispatch({ type: 'REMOVE', payload: id });
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
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      {confirmState && (
        <ConfirmDialog
          message={confirmState.message}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          confirmLabel={confirmState.confirmLabel}
          cancelLabel={confirmState.cancelLabel}
          variant={confirmState.variant}
        />
      )}
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
