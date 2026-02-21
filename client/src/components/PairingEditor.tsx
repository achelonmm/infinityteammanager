import React, { useState } from 'react';
import { Pencil, AlertCircle, X, Save } from 'lucide-react';
import { Team, TeamMatch } from '../types';
import Modal from './Modal';
import styles from './PairingEditor.module.css';

interface PairingEditorProps {
  teams: Team[];
  currentPairings: TeamMatch[];
  onSave: (pairings: { team1Id: string; team2Id: string }[]) => void;
  onCancel: () => void;
}

const PairingEditor: React.FC<PairingEditorProps> = ({
  teams,
  currentPairings,
  onSave,
  onCancel
}) => {
  const [editablePairings, setEditablePairings] = useState(
    currentPairings.map(pairing => ({
      id: pairing.id,
      team1Id: pairing.team1Id,
      team2Id: pairing.team2Id
    }))
  );
  const [error, setError] = useState('');

  const handlePairingChange = (index: number, field: 'team1Id' | 'team2Id', value: string) => {
    const newPairings = [...editablePairings];
    newPairings[index] = { ...newPairings[index], [field]: value };
    setEditablePairings(newPairings);
    setError('');
  };

  const getAvailableTeams = (currentIndex: number, currentField: 'team1Id' | 'team2Id') => {
    const usedTeams = editablePairings
      .flatMap((pairing, index) => {
        if (index === currentIndex) {
          const otherField = currentField === 'team1Id' ? 'team2Id' : 'team1Id';
          return pairing[otherField] ? [pairing[otherField]] : [];
        }
        return [pairing.team1Id, pairing.team2Id];
      })
      .filter(Boolean);

    return teams.filter(team => !usedTeams.includes(team.id));
  };

  const isValidPairing = () => {
    if (editablePairings.some(p => !p.team1Id || !p.team2Id)) {
      return false;
    }

    const allTeamIds = editablePairings.flatMap(p => [p.team1Id, p.team2Id]);
    const uniqueTeamIds = new Set(allTeamIds);

    return allTeamIds.length === uniqueTeamIds.size;
  };

  const handleSave = () => {
    if (!isValidPairing()) {
      setError('Please ensure all pairings are complete and no team appears twice.');
      return;
    }

    onSave(editablePairings.map(p => ({ team1Id: p.team1Id, team2Id: p.team2Id })));
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title="Edit Pairings"
      titleIcon={<Pencil size={20} />}
      size="lg"
    >
      <div className={styles.pairingsList}>
        {editablePairings.map((pairing, index) => (
          <div key={pairing.id} className={styles.matchCard}>
            <h5 className={styles.matchTitle}>Match {index + 1}</h5>

            <div className={styles.matchGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Team 1:</label>
                <select
                  value={pairing.team1Id}
                  onChange={(e) => handlePairingChange(index, 'team1Id', e.target.value)}
                  className={styles.select}
                >
                  <option value="">Select Team</option>
                  {getAvailableTeams(index, 'team1Id').map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                  {pairing.team1Id && !getAvailableTeams(index, 'team1Id').some(t => t.id === pairing.team1Id) && (
                    <option value={pairing.team1Id}>
                      {teams.find(t => t.id === pairing.team1Id)?.name} (Conflict)
                    </option>
                  )}
                </select>
              </div>

              <div className={styles.vsBadge}>VS</div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Team 2:</label>
                <select
                  value={pairing.team2Id}
                  onChange={(e) => handlePairingChange(index, 'team2Id', e.target.value)}
                  className={styles.select}
                >
                  <option value="">Select Team</option>
                  {getAvailableTeams(index, 'team2Id').map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                  {pairing.team2Id && !getAvailableTeams(index, 'team2Id').some(t => t.id === pairing.team2Id) && (
                    <option value={pairing.team2Id}>
                      {teams.find(t => t.id === pairing.team2Id)?.name} (Conflict)
                    </option>
                  )}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(!isValidPairing() || error) && (
        <div className={styles.warningBanner}>
          <AlertCircle size={16} />
          <span>
            {error || 'Please ensure all pairings are complete and no team appears in multiple matches.'}
          </span>
        </div>
      )}

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
          type="button"
          onClick={handleSave}
          className={styles.submitButton}
          disabled={!isValidPairing()}
        >
          <Save size={16} />
          Save Pairings
        </button>
      </div>
    </Modal>
  );
};

export default PairingEditor;
