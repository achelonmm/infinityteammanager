import React, { useState } from 'react';
import { Trophy, Tag, Save, AlertCircle } from 'lucide-react';
import { TournamentSummary } from '../types';
import Modal from './Modal';
import styles from './TournamentForm.module.css';

interface TournamentFormProps {
  tournament?: TournamentSummary;
  onSave: (name: string) => Promise<void>;
  onCancel: () => void;
}

const TournamentForm: React.FC<TournamentFormProps> = ({ tournament, onSave, onCancel }) => {
  const [name, setName] = useState(tournament?.name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!tournament;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please enter a tournament name');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSave(name.trim());
    } catch (err) {
      if (err instanceof Error && err.message.includes('already exists')) {
        setError('A tournament with this name already exists');
      } else {
        setError(isEditing ? 'Error updating tournament. Please try again.' : 'Error creating tournament. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title={isEditing ? 'Edit Tournament' : 'New Tournament'}
      titleIcon={<Trophy size={20} />}
      size="sm"
    >
      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>
            <Tag size={16} className={styles.fieldLabelIcon} />
            Tournament Name:
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
            placeholder="Enter tournament name..."
            disabled={isSubmitting}
            autoFocus
            maxLength={200}
          />
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting || !name.trim()}
          >
            {isSubmitting ? (
              <>
                <div className={styles.spinner} />
                {isEditing ? 'Saving...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save size={16} />
                {isEditing ? 'Save Changes' : 'Create Tournament'}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TournamentForm;
