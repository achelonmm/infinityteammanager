import React, { useState } from 'react';
import { Player, Team } from '../types';

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

  const armies = [
    'PanOceania', 'Yu Jing', 'Ariadna', 'Haqqislam', 'Nomads', 'Combined Army',
    'Aleph', 'Tohaa', 'Non-Aligned Armies', 'O-12', 'Shasvastii'
  ];

  // Get armies already used by other players in the same team
  const getAvailableArmies = () => {
    const usedArmies = team.players
      .filter(p => p.id !== player.id) // Exclude current player
      .map(p => p.army);
    
    return armies.filter(armyName => !usedArmies.includes(armyName));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nickname.trim()) {
      alert('Please enter a nickname');
      return;
    }

    if (!itsPin.trim()) {
      alert('Please enter an ITS Pin');
      return;
    }

    if (!army) {
      alert('Please select an army');
      return;
    }

    // Check for army conflicts within the team
    const availableArmies = getAvailableArmies();
    if (!availableArmies.includes(army) && army !== player.army) {
      alert('This army is already being used by another teammate. Please select a different army.');
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
    } catch (error) {
      console.error('Error updating player:', error);
      alert('Error updating player. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableArmies = getAvailableArmies();

  return (
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
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90%',
        overflow: 'auto',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--color-neutral-200)'
      }}>
        <h3 style={{
          fontSize: 'var(--font-size-2xl)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-primary)',
          marginBottom: 'var(--spacing-6)',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--spacing-3)'
        }}>
          <span>✏️</span>
          Edit Player
        </h3>

        <div style={{
          background: 'linear-gradient(135deg, var(--color-neutral-50), white)',
          border: '1px solid var(--color-neutral-200)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-4)',
          marginBottom: 'var(--spacing-6)',
          textAlign: 'center'
        }}>
          <strong>Team:</strong> {team.name}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--spacing-4)',
            marginBottom: 'var(--spacing-4)'
          }}>
            <div className="form-group">
              <label className="form-label">
                <span>🏷️</span> Nickname:
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="form-input"
                placeholder="Player nickname"
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>🆔</span> ITS Pin:
              </label>
              <input
                type="text"
                value={itsPin}
                onChange={(e) => setItsPin(e.target.value)}
                className="form-input"
                placeholder="ITS Pin number"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>⚔️</span> Army/Sectorial:
              {availableArmies.length < armies.length && (
                <span style={{ 
                  marginLeft: 'var(--spacing-2)', 
                  fontSize: 'var(--font-size-xs)', 
                  color: 'var(--color-neutral-600)' 
                }}>
                  (Some armies already selected by teammates)
                </span>
              )}
            </label>
            <select
              value={army}
              onChange={(e) => setArmy(e.target.value)}
              className="form-input"
              disabled={isSubmitting}
              style={{
                borderColor: army && !availableArmies.includes(army) && army !== player.army ? 
                  'var(--color-error)' : undefined
              }}
            >
              <option value="">Select Army</option>
              {availableArmies.map(armyName => (
                <option key={armyName} value={armyName}>{armyName}</option>
              ))}
              {/* Show current army even if it would now be unavailable */}
              {army && !availableArmies.includes(army) && army === player.army && (
                <option value={army}>{army} (Current)</option>
              )}
              {/* Show selected army with conflict warning */}
              {army && !availableArmies.includes(army) && army !== player.army && (
                <option value={army} style={{ color: 'red' }}>
                  {army} (⚠️ Already selected by teammate)
                </option>
              )}
            </select>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--spacing-4)',
            marginBottom: 'var(--spacing-6)'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-3)',
              cursor: 'pointer',
              padding: 'var(--spacing-4)',
              borderRadius: 'var(--radius-lg)',
              background: isCaptain ? 
                'linear-gradient(135deg, var(--color-warning-light), var(--color-warning))' : 
                'var(--color-neutral-50)',
              border: `2px solid ${isCaptain ? 'var(--color-warning)' : 'var(--color-neutral-200)'}`,
              transition: 'all var(--transition-fast)',
              color: isCaptain ? 'white' : 'inherit'
            }}>
              <input
                type="checkbox"
                checked={isCaptain}
                onChange={(e) => setIsCaptain(e.target.checked)}
                disabled={isSubmitting}
                style={{ transform: 'scale(1.2)' }}
              />
              <span style={{ fontSize: 'var(--font-size-lg)' }}>👑</span>
              <span style={{ fontWeight: 'var(--font-weight-medium)' }}>
                Team Captain
              </span>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-3)',
              cursor: 'pointer',
              padding: 'var(--spacing-4)',
              borderRadius: 'var(--radius-lg)',
              background: isPainted ? 
                'linear-gradient(135deg, var(--color-success-light), var(--color-success))' : 
                'var(--color-neutral-50)',
              border: `2px solid ${isPainted ? 'var(--color-success)' : 'var(--color-neutral-200)'}`,
              transition: 'all var(--transition-fast)',
              color: isPainted ? 'white' : 'inherit'
            }}>
              <input
                type="checkbox"
                checked={isPainted}
                onChange={(e) => setIsPainted(e.target.checked)}
                disabled={isSubmitting}
                style={{ transform: 'scale(1.2)' }}
              />
              <span style={{ fontSize: 'var(--font-size-lg)' }}>🎨</span>
              <span style={{ fontWeight: 'var(--font-weight-medium)' }}>
                Painted Army
              </span>
            </label>
          </div>

          {army && !availableArmies.includes(army) && army !== player.army && (
            <div className="alert alert-warning" style={{ marginBottom: 'var(--spacing-6)' }}>
              <strong>⚠️ Army Conflict:</strong> This army is already being used by another teammate. 
              Please select a different army to avoid conflicts.
            </div>
          )}

          <div style={{
            display: 'flex',
            gap: 'var(--spacing-4)',
            justifyContent: 'center',
            paddingTop: 'var(--spacing-6)',
            borderTop: '1px solid var(--color-neutral-200)'
          }}>
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-outline"
              disabled={isSubmitting}
            >
              <span>❌</span>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !nickname.trim() || !itsPin.trim() || !army}
            >
              {isSubmitting ? (
                <>
                  <div className="loading-spinner"></div>
                  Saving...
                </>
              ) : (
                <>
                  <span>💾</span>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPlayerForm;