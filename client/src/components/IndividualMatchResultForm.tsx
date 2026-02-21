import React, { useState, useEffect } from 'react';
import { Player, IndividualMatch } from '../types';
import { calculateTeamTournamentPoints } from '../utils/rankingUtils';

interface IndividualMatchResultFormProps {
  individualMatch: IndividualMatch;
  player1: Player;
  player2: Player;
  onSave: (matchId: string, results: any) => void;
  onCancel: () => void;
}

const IndividualMatchResultForm: React.FC<IndividualMatchResultFormProps> = ({
  individualMatch,
  player1,
  player2,
  onSave,
  onCancel
}) => {
  const [results, setResults] = useState({
    objectivePoints1: individualMatch.objectivePoints1 || 0,
    objectivePoints2: individualMatch.objectivePoints2 || 0,
    victoryPointsFor1: individualMatch.victoryPointsFor1 || 0,
    victoryPointsFor2: individualMatch.victoryPointsFor2 || 0,
    paintedBonus1: individualMatch.paintedBonus1 || player1.isPainted,
    paintedBonus2: individualMatch.paintedBonus2 || player2.isPainted,
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Auto-calculate tournament points when objective points or painted status changes
  const calculatedPoints = {
    points1: calculateTeamTournamentPoints(
      results.objectivePoints1, results.objectivePoints2,
      results.paintedBonus1, results.paintedBonus2, true
    ),
    points2: calculateTeamTournamentPoints(
      results.objectivePoints1, results.objectivePoints2,
      results.paintedBonus1, results.paintedBonus2, false
    ),
  };

  // Update painted bonuses when component mounts or players change
  useEffect(() => {
    setResults(prev => ({
      ...prev,
      paintedBonus1: individualMatch.paintedBonus1 || player1.isPainted,
      paintedBonus2: individualMatch.paintedBonus2 || player2.isPainted,
    }));
  }, [player1.isPainted, player2.isPainted, individualMatch.paintedBonus1, individualMatch.paintedBonus2]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate the form
  const validateForm = (): boolean => {
    const errors: string[] = [];

    // Validate Objective Points (0-10)
    if (results.objectivePoints1 < 0 || results.objectivePoints1 > 10) {
      errors.push(`${player1.nickname}'s Objective Points must be between 0 and 10`);
    }
    if (results.objectivePoints2 < 0 || results.objectivePoints2 > 10) {
      errors.push(`${player2.nickname}'s Objective Points must be between 0 and 10`);
    }

    // Validate Victory Points (0-300)
    if (results.victoryPointsFor1 < 0 || results.victoryPointsFor1 > 300) {
      errors.push(`${player1.nickname}'s Victory Points must be between 0 and 300`);
    }
    if (results.victoryPointsFor2 < 0 || results.victoryPointsFor2 > 300) {
      errors.push(`${player2.nickname}'s Victory Points must be between 0 and 300`);
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Include calculated tournament points in the results
      const finalResults = {
        ...results,
        tournamentPoints1: calculatedPoints.points1,
        tournamentPoints2: calculatedPoints.points2,
        isCompleted: true
      };
      onSave(individualMatch.id, finalResults);
    } catch (error) {
      console.error('Error saving results:', error);
      alert('Error saving results. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: number | boolean) => {
    setResults(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear validation errors when user makes changes
    setValidationErrors([]);
  };

  const containerStyle = {
    position: 'fixed' as const,
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
  };

  const modalStyle = {
    background: 'white',
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--spacing-8)',
    maxWidth: '900px',
    width: '95%',
    maxHeight: '95%',
    overflow: 'auto',
    boxShadow: 'var(--shadow-xl)',
    border: '1px solid var(--color-neutral-200)'
  };

  const playerCardStyle = (playerNumber: number) => ({
    background: `linear-gradient(135deg, ${
      playerNumber === 1 ? 'var(--color-primary-light)' : 'var(--color-secondary-light)'
    }, ${
      playerNumber === 1 ? 'var(--color-primary)' : 'var(--color-secondary)'
    })`,
    color: 'white',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--spacing-6)',
    marginBottom: 'var(--spacing-4)'
  });

  const inputGroupStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--spacing-6)',
    marginBottom: 'var(--spacing-6)'
  };

  // Get match outcome description
  const getMatchOutcome = () => {
    const obj1 = results.objectivePoints1;
    const obj2 = results.objectivePoints2;
    
    if (obj1 > obj2) return `${player1.nickname} Victory (${obj1} vs ${obj2})`;
    if (obj2 > obj1) return `${player2.nickname} Victory (${obj2} vs ${obj1})`;
    if (obj1 === obj2 && obj1 > 0) return `Tie (${obj1} vs ${obj2})`;
    return 'Enter objective points to see result';
  };

  return (
    <div style={containerStyle}>
      <div style={modalStyle}>
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
          <span>📝</span>
          Enter Match Results
        </h3>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-6)' }}>
            <strong>⚠️ Please fix the following errors:</strong>
            <ul style={{ margin: 'var(--spacing-2) 0 0 var(--spacing-4)', paddingLeft: 'var(--spacing-4)' }}>
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Scoring Guide */}
        <div style={{
          background: 'linear-gradient(135deg, var(--color-neutral-50), white)',
          border: '1px solid var(--color-neutral-200)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-6)',
          marginBottom: 'var(--spacing-6)'
        }}>
          <h4 style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-primary)',
            marginBottom: 'var(--spacing-4)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-2)'
          }}>
            <span>📋</span>
            Infinity Tournament Scoring
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--spacing-4)',
            fontSize: 'var(--font-size-sm)'
          }}>
            <div>
              <strong style={{ color: 'var(--color-primary)' }}>🏆 Base Tournament Points:</strong>
              <ul style={{ margin: 'var(--spacing-2) 0', paddingLeft: 'var(--spacing-4)' }}>
                <li><strong>Victory:</strong> 4 points (more Obj. Points)</li>
                <li><strong>Tie:</strong> 2 points (same Obj. Points)</li>
                <li><strong>Defeat:</strong> 0 points (less Obj. Points)</li>
              </ul>
            </div>
            <div>
              <strong style={{ color: 'var(--color-primary)' }}>⚡ Bonus Points:</strong>
              <ul style={{ margin: 'var(--spacing-2) 0', paddingLeft: 'var(--spacing-4)' }}>
                <li><strong>Offensive:</strong> +1 pt (5+ Obj. Points)</li>
                <li><strong>Defensive:</strong> +1 pt (lose by ≤2 Obj.)</li>
                <li><strong>Painted Army:</strong> +1 pt</li>
              </ul>
            </div>
            <div>
              <strong style={{ color: 'var(--color-primary)' }}>🎯 Tiebreakers:</strong>
              <ul style={{ margin: 'var(--spacing-2) 0', paddingLeft: 'var(--spacing-4)' }}>
                <li>1st: Objective Points</li>
                <li>2nd: Victory Points Difference</li>
                <li>3rd: Victory Points For</li>
              </ul>
            </div>
          </div>
        </div>

        <div style={inputGroupStyle}>
          {/* Player 1 Card */}
          <div style={playerCardStyle(1)}>
            <h4 style={{ 
              margin: '0 0 var(--spacing-3) 0',
              fontSize: 'var(--font-size-xl)',
              fontWeight: 'var(--font-weight-bold)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-2)'
            }}>
              <span>🎮</span>
              {player1.nickname}
            </h4>
            <p style={{ 
              margin: '0 0 var(--spacing-4) 0',
              fontSize: 'var(--font-size-sm)',
              opacity: 0.9
            }}>
              {player1.army}
              {player1.isPainted && (
                <span style={{ marginLeft: 'var(--spacing-2)' }}>
                  🎨 (Army Painted)
                </span>
              )}
            </p>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 'var(--radius-base)',
              padding: 'var(--spacing-3)',
              fontSize: 'var(--font-size-lg)',
              fontWeight: 'var(--font-weight-bold)',
              textAlign: 'center'
            }}>
              {calculatedPoints.points1} Tournament Points
            </div>
          </div>

          {/* Player 2 Card */}
          <div style={playerCardStyle(2)}>
            <h4 style={{ 
              margin: '0 0 var(--spacing-3) 0',
              fontSize: 'var(--font-size-xl)',
              fontWeight: 'var(--font-weight-bold)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-2)'
            }}>
              <span>🎮</span>
              {player2.nickname}
            </h4>
            <p style={{ 
              margin: '0 0 var(--spacing-4) 0',
              fontSize: 'var(--font-size-sm)',
              opacity: 0.9
            }}>
              {player2.army}
              {player2.isPainted && (
                <span style={{ marginLeft: 'var(--spacing-2)' }}>
                  🎨 (Army Painted)
                </span>
              )}
            </p>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 'var(--radius-base)',
              padding: 'var(--spacing-3)',
              fontSize: 'var(--font-size-lg)',
              fontWeight: 'var(--font-weight-bold)',
              textAlign: 'center'
            }}>
              {calculatedPoints.points2} Tournament Points
            </div>
          </div>
        </div>

        {/* Match Outcome */}
        <div style={{
          background: 'linear-gradient(135deg, var(--color-success-light), var(--color-success))',
          color: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-4)',
          marginBottom: 'var(--spacing-6)',
          textAlign: 'center',
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-bold)'
        }}>
          🏁 {getMatchOutcome()}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Objective Points */}
          <div style={{ marginBottom: 'var(--spacing-6)' }}>
            <h5 style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-primary)',
              marginBottom: 'var(--spacing-4)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-2)'
            }}>
              <span>🎯</span>
              Objective Points (determines winner) - Range: 0-10
            </h5>
            <div style={inputGroupStyle}>
              <div className="form-group">
                <label className="form-label">
                  {player1.nickname}:
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={results.objectivePoints1 === 0 ? '' : results.objectivePoints1}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    handleChange('objectivePoints1', Math.min(10, Math.max(0, value)));
                  }}
                  className="form-input"
                  disabled={isSubmitting}
                  placeholder="0"
                  autoFocus
                />
                <small style={{ color: 'var(--color-neutral-600)', fontSize: 'var(--font-size-xs)' }}>
                  Must be between 0 and 10
                </small>
              </div>
              <div className="form-group">
                <label className="form-label">
                  {player2.nickname}:
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={results.objectivePoints2 === 0 ? '' : results.objectivePoints2}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    handleChange('objectivePoints2', Math.min(10, Math.max(0, value)));
                  }}
                  className="form-input"
                  disabled={isSubmitting}
                  placeholder="0"
                />
                <small style={{ color: 'var(--color-neutral-600)', fontSize: 'var(--font-size-xs)' }}>
                  Must be between 0 and 10
                </small>
              </div>
            </div>
          </div>

          {/* Victory Points */}
          <div style={{ marginBottom: 'var(--spacing-6)' }}>
            <h5 style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-primary)',
              marginBottom: 'var(--spacing-4)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-2)'
            }}>
              <span>⚔️</span>
              Victory Points For (tiebreaker) - Range: 0-300
            </h5>
            <div style={inputGroupStyle}>
              <div className="form-group">
                <label className="form-label">
                  {player1.nickname}:
                </label>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={results.victoryPointsFor1 === 0 ? '' : results.victoryPointsFor1}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    handleChange('victoryPointsFor1', Math.min(300, Math.max(0, value)));
                  }}
                  className="form-input"
                  disabled={isSubmitting}
                  placeholder="0"
                />
                <small style={{ color: 'var(--color-neutral-600)', fontSize: 'var(--font-size-xs)' }}>
                  Must be between 0 and 300
                </small>
              </div>
              <div className="form-group">
                <label className="form-label">
                  {player2.nickname}:
                </label>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={results.victoryPointsFor2 === 0 ? '' : results.victoryPointsFor2}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    handleChange('victoryPointsFor2', Math.min(300, Math.max(0, value)));
                  }}
                  className="form-input"
                  disabled={isSubmitting}
                  placeholder="0"
                />
                <small style={{ color: 'var(--color-neutral-600)', fontSize: 'var(--font-size-xs)' }}>
                  Must be between 0 and 300
                </small>
              </div>
            </div>
          </div>

          {/* Painted Army Bonus */}
          <div style={{ marginBottom: 'var(--spacing-8)' }}>
            <h5 style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-primary)',
              marginBottom: 'var(--spacing-4)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-2)'
            }}>
              <span>🎨</span>
              Painted Army Bonus (+1 Tournament Point)
            </h5>
            <div style={inputGroupStyle}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-3)',
                cursor: 'pointer',
                padding: 'var(--spacing-4)',
                borderRadius: 'var(--radius-lg)',
                background: results.paintedBonus1 ? 
                  'linear-gradient(135deg, var(--color-success-light), var(--color-success))' : 
                  'var(--color-neutral-50)',
                border: `2px solid ${results.paintedBonus1 ? 'var(--color-success)' : 'var(--color-neutral-200)'}`,
                transition: 'all var(--transition-fast)',
                color: results.paintedBonus1 ? 'white' : 'inherit'
              }}>
                <input
                  type="checkbox"
                  checked={results.paintedBonus1}
                  onChange={(e) => handleChange('paintedBonus1', e.target.checked)}
                  disabled={isSubmitting}
                  style={{ transform: 'scale(1.2)' }}
                />
                <span style={{ fontSize: 'var(--font-size-lg)' }}>🎨</span>
                <div>
                  <strong>{player1.nickname}</strong>
                  {player1.isPainted && (
                    <div style={{ 
                      fontSize: 'var(--font-size-xs)', 
                      opacity: 0.8,
                      marginTop: 'var(--spacing-1)'
                    }}>
                      ✓ Army marked as painted in profile
                    </div>
                  )}
                </div>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-3)',
                cursor: 'pointer',
                padding: 'var(--spacing-4)',
                borderRadius: 'var(--radius-lg)',
                background: results.paintedBonus2 ? 
                  'linear-gradient(135deg, var(--color-success-light), var(--color-success))' : 
                  'var(--color-neutral-50)',
                border: `2px solid ${results.paintedBonus2 ? 'var(--color-success)' : 'var(--color-neutral-200)'}`,
                transition: 'all var(--transition-fast)',
                color: results.paintedBonus2 ? 'white' : 'inherit'
              }}>
                <input
                  type="checkbox"
                  checked={results.paintedBonus2}
                  onChange={(e) => handleChange('paintedBonus2', e.target.checked)}
                  disabled={isSubmitting}
                  style={{ transform: 'scale(1.2)' }}
                />
                <span style={{ fontSize: 'var(--font-size-lg)' }}>🎨</span>
                <div>
                  <strong>{player2.nickname}</strong>
                  {player2.isPainted && (
                    <div style={{ 
                      fontSize: 'var(--font-size-xs)', 
                      opacity: 0.8,
                      marginTop: 'var(--spacing-1)'
                    }}>
                      ✓ Army marked as painted in profile
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
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
              className="btn btn-success"
              disabled={isSubmitting}
              style={{
                fontSize: 'var(--font-size-lg)',
                padding: 'var(--spacing-4) var(--spacing-8)'
              }}
            >
              {isSubmitting ? (
                <>
                  <div className="loading-spinner"></div>
                  Saving...
                </>
              ) : (
                <>
                  <span>💾</span>
                  Save Results
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IndividualMatchResultForm;