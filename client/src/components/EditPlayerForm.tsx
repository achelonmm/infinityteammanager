import React, { useState } from 'react';
import { Pencil, Tag, Hash, Swords, Crown, Palette, AlertCircle, X, Save } from 'lucide-react';
import { Player, Team } from '../types';
import Modal from './Modal';
import clsx from 'clsx';
import styles from './EditPlayerForm.module.css';

interface EditPlayerFormProps {
  player: Player;
  team: Team;
  allTeams: Team[];
  onSave: (playerId: string, updates: Partial<Player>) => void;
  onCancel: () => void;
}

const EditPlayerForm: React.FC<EditPlayerFormProps> = ({
  player,
  team,
  allTeams,
  onSave,
  onCancel
}) => {
  const [nickname, setNickname] = useState(player.nickname);
  const [itsPin, setItsPin] = useState(player.itsPin);
  const [army, setArmy] = useState(player.army);
  const [isCaptain, setIsCaptain] = useState(player.isCaptain);
  const [isPainted, setIsPainted] = useState(player.isPainted);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const armies = [
    'PanOceania', 'Yu Jing', 'Ariadna', 'Haqqislam', 'Nomads', 'Combined Army',
    'Aleph', 'Tohaa', 'Non-Aligned Armies', 'O-12', 'Shasvastii'
  ];

  const getAvailableArmies = () => {
    const usedArmies = team.players
      .filter(p => p.id !== player.id)
      .map(p => p.army);

    return armies.filter(armyName => !usedArmies.includes(armyName));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nickname.trim()) {
      setError('Please enter a nickname');
      return;
    }

    if (!itsPin.trim()) {
      setError('Please enter an ITS Pin');
      return;
    }

    if (!army) {
      setError('Please select an army');
      return;
    }

    const availableArmies = getAvailableArmies();
    if (!availableArmies.includes(army) && army !== player.army) {
      setError('This army is already being used by another teammate. Please select a different army.');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave(player.id, {
        nickname: nickname.trim(),
        itsPin: itsPin.trim(),
        army,
        isCaptain,
        isPainted
      });
    } catch (err) {
      console.error('Error updating player:', err);
      setError('Error updating player. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableArmies = getAvailableArmies();

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title="Edit Player"
      titleIcon={<Pencil size={20} />}
      size="md"
    >
      <div className={styles.teamBanner}>
        <strong>Team:</strong> {team.name}
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fieldGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              <Tag size={16} className={styles.fieldLabelIcon} />
              Nickname:
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className={styles.input}
              placeholder="Player nickname"
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              <Hash size={16} className={styles.fieldLabelIcon} />
              ITS Pin:
            </label>
            <input
              type="text"
              value={itsPin}
              onChange={(e) => setItsPin(e.target.value)}
              className={styles.input}
              placeholder="ITS Pin number"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>
            <Swords size={16} className={styles.fieldLabelIcon} />
            Army/Sectorial:
            {availableArmies.length < armies.length && (
              <span className={styles.fieldHint}>
                (Some armies already selected by teammates)
              </span>
            )}
          </label>
          <select
            value={army}
            onChange={(e) => setArmy(e.target.value)}
            className={clsx(
              styles.input,
              army && !availableArmies.includes(army) && army !== player.army && styles.inputError
            )}
            disabled={isSubmitting}
          >
            <option value="">Select Army</option>
            {availableArmies.map(armyName => (
              <option key={armyName} value={armyName}>{armyName}</option>
            ))}
            {army && !availableArmies.includes(army) && army === player.army && (
              <option value={army}>{army} (Current)</option>
            )}
            {army && !availableArmies.includes(army) && army !== player.army && (
              <option value={army}>
                {army} (Already selected by teammate)
              </option>
            )}
          </select>
        </div>

        <div className={styles.toggleGrid}>
          <label className={clsx(styles.toggleCard, isCaptain && styles.toggleCardCaptain)}>
            <input
              type="checkbox"
              checked={isCaptain}
              onChange={(e) => setIsCaptain(e.target.checked)}
              disabled={isSubmitting}
              className={styles.checkbox}
            />
            <Crown size={20} className={styles.toggleIcon} />
            <span className={styles.toggleLabel}>Team Captain</span>
          </label>

          <label className={clsx(styles.toggleCard, isPainted && styles.toggleCardPainted)}>
            <input
              type="checkbox"
              checked={isPainted}
              onChange={(e) => setIsPainted(e.target.checked)}
              disabled={isSubmitting}
              className={styles.checkbox}
            />
            <Palette size={20} className={styles.toggleIcon} />
            <span className={styles.toggleLabel}>Painted Army</span>
          </label>
        </div>

        {army && !availableArmies.includes(army) && army !== player.army && (
          <div className={styles.warningBanner}>
            <AlertCircle size={16} />
            <span>
              <strong>Army Conflict:</strong> This army is already being used by another teammate.
              Please select a different army to avoid conflicts.
            </span>
          </div>
        )}

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
            disabled={isSubmitting || !nickname.trim() || !itsPin.trim() || !army}
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

export default EditPlayerForm;
