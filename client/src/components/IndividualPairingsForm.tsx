import React, { useState } from 'react';
import { Team } from '../types';

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

  const handlePairingChange = (index: number, field: 'player1Id' | 'player2Id', value: string) => {
    const newPairings = [...pairings];
    newPairings[index] = { ...newPairings[index], [field]: value };
    setPairings(newPairings);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (pairings.some(p => !p.player1Id || !p.player2Id)) {
      alert('Please select players for all three matches');
      return;
    }

    // Check for duplicate players
    const usedTeam1Players = pairings.map(p => p.player1Id);
    const usedTeam2Players = pairings.map(p => p.player2Id);

    if (new Set(usedTeam1Players).size !== 3 || new Set(usedTeam2Players).size !== 3) {
      alert('Each player can only be assigned to one match');
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

  const inputStyle = {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    background: 'white'
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
        borderRadius: '8px',
        padding: '2rem',
        maxWidth: '700px',
        width: '90%',
        maxHeight: '90%',
        overflow: 'auto'
      }}>
        <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          Set Individual Player Pairings
        </h3>
        <h4 style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#1a237e' }}>
          {team1.name} vs {team2.name}
        </h4>

        <form onSubmit={handleSubmit}>
          {pairings.map((pairing, index) => (
            <div key={index} style={{
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '1rem',
              marginBottom: '1rem',
              background: '#f9f9f9'
            }}>
              <h5 style={{ marginBottom: '1rem' }}>Match {index + 1}</h5>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', alignItems: 'center' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    {team1.name} Player:
                  </label>
                  <select
                    value={pairing.player1Id}
                    onChange={(e) => handlePairingChange(index, 'player1Id', e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Select Player</option>
                    {getAvailableTeam1Players(index).map(player => (
                      <option key={player.id} value={player.id}>
                        {player.nickname} ({player.army})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{
                  background: '#1a237e',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}>
                  VS
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    {team2.name} Player:
                  </label>
                  <select
                    value={pairing.player2Id}
                    onChange={(e) => handlePairingChange(index, 'player2Id', e.target.value)}
                    style={inputStyle}
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

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                background: 'white',
                marginRight: '1rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '4px',
                background: '#1a237e',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Save Pairings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IndividualPairingsForm;