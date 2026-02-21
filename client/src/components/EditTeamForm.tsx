import React, { useState } from 'react';
import { Team } from '../types';

interface EditTeamFormProps {
    team: Team;
    onSave: (teamId: string, updates: { name: string; captainId: string; players?: any[] }) => void;
    onCancel: () => void;
  }

const EditTeamForm: React.FC<EditTeamFormProps> = ({ team, onSave, onCancel }) => {
  const [teamName, setTeamName] = useState(team.name);
  const [captainId, setCaptainId] = useState(team.captainId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamName.trim()) {
      alert('Please enter a team name');
      return;
    }
  
    if (!captainId) {
      alert('Please select a captain');
      return;
    }
  
    setIsSubmitting(true);
    
    try {
      // Update players array with the new captain
      const updatedPlayers = team.players.map(player => ({
        ...player,
        isCaptain: player.id === captainId  // Set true for selected captain, false for others
      }));
  
      await onSave(team.id, {
        name: teamName.trim(),
        captainId: captainId,
        players: updatedPlayers  // Include the updated players array
      });
    } catch (error) {
      console.error('Error updating team:', error);
      alert('Error updating team. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        maxWidth: '500px',
        width: '90%',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--color-neutral-200)',
        position: 'relative'
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
          Edit Team
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <span>🏷️</span> Team Name:
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="form-input"
              placeholder="Enter team name"
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>👑</span> Team Captain:
            </label>
            <select
              value={captainId}
              onChange={(e) => setCaptainId(e.target.value)}
              className="form-input"
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

          <div style={{
            display: 'flex',
            gap: 'var(--spacing-4)',
            justifyContent: 'center',
            marginTop: 'var(--spacing-8)',
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
              disabled={isSubmitting || !teamName.trim() || !captainId}
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

export default EditTeamForm;