import React, { useState } from 'react';
import { Swords, AlertCircle, X, Save } from 'lucide-react';
import { Team } from '../types';
import Modal from './Modal';
import styles from './IndividualPairingsForm.module.css';

interface IndividualPairingsFormProps {
  teamMatch: any; // TeamMatch
  team1: Team;
  team2: Team;
  onSave: (pairings: { player1Id: string; player2Id: string }[]) => void;
  onCancel: () => void;
}

const IndividualPairingsForm: React.FC<IndividualPairingsFormProps> = ({
  teamMatch,
  team1,
  team2,
  onSave,
  onCancel
}) => {
  const [pairings, setPairings] = useState<{ player1Id: string; player2Id: string }[]>([
    { player1Id: '', player2Id: '' },
    { player1Id: '', player2Id: '' },
    { player1Id: '', player2Id: '' }
  ]);
  const [error, setError] = useState('');

  const handlePairingChange = (index: number, field: 'player1Id' | 'player2Id', value: string) => {
    const newPairings = [...pairings];
    newPairings[index] = { ...newPairings[index], [field]: value };
    setPairings(newPairings);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (pairings.some(p => !p.player1Id || !p.player2Id)) {
      setError('Please select players for all three matches');
      return;
    }

    const usedTeam1Players = pairings.map(p => p.player1Id);
    const usedTeam2Players = pairings.map(p => p.player2Id);

    if (new Set(usedTeam1Players).size !== 3 || new Set(usedTeam2Players).size !== 3) {
      setError('Each player can only be assigned to one match');
      return;
    }

    onSave(pairings);
  };

  const getAvailableTeam1Players = (currentIndex: number) => {
    const usedPlayers = pairings
      .map((p, index) => index !== currentIndex ? p.player1Id : null)
      .filter(Boolean);
    return team1.players.filter(player => !usedPlayers.includes(player.id));
  };

  const getAvailableTeam2Players = (currentIndex: number) => {
    const usedPlayers = pairings
      .map((p, index) => index !== currentIndex ? p.player2Id : null)
      .filter(Boolean);
    return team2.players.filter(player => !usedPlayers.includes(player.id));
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title="Set Individual Pairings"
      titleIcon={<Swords size={20} />}
      size="lg"
    >
      <div className={styles.matchupHeader}>
        {team1.name} vs {team2.name}
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        {pairings.map((pairing, index) => (
          <div key={index} className={styles.matchCard}>
            <h5 className={styles.matchTitle}>Match {index + 1}</h5>

            <div className={styles.matchGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  {team1.name} Player:
                </label>
                <select
                  value={pairing.player1Id}
                  onChange={(e) => handlePairingChange(index, 'player1Id', e.target.value)}
                  className={styles.select}
                >
                  <option value="">Select Player</option>
                  {getAvailableTeam1Players(index).map(player => (
                    <option key={player.id} value={player.id}>
                      {player.nickname} ({player.army})
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.vsBadge}>VS</div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  {team2.name} Player:
                </label>
                <select
                  value={pairing.player2Id}
                  onChange={(e) => handlePairingChange(index, 'player2Id', e.target.value)}
                  className={styles.select}
                >
                  <option value="">Select Player</option>
                  {getAvailableTeam2Players(index).map(player => (
                    <option key={player.id} value={player.id}>
                      {player.nickname} ({player.army})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}

        <div className={styles.actions}>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
          >
            <X size={16} />
            Cancel
          </button>
          <button
            type="submit"
            className={styles.submitButton}
          >
            <Save size={16} />
            Save Pairings
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default IndividualPairingsForm;
