import React, { useState } from 'react';
import { Pencil, Tag, Crown, X, Save, AlertCircle } from 'lucide-react';
import { Team } from '../types';
import Modal from './Modal';
import styles from './EditTeamForm.module.css';

interface EditTeamFormProps {
  team: Team;
  onSave: (teamId: string, updates: { name: string; captainId: string; players?: any[] }) => void;
  onCancel: () => void;
}

const EditTeamForm: React.FC<EditTeamFormProps> = ({ team, onSave, onCancel }) => {
  const [teamName, setTeamName] = useState(team.name);
  const [captainId, setCaptainId] = useState(team.captainId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamName.trim()) {
      setError('Please enter a team name');
      return;
    }

    if (!captainId) {
      setError('Please select a captain');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const updatedPlayers = team.players.map(player => ({
        ...player,
        isCaptain: player.id === captainId
      }));

      await onSave(team.id, {
        name: teamName.trim(),
        captainId: captainId,
        players: updatedPlayers
      });
    } catch (err) {
      console.error('Error updating team:', err);
      setError('Error updating team. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title="Edit Team"
      titleIcon={<Pencil size={20} />}
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
            Team Name:
          </label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className={styles.input}
            placeholder="Enter team name"
            disabled={isSubmitting}
            autoFocus
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>
            <Crown size={16} className={styles.fieldLabelIcon} />
            Team Captain:
          </label>
          <select
            value={captainId}
            onChange={(e) => setCaptainId(e.target.value)}
            className={styles.input}
            disabled={isSubmitting}
          >
            <option value="">Select Captain</option>
            {team.players.map(player => (
              <option key={player.id} value={player.id}>
                {player.nickname} ({player.army})
              </option>
            ))}
          </select>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
            disabled={isSubmitting}
          >
            <X size={16} />
            Cancel
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting || !teamName.trim() || !captainId}
          >
            {isSubmitting ? (
              <>
                <div className={styles.spinner} />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditTeamForm;
