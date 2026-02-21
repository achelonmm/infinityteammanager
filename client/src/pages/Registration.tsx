import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Tag,
  Users,
  Crown,
  Gamepad2,
  Swords,
  Hash,
  Rocket,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useTournament } from '../contexts/TournamentContext';
import { useToast } from '../contexts/ToastContext';
import styles from './Registration.module.css';

interface PlayerForm {
  nickname: string;
  itsPin: string;
  army: string;
  isCaptain: boolean;
}

const Registration: React.FC = () => {
  const navigate = useNavigate();
  const { addTeam, loading, error } = useTournament();
  const toast = useToast();
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
      toast.warning('Please enter a team name');
      return;
    }

    const captainCount = players.filter(p => p.isCaptain).length;
    if (captainCount !== 1) {
      toast.warning('Please select exactly one captain');
      return;
    }

    if (players.some(p => !p.nickname.trim() || !p.itsPin.trim() || !p.army)) {
      toast.warning('Please fill in all player information');
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

      toast.success('Team registered successfully!');

      // Reset form
      setTeamName('');
      setPlayers([
        { nickname: '', itsPin: '', army: '', isCaptain: false },
        { nickname: '', itsPin: '', army: '', isCaptain: false },
        { nickname: '', itsPin: '', army: '', isCaptain: false }
      ]);
      setCurrentStep(0);

      navigate('/teams');
    } catch (err) {
      console.error('Error registering team:', err);
      toast.error('Error registering team. Please try again.');
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

  return (
    <div className="container animate-fade-in">
      <h2 className={styles.pageTitle}>
        <UserPlus className={styles.pageTitleIcon} size={28} />
        Team Registration
      </h2>

      {error && (
        <div className="alert alert-error animate-slide-in">
          <AlertCircle className={styles.errorIcon} size={18} />
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Step Indicator */}
      <div className={styles.stepIndicator}>
        <button
          type="button"
          className={currentStep === -1 ? styles.stepActive : (currentStep > -1 ? styles.stepCompleted : styles.step)}
          onClick={() => setCurrentStep(-1)}
        >
          <span className={styles.stepIcon}><Tag size={18} /></span>
        </button>
        {[0, 1, 2].map(index => (
          <button
            type="button"
            key={index}
            className={
              currentStep === index
                ? styles.stepActive
                : index < currentStep
                  ? styles.stepCompleted
                  : styles.step
            }
            onClick={() => setCurrentStep(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.formCard}>
          {(loading || submitting) && (
            <div className="loading-overlay">
              <div className={`loading-spinner ${styles.loadingOverlaySpinner}`}></div>
            </div>
          )}

          <h3 className={styles.formCardTitle}>
            <Rocket className={styles.formCardTitleIcon} size={24} />
            Register Your Team
          </h3>

          {/* Team Name Section */}
          {currentStep === -1 && (
            <div className={`animate-fade-in ${styles.teamNameSection}`}>
              <div className="form-group">
                <label className={`form-label ${styles.teamNameLabel}`}>
                  <Tag className={styles.labelIcon} size={18} />
                  Team Name:
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className={`form-input ${styles.teamNameInput}`}
                  placeholder="Enter your team name (e.g., 'Steel Wolves')"
                  disabled={loading || submitting}
                />
              </div>

              <div className={styles.ctaCenter}>
                <button
                  type="button"
                  className={`btn btn-primary ${styles.ctaButton}`}
                  onClick={() => setCurrentStep(0)}
                  disabled={!teamName.trim()}
                >
                  <Rocket size={20} />
                  Continue to Players
                </button>
              </div>
            </div>
          )}

          {/* Players Section */}
          {currentStep >= 0 && (
            <div className="animate-fade-in">
              <h4 className={styles.playersTitle}>
                <Users className={styles.playersTitleIcon} size={22} />
                Players
              </h4>

              {players.map((player, index) => (
                <div
                  key={index}
                  className={currentStep === index ? styles.playerCardActive : styles.playerCard}
                  onClick={() => setCurrentStep(index)}
                >
                  <div className={styles.playerCardHeader}>
                    {player.isCaptain ? (
                      <Crown className={styles.playerCardHeaderIconCaptain} size={24} />
                    ) : (
                      <Gamepad2 className={styles.playerCardHeaderIcon} size={24} />
                    )}
                    <h5 className={styles.playerCardName}>
                      Player {index + 1}
                      {player.isCaptain && <span className={styles.captainTag}>(Captain)</span>}
                    </h5>
                  </div>

                  {currentStep === index && (
                    <div className="animate-fade-in">
                      <div className={styles.fieldGrid}>
                        <div className="form-group">
                          <label className="form-label">
                            <Tag className={styles.labelIcon} size={16} /> Nickname:
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
                            <Hash className={styles.labelIcon} size={16} /> ITS Pin:
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
                          <Swords className={styles.labelIcon} size={16} /> Army/Sectorial:
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

                      <div className={styles.captainToggle}>
                        <label className={styles.captainLabel}>
                          <input
                            type="radio"
                            checked={player.isCaptain}
                            onChange={(e) => handlePlayerChange(index, 'isCaptain', e.target.checked)}
                            disabled={loading || submitting}
                            className={styles.captainRadio}
                          />
                          <Crown className={styles.captainLabelIcon} size={22} />
                          <span className={styles.captainLabelText}>
                            Team Captain
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  {currentStep !== index && (
                    <div className={styles.playerSummary}>
                      <span><strong>Nickname:</strong> {player.nickname || 'Not set'}</span>
                      <span><strong>Army:</strong> {player.army || 'Not selected'}</span>
                    </div>
                  )}
                </div>
              ))}

              {/* Navigation Buttons */}
              <div className={styles.navFooter}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setCurrentStep(currentStep > 0 ? currentStep - 1 : -1)}
                  disabled={loading || submitting}
                >
                  Back
                </button>

                <div className={styles.stepCounter}>
                  Step {currentStep + 2} of 4
                </div>

                {currentStep < 2 ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={loading || submitting}
                  >
                    Next Player
                  </button>
                ) : (
                  <button
                    type="submit"
                    className={`btn btn-success ${styles.submitButton}`}
                    disabled={loading || submitting || !isFormValid()}
                  >
                    {submitting ? (
                      <>
                        <div className="loading-spinner"></div>
                        Registering...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={20} />
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
