import React, { useState } from 'react';
import { Team, TeamMatch } from '../types';

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

  const handlePairingChange = (index: number, field: 'team1Id' | 'team2Id', value: string) => {
    const newPairings = [...editablePairings];
    newPairings[index] = { ...newPairings[index], [field]: value };
    setEditablePairings(newPairings);
  };

  const getAvailableTeams = (currentIndex: number, currentField: 'team1Id' | 'team2Id') => {
    const usedTeams = editablePairings
      .flatMap((pairing, index) => {
        if (index === currentIndex) {
          // For current pairing, exclude the other field
          const otherField = currentField === 'team1Id' ? 'team2Id' : 'team1Id';
          return pairing[otherField] ? [pairing[otherField]] : [];
        }
        return [pairing.team1Id, pairing.team2Id];
      })
      .filter(Boolean);

    return teams.filter(team => !usedTeams.includes(team.id));
  };

  const isValidPairing = () => {
    // Check if all pairings have both teams selected
    if (editablePairings.some(p => !p.team1Id || !p.team2Id)) {
      return false;
    }

    // Check if any team appears twice
    const allTeamIds = editablePairings.flatMap(p => [p.team1Id, p.team2Id]);
    const uniqueTeamIds = new Set(allTeamIds);
    
    return allTeamIds.length === uniqueTeamIds.size;
  };

  const handleSave = () => {
    if (!isValidPairing()) {
      alert('Please ensure all pairings are complete and no team appears twice.');
      return;
    }

    onSave(editablePairings.map(p => ({ team1Id: p.team1Id, team2Id: p.team2Id })));
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--spacing-8)',
        maxWidth: '800px',
        width: '90%',
        maxHeight: '90%',
        overflow: 'auto',
        boxShadow: 'var(--shadow-xl)'
      }}>
        <h3 style={{ 
          marginBottom: 'var(--spacing-6)',
          fontSize: 'var(--font-size-2xl)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-primary)',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--spacing-3)'
        }}>
          <span>✏️</span>
          Edit Team Pairings
        </h3>

        <div style={{ marginBottom: 'var(--spacing-6)' }}>
          {editablePairings.map((pairing, index) => (
            <div key={pairing.id} style={{
              background: 'linear-gradient(135deg, var(--color-neutral-50), white)',
              border: '1px solid var(--color-neutral-200)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--spacing-6)',
              marginBottom: 'var(--spacing-4)'
            }}>
              <h5 style={{ 
                marginBottom: 'var(--spacing-4)',
                color: 'var(--color-primary)',
                fontWeight: 'var(--font-weight-semibold)'
              }}>
                Match {index + 1}
              </h5>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr auto 1fr', 
                gap: 'var(--spacing-4)',
                alignItems: 'center'
              }}>
                <div>
                  <label className="form-label">Team 1:</label>
                  <select
                    value={pairing.team1Id}
                    onChange={(e) => handlePairingChange(index, 'team1Id', e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select Team</option>
                    {getAvailableTeams(index, 'team1Id').map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                    {/* Show currently selected team even if it would be filtered out */}
                    {pairing.team1Id && !getAvailableTeams(index, 'team1Id').some(t => t.id === pairing.team1Id) && (
                      <option value={pairing.team1Id}>
                        {teams.find(t => t.id === pairing.team1Id)?.name} (⚠️ Conflict)
                      </option>
                    )}
                  </select>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                  color: 'white',
                  padding: 'var(--spacing-2) var(--spacing-4)',
                  borderRadius: 'var(--radius-lg)',
                  fontWeight: 'var(--font-weight-bold)',
                  fontSize: 'var(--font-size-sm)'
                }}>
                  VS
                </div>

                <div>
                  <label className="form-label">Team 2:</label>
                  <select
                    value={pairing.team2Id}
                    onChange={(e) => handlePairingChange(index, 'team2Id', e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select Team</option>
                    {getAvailableTeams(index, 'team2Id').map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                    {/* Show currently selected team even if it would be filtered out */}
                    {pairing.team2Id && !getAvailableTeams(index, 'team2Id').some(t => t.id === pairing.team2Id) && (
                      <option value={pairing.team2Id}>
                        {teams.find(t => t.id === pairing.team2Id)?.name} (⚠️ Conflict)
                      </option>
                    )}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!isValidPairing() && (
          <div className="alert alert-warning" style={{ marginBottom: 'var(--spacing-6)' }}>
            <strong>⚠️ Warning:</strong> Please ensure all pairings are complete and no team appears in multiple matches.
          </div>
        )}

        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 'var(--spacing-4)',
          paddingTop: 'var(--spacing-6)',
          borderTop: '1px solid var(--color-neutral-200)'
        }}>
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-outline"
          >
            <span>❌</span>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn btn-primary"
            disabled={!isValidPairing()}
          >
            <span>💾</span>
            Save Pairings
          </button>
        </div>
      </div>
    </div>
  );
};

export default PairingEditor;