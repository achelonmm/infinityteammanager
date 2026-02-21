import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTournament } from '../contexts/TournamentContext';

interface PlayerForm {
  nickname: string;
  itsPin: string;
  army: string;
  isCaptain: boolean;
}

const Registration: React.FC = () => {
  const navigate = useNavigate();
  const { addTeam, loading, error } = useTournament();
  const [teamName, setTeamName] = useState('');
  const [players, setPlayers] = useState<PlayerForm[]>([
    { nickname: '', itsPin: '', army: '', isCaptain: false },
    { nickname: '', itsPin: '', army: '', isCaptain: false },
    { nickname: '', itsPin: '', army: '', isCaptain: false }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const armies = [
    'PanOceania', 'Acontecimiento','Órdenes Militares', 'Neoterra', 'Varuna', 
    'WinterFor', 'Kestrel', 'Yu Jing', 'Servicio Imperial', 'Ejército Invencible', 'Estandarte Blanco', 'Ariadna',
    'Caledonia', 'Merovingia', 'USAriadna', 'Tartary Army Corps', 'Kosmoflot', 'Haqqislam', 
    'Hassassin Bahram', 'Qapu Khalqi', 'Ramah Taskforce', 'Nómadas', 'Corregidor', 'Bakunin', 'Tunguska', 'Ejército Combinado', 'Morat', 'Shasvastii', 'Ónice', 
    'Next Wave', 'ALEPH', 'Falange de Acero', 'SSO', 'Tohaa', 'O-12', 'Starmada', 'Torchlight', 'JSA', 'Shindenbutai', 'Oban', 'Druze Bayram Security', 
    'Ikari Company', 'StarCo', 'WhiteCo', 'Dashat Company' 
  ];

  const handlePlayerChange = (index: number, field: keyof PlayerForm, value: string | boolean) => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], [field]: value };
    
    // If setting a captain, unset others
    if (field === 'isCaptain' && value === true) {
      newPlayers.forEach((player, i) => {
        if (i !== index) player.isCaptain = false;
      });
    }
    
    setPlayers(newPlayers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!teamName.trim()) {
      alert('Please enter a team name');
      return;
    }
    
    const captainCount = players.filter(p => p.isCaptain).length;
    if (captainCount !== 1) {
      alert('Please select exactly one captain');
      return;
    }
    
    if (players.some(p => !p.nickname.trim() || !p.itsPin.trim() || !p.army)) {
      alert('Please fill in all player information');
      return;
    }
  
    setSubmitting(true);
    
    try {
      const teamData = {
        name: teamName,
        tournamentId: '', // This will be set by the context
        captainId: '', // This will be set by the context
        players: players.map((player) => ({
          id: '',
          nickname: player.nickname,
          itsPin: player.itsPin,
          army: player.army,
          isCaptain: player.isCaptain,
          teamId: '',
          isPainted: false
        }))
      };
  
      await addTeam(teamData);
      
      // Success notification
      const successAlert = document.createElement('div');
      successAlert.className = 'alert alert-success';
      successAlert.style.position = 'fixed';
      successAlert.style.top = '20px';
      successAlert.style.right = '20px';
      successAlert.style.zIndex = '1000';
      successAlert.innerHTML = '<strong>🎉 Success!</strong> Team registered successfully!';
      document.body.appendChild(successAlert);
      
      setTimeout(() => {
        document.body.removeChild(successAlert);
      }, 3000);
      
      // Reset form
      setTeamName('');
      setPlayers([
        { nickname: '', itsPin: '', army: '', isCaptain: false },
        { nickname: '', itsPin: '', army: '', isCaptain: false },
        { nickname: '', itsPin: '', army: '', isCaptain: false }
      ]);
      setCurrentStep(0);
      
      navigate('/teams');
    } catch (error) {
      console.error('Error registering team:', error);
      alert('Error registering team. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = () => {
    const basicValidation = teamName.trim() && 
           players.filter(p => p.isCaptain).length === 1 &&
           players.every(p => p.nickname.trim() && p.itsPin.trim() && p.army);
    
    return basicValidation;
  };

  const playerCardStyle = (index: number) => ({
    background: index === currentStep ? 
      'linear-gradient(135deg, var(--color-primary-light), var(--color-secondary-light))' : 
      'linear-gradient(135deg, white, var(--color-neutral-50))',
    border: `2px solid ${index === currentStep ? 'var(--color-primary)' : 'var(--color-neutral-200)'}`,
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--spacing-6)',
    marginBottom: 'var(--spacing-4)',
    transition: 'all var(--transition-base)',
    position: 'relative' as const,
    overflow: 'hidden',
    color: index === currentStep ? 'white' : 'inherit',
  });

  const stepIndicatorStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: 'var(--spacing-4)',
    marginBottom: 'var(--spacing-8)',
  };

  const stepStyle = (stepIndex: number) => ({
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: stepIndex <= currentStep ? 
      'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' : 
      'var(--color-neutral-300)',
    color: stepIndex <= currentStep ? 'white' : 'var(--color-neutral-600)',
    fontWeight: 'var(--font-weight-bold)',
    transition: 'all var(--transition-base)',
    cursor: 'pointer',
    boxShadow: stepIndex === currentStep ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
  });

  return (
    <div className="container animate-fade-in">
      <h2 style={{ 
        marginBottom: 'var(--spacing-8)', 
        color: 'var(--color-primary)',
        fontSize: 'var(--font-size-3xl)',
        fontWeight: 'var(--font-weight-bold)',
        textAlign: 'center',
        background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        ➕ Team Registration
      </h2>
      
      {error && (
        <div className="alert alert-error animate-slide-in">
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}

      {/* Step Indicator */}
      <div style={stepIndicatorStyle}>
        <div 
          style={stepStyle(-1)}
          onClick={() => setCurrentStep(-1)}
        >
          🏷️
        </div>
        {[0, 1, 2].map(index => (
          <div 
            key={index}
            style={stepStyle(index)}
            onClick={() => setCurrentStep(index)}
          >
            {index + 1}
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="card" style={{ maxWidth: '900px', position: 'relative' }}>
          {(loading || submitting) && (
            <div className="loading-overlay">
              <div className="loading-spinner" style={{ width: '40px', height: '40px' }}></div>
            </div>
          )}

          <h3 style={{ 
            marginBottom: 'var(--spacing-6)',
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-3)'
          }}>
            <span>🎪</span>
            Register Your Team
          </h3>
          
          {/* Team Name Section */}
          {currentStep === -1 && (
            <div className="animate-fade-in" style={{ marginBottom: 'var(--spacing-8)' }}>
              <div className="form-group">
                <label className="form-label" style={{ 
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 'var(--font-weight-semibold)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-2)'
                }}>
                  <span>🏷️</span>
                  Team Name:
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="form-input"
                  placeholder="Enter your team name (e.g., 'Steel Wolves')"
                  disabled={loading || submitting}
                  style={{ 
                    fontSize: 'var(--font-size-lg)',
                    padding: 'var(--spacing-4) var(--spacing-6)'
                  }}
                />
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setCurrentStep(0)}
                  disabled={!teamName.trim()}
                  style={{ 
                    fontSize: 'var(--font-size-lg)',
                    padding: 'var(--spacing-4) var(--spacing-8)'
                  }}
                >
                  <span>🚀</span>
                  Continue to Players
                </button>
              </div>
            </div>
          )}

          {/* Players Section */}
          {currentStep >= 0 && (
            <div className="animate-fade-in">
              <h4 style={{ 
                marginBottom: 'var(--spacing-6)',
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-2)'
              }}>
                <span>👥</span>
                Players
              </h4>
              
              {players.map((player, index) => (
                <div 
                  key={index} 
                  style={playerCardStyle(index)}
                  onClick={() => setCurrentStep(index)}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 'var(--spacing-3)',
                    marginBottom: 'var(--spacing-4)'
                  }}>
                    <span style={{ fontSize: 'var(--font-size-2xl)' }}>
                      {player.isCaptain ? '👑' : '🎮'}
                    </span>
                    <h5 style={{ 
                      fontSize: 'var(--font-size-lg)',
                      fontWeight: 'var(--font-weight-semibold)',
                      margin: 0
                    }}>
                      Player {index + 1}
                      {player.isCaptain && <span style={{ marginLeft: 'var(--spacing-2)' }}>(Captain)</span>}
                    </h5>
                  </div>
                  
                  {currentStep === index && (
                    <div className="animate-fade-in">
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
                            value={player.nickname}
                            onChange={(e) => handlePlayerChange(index, 'nickname', e.target.value)}
                            className="form-input"
                            placeholder="Player nickname"
                            disabled={loading || submitting}
                          />
                        </div>
                        
                        <div className="form-group">
                          <label className="form-label">
                            <span>🆔</span> ITS Pin:
                          </label>
                          <input
                            type="text"
                            value={player.itsPin}
                            onChange={(e) => handlePlayerChange(index, 'itsPin', e.target.value)}
                            className="form-input"
                            placeholder="ITS Pin number"
                            disabled={loading || submitting}
                          />
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">
                          <span>⚔️</span> Army/Sectorial:
                        </label>
                        <select
                          value={player.army}
                          onChange={(e) => handlePlayerChange(index, 'army', e.target.value)}
                          className="form-input"
                          disabled={loading || submitting}
                        >
                          <option value="">Select Army</option>
                          {armies.map(army => (
                            <option key={army} value={army}>{army}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div style={{ marginTop: 'var(--spacing-4)' }}>
                        <label style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 'var(--spacing-3)',
                          cursor: 'pointer',
                          padding: 'var(--spacing-3)',
                          borderRadius: 'var(--radius-lg)',
                          background: 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}>
                          <input
                            type="radio"
                            checked={player.isCaptain}
                            onChange={(e) => handlePlayerChange(index, 'isCaptain', e.target.checked)}
                            disabled={loading || submitting}
                            style={{ transform: 'scale(1.2)' }}
                          />
                          <span style={{ fontSize: 'var(--font-size-lg)' }}>👑</span>
                          <span style={{ fontWeight: 'var(--font-weight-medium)' }}>
                            Team Captain
                          </span>
                        </label>
                      </div>
                    </div>
                  )}
                  
                  {currentStep !== index && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 'var(--spacing-4)',
                      fontSize: 'var(--font-size-sm)',
                      opacity: 0.8
                    }}>
                      <span><strong>Nickname:</strong> {player.nickname || 'Not set'}</span>
                      <span><strong>Army:</strong> {player.army || 'Not selected'}</span>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Navigation Buttons */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginTop: 'var(--spacing-8)',
                paddingTop: 'var(--spacing-6)',
                borderTop: '1px solid var(--color-neutral-200)'
              }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setCurrentStep(currentStep > 0 ? currentStep - 1 : -1)}
                  disabled={loading || submitting}
                >
                  <span>←</span>
                  Back
                </button>
                
                <div style={{ 
                  color: 'var(--color-neutral-600)',
                  fontSize: 'var(--font-size-sm)'
                }}>
                  Step {currentStep + 2} of 4
                </div>
                
                {currentStep < 2 ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={loading || submitting}
                  >
                    <span>→</span>
                    Next Player
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={loading || submitting || !isFormValid()}
                    style={{ 
                      fontSize: 'var(--font-size-lg)',
                      padding: 'var(--spacing-4) var(--spacing-8)'
                    }}
                  >
                    {submitting ? (
                      <>
                        <div className="loading-spinner"></div>
                        Registering...
                      </>
                    ) : (
                      <>
                        <span>🎉</span>
                        Register Team
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default Registration;