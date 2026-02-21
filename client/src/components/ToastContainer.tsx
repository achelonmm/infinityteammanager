import React from 'react';
import ReactDOM from 'react-dom';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import clsx from 'clsx';
import styles from './ToastContainer.module.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  createdAt: number;
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={18} />,
  error: <AlertCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  info: <Info size={18} />,
};

const typeClasses: Record<ToastType, string> = {
  success: styles.toastSuccess,
  error: styles.toastError,
  warning: styles.toastWarning,
  info: styles.toastInfo,
};

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return ReactDOM.createPortal(
    <div className={styles.container} aria-live="polite" role="status">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={clsx(styles.toast, typeClasses[toast.type])}
        >
          <span className={styles.toastIcon}>{iconMap[toast.type]}</span>
          <span className={styles.toastMessage}>{toast.message}</span>
          <button
            className={styles.dismissButton}
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ animationDuration: `${toast.duration}ms` }}
            />
          </div>
        </div>
      ))}
    </div>,
    document.body
  );
};

export default ToastContainer;
