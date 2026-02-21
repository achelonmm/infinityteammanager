import React, { useState } from 'react';
import { Shield, KeyRound, LogIn, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Modal from './Modal';
import styles from './LoginForm.module.css';

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
      <div className={styles.description}>
        Please enter the admin password to access tournament management features.
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle size={16} />
          <span><strong>Error:</strong> {error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>
            <KeyRound size={16} className={styles.fieldLabelIcon} />
            Admin Password:
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.passwordInput}
            placeholder="Enter admin password"
            disabled={isSubmitting}
            autoFocus
          />
        </div>

        <div className={styles.actions}>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={isSubmitting}
            >
              <X size={16} />
              Cancel
            </button>
          )}
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting || !password.trim()}
          >
            {isSubmitting ? (
              <>
                <div className={styles.spinner} />
                Verifying...
              </>
            ) : (
              <>
                <LogIn size={16} />
                Login
              </>
            )}
          </button>
        </div>
      </form>

      <div className={styles.note}>
        <strong>Note:</strong> Rankings and Statistics are publicly accessible without login.
      </div>
    </Modal>
  );
};

export default LoginForm;
