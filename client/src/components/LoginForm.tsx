import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LoginFormProps {
  onClose?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onClose }) => {
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

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
        showToast('Welcome! You are now logged in as admin.');
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

  return (
    <>
    {toast && (
      <div className="alert alert-success" style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1001,
      }}>
        <strong>🔓 {toast}</strong>
      </div>
    )}
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--spacing-8)',
        maxWidth: '400px',
        width: '90%',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--color-neutral-200)',
        position: 'relative'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: 'var(--spacing-6)'
        }}>
          <div style={{
            fontSize: 'var(--font-size-4xl)',
            marginBottom: 'var(--spacing-4)'
          }}>
            🔐
          </div>
          <h3 style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-primary)',
            marginBottom: 'var(--spacing-2)'
          }}>
            Admin Access Required
          </h3>
          <p style={{
            color: 'var(--color-neutral-600)',
            fontSize: 'var(--font-size-base)'
          }}>
            Please enter the admin password to access tournament management features.
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-4)' }}>
            <strong>⚠️ Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <span>🔑</span> Admin Password:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Enter admin password"
              disabled={isSubmitting}
              autoFocus
              style={{
                fontSize: 'var(--font-size-lg)',
                padding: 'var(--spacing-4)'
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            gap: 'var(--spacing-4)',
            justifyContent: 'center',
            marginTop: 'var(--spacing-6)'
          }}>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline"
                disabled={isSubmitting}
              >
                <span>❌</span>
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !password.trim()}
              style={{
                fontSize: 'var(--font-size-lg)',
                padding: 'var(--spacing-4) var(--spacing-8)'
              }}
            >
              {isSubmitting ? (
                <>
                  <div className="loading-spinner"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <span>🚀</span>
                  Login
                </>
              )}
            </button>
          </div>
        </form>

        <div style={{
          marginTop: 'var(--spacing-6)',
          padding: 'var(--spacing-4)',
          background: 'var(--color-neutral-50)',
          borderRadius: 'var(--radius-lg)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-neutral-600)',
          textAlign: 'center'
        }}>
          <strong>Note:</strong> Rankings and Statistics are publicly accessible without login.
        </div>
      </div>
    </div>
    </>
  );
};

export default LoginForm;