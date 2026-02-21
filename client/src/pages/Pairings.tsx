import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import {
  Swords,
  Shuffle,
  Eye,
  Info,
  Save,
  X,
  Target,
  CheckCircle2,
  ClipboardEdit,
  Pencil,
  Trash2,
  Gamepad2,
  SkipForward,
} from 'lucide-react';
import { useTournament } from '../contexts/TournamentContext';
import { useToast } from '../contexts/ToastContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import IndividualMatchResultForm from '../components/IndividualMatchResultForm';
import { IndividualMatch, Player, Team, TeamMatch } from '../types';
import styles from './Pairings.module.css';

const Pairings: React.FC = () => {
  const {
    getTeams,
    generatePairings,
    savePairings,
    clearPairings,
    updatePairings,
    deleteRoundMatches,
    getCurrentRoundMatches,
    setIndividualPairings,
    updateIndividualMatch,
    updateTeamMatch,
    canAdvanceToNextRound,
    advanceToNextRound,
    getCurrentRound,
    getAllRounds,
    getRoundMatches,
    loading,
    pairings
  } = useTournament();

  const toast = useToast();

  const [selectedMatch, setSelectedMatch] = useState<{
    individualMatch: IndividualMatch;
    player1: Player;
    player2: Player;
  } | null>(null);

  const [individualPairings, setLocalIndividualPairings] = useState<{ [key: string]: { player1Id: string; player2Id: string }[] }>({});
  const [selectedRound, setSelectedRound] = useState<number | null>(null);

  const teams = getTeams();
  const currentRoundMatches = getCurrentRoundMatches();
  const currentRound = getCurrentRound();
  const allRounds = getAllRounds();

  useEffect(() => {
    if (selectedRound === null && currentRound > 0) {
      setSelectedRound(currentRound);
    }
  }, [currentRound, selectedRound]);

  const handleGeneratePairings = async () => {
    try {
      await generatePairings();
    } catch (error) {
      console.error('Error generating pairings:', error);
      toast.error('Error generating pairings: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleSavePairings = async () => {
    try {
      await savePairings(pairings);
      setLocalIndividualPairings({});
    } catch (error) {
      console.error('Error saving pairings:', error);
    }
  };

  const handleSetIndividualPairings = async (teamMatchId: string, pairingsData: { player1Id: string; player2Id: string }[]) => {
    try {
      await setIndividualPairings(teamMatchId, pairingsData);
      setLocalIndividualPairings(prev => ({ ...prev, [teamMatchId]: pairingsData }));
    } catch (error) {
      console.error('Error setting individual pairings:', error);
    }
  };

  const handleSaveMatchResult = async (matchId: string, results: Partial<IndividualMatch>) => {
    try {
      await updateIndividualMatch(matchId, results);
      setSelectedMatch(null);
      setSelectedRound(selectedRound); // This will trigger a re-render
    } catch (error) {
      console.error('Error saving match result:', error);
      toast.error('Error saving match result. Please try again.');
    }
  };

  const handleAdvanceRound = async () => {
    const confirmed = await toast.confirm(
      'Are you sure you want to advance to the next round?',
      { confirmLabel: 'Advance' }
    );
    if (confirmed) {
      try {
        await advanceToNextRound();
        setSelectedRound(currentRound + 1);
      } catch (error) {
        console.error('Error advancing round:', error);
      }
    }
  };

  const handleDeleteRound = async () => {
    const confirmed = await toast.confirm(
      'Are you sure you want to delete all matches for this round?',
      { variant: 'danger', confirmLabel: 'Delete' }
    );
    if (confirmed) {
      try {
        await deleteRoundMatches(currentRound);
      } catch (error) {
        console.error('Error deleting round:', error);
        toast.error('Failed to delete round matches');
      }
    }
  };

  const displayedMatches = selectedRound !== null ? getRoundMatches(selectedRound) : currentRoundMatches;
  const isViewingCurrentRound = selectedRound === currentRound;

  if (loading) {
    return (
      <div className="container">
        <h2 className={styles.pageTitle}>
          <Swords size={28} className={styles.pageTitleIcon} />
          Pairings &amp; Results
        </h2>
        <div className="card">
          <LoadingSkeleton variant="card" count={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      <h2 className={styles.pageTitle}>
        <Swords size={28} className={styles.pageTitleIcon} />
        Pairings &amp; Results
      </h2>

      {/* Round Selector */}
      {allRounds.length > 0 && (
        <div className="card">
          <div className={styles.roundSelector}>
            <h3 className={styles.roundLabel}>
              View Round:
            </h3>
            {allRounds.map(round => (
              <button
                key={round}
                onClick={() => setSelectedRound(round)}
                className={clsx(
                  'btn',
                  selectedRound === round ? 'btn-primary' : 'btn-outline',
                  styles.roundBtn
                )}
              >
                Round {round}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Generate Pairings Section (only show for current round) */}
      {isViewingCurrentRound && currentRoundMatches.length === 0 && pairings.length === 0 && (
        <div className="card">
          <h3 className={styles.generateTitle}>
            Round {currentRound} - Generate Pairings
          </h3>

          <div className={styles.generateCenter}>
            <p className={styles.generateDesc}>
              Generate pairings for round {currentRound}. Teams will be paired based on their current standings.
            </p>
            <button
              onClick={handleGeneratePairings}
              className={clsx('btn btn-primary', styles.generateBtn)}
            >
              <Shuffle size={20} />
              Generate Round {currentRound} Pairings
            </button>
          </div>
        </div>
      )}

      {/* Preview Generated Pairings */}
      {pairings.length > 0 && (
        <div className="card">
          <h3 className={styles.previewTitle}>
            <Eye size={22} className={styles.previewTitleIcon} />
            Preview Round {currentRound} Pairings
          </h3>

          <div className={clsx('alert alert-info', styles.previewAlert)}>
            <Info size={16} className={styles.previewAlertIcon} />
            <strong>Review the pairings below.</strong> You can adjust table assignments before saving.
            Teams are paired to avoid previous opponents and tables when possible.
          </div>

          {pairings.map((pairing, index) => {
            const team1 = teams.find(t => t.id === pairing.team1Id);
            const team2 = teams.find(t => t.id === pairing.team2Id);

            return (
              <div key={index} className={styles.pairingCard}>
                <div className={styles.pairingGrid}>
                  {/* Table selector */}
                  <div>
                    <label className={styles.pairingLabel}>
                      Table:
                    </label>
                    <select
                      value={pairing.tableNumber}
                      onChange={(e) => {
                        const newPairings = [...pairings];
                        newPairings[index] = { ...newPairings[index], tableNumber: parseInt(e.target.value) };
                        updatePairings(newPairings);
                      }}
                      className={clsx('form-input', styles.tableSelect)}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <option key={num} value={num}>Table {num}</option>
                      ))}
                    </select>
                  </div>

                  {/* Team 1 selector */}
                  <div>
                    <label className={styles.pairingLabel}>
                      Team 1:
                    </label>
                    <select
                      value={pairing.team1Id}
                      onChange={(e) => {
                        const newPairings = [...pairings];
                        newPairings[index] = { ...newPairings[index], team1Id: e.target.value };
                        updatePairings(newPairings);
                      }}
                      className="form-input"
                    >
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                    <div className={styles.pairingPlayerList}>
                      {team1?.players.map(p => p.nickname).join(', ')}
                    </div>
                  </div>

                  {/* VS */}
                  <div className={styles.vsDivider}>
                    <Swords size={24} />
                  </div>

                  {/* Team 2 selector */}
                  <div>
                    <label className={styles.pairingLabel}>
                      Team 2:
                    </label>
                    <select
                      value={pairing.team2Id}
                      onChange={(e) => {
                        const newPairings = [...pairings];
                        newPairings[index] = { ...newPairings[index], team2Id: e.target.value };
                        updatePairings(newPairings);
                      }}
                      className="form-input"
                    >
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                    <div className={styles.pairingPlayerList}>
                      {team2?.players.map(p => p.nickname).join(', ')}
                    </div>
                  </div>

                  {/* Empty column for layout balance */}
                  <div></div>
                </div>
              </div>
            );
          })}

          <div className={styles.previewActions}>
            <button
              onClick={clearPairings}
              className="btn btn-outline"
            >
              <X size={18} />
              Cancel
            </button>
            <button
              onClick={handleSavePairings}
              className={clsx('btn btn-success', styles.savePairingsBtn)}
            >
              <Save size={20} />
              Save Pairings
            </button>
          </div>
        </div>
      )}

      {/* Display Current/Selected Round Matches */}
      {displayedMatches.length > 0 && (
        <div className="card">
          <div className={styles.matchesHeader}>
            <h3 className={styles.matchesTitle}>
              <Target size={22} className={styles.matchesTitleIcon} />
              Round {selectedRound} Matches
            </h3>

            <div className={styles.matchesActions}>
              {/* Advance to Next Round Button */}
              {isViewingCurrentRound && canAdvanceToNextRound && (
                <button
                  onClick={handleAdvanceRound}
                  className="btn btn-success"
                >
                  <SkipForward size={18} />
                  Advance to Round {currentRound + 1}
                </button>
              )}

              {isViewingCurrentRound && currentRoundMatches.length > 0 && !currentRoundMatches.some(m => m.isCompleted) && (
                <button
                  onClick={handleDeleteRound}
                  className="btn btn-warning"
                >
                  <Trash2 size={18} />
                  Delete Round {currentRound} Matches
                </button>
              )}
            </div>
          </div>

          {displayedMatches.map((teamMatch) => {
            const team1 = teams.find(t => t.id === teamMatch.team1Id);
            const team2 = teams.find(t => t.id === teamMatch.team2Id);
            const hasIndividualMatches = teamMatch.individualMatches && teamMatch.individualMatches.length > 0;

            return (
              <div key={teamMatch.id} className={styles.pairingCard}>
                {/* Team Match Header */}
                <div className={styles.pairingGrid} style={hasIndividualMatches ? { marginBottom: 'var(--spacing-6)' } : undefined}>
                  <div className={styles.tableBadge}>
                    Table {teamMatch.tableNumber}
                  </div>

                  <div>
                    <strong className={styles.teamNamePrimary}>
                      {team1?.name || 'Unknown Team'}
                    </strong>
                    <div className={styles.teamPlayers}>
                      {team1?.players.map(p => p.nickname).join(', ')}
                    </div>
                  </div>

                  <div className={styles.vsDivider}>
                    <Swords size={24} />
                  </div>

                  <div>
                    <strong className={styles.teamNameSecondary}>
                      {team2?.name || 'Unknown Team'}
                    </strong>
                    <div className={styles.teamPlayers}>
                      {team2?.players.map(p => p.nickname).join(', ')}
                    </div>
                  </div>

                  {teamMatch.isCompleted && (
                    <div className={styles.completedBadge}>
                      <CheckCircle2 size={16} />
                      Completed
                    </div>
                  )}
                </div>

                {/* Individual Matches */}
                {hasIndividualMatches ? (
                  <div>
                    <h4 className={styles.individualHeader}>
                      Individual Matches:
                    </h4>
                    {teamMatch.individualMatches.map((indMatch) => {
                      const player1 = team1?.players.find(p => p.id === indMatch.player1Id);
                      const player2 = team2?.players.find(p => p.id === indMatch.player2Id);

                      return (
                        <div
                          key={indMatch.id}
                          className={clsx(
                            styles.individualMatch,
                            indMatch.isCompleted && styles.individualMatchCompleted
                          )}
                        >
                          <div>
                            <div className={styles.playerName}>{player1?.nickname || 'Unknown'}</div>
                            <div className={styles.playerArmy}>
                              {player1?.army}
                            </div>
                            {indMatch.isCompleted && (
                              <div className={styles.playerStats}>
                                <span className={styles.statPrimary}>
                                  {indMatch.tournamentPoints1} pts
                                </span>
                                <span className={styles.statDivider}>|</span>
                                <span>{indMatch.objectivePoints1} obj</span>
                                <span className={styles.statDivider}>|</span>
                                <span>{indMatch.victoryPointsFor1} VP</span>
                              </div>
                            )}
                          </div>

                          <div className={styles.vsSmall}>
                            <Swords size={18} />
                          </div>

                          <div>
                            <div className={styles.playerName}>{player2?.nickname || 'Unknown'}</div>
                            <div className={styles.playerArmy}>
                              {player2?.army}
                            </div>
                            {indMatch.isCompleted && (
                              <div className={styles.playerStats}>
                                <span className={styles.statSecondary}>
                                  {indMatch.tournamentPoints2} pts
                                </span>
                                <span className={styles.statDivider}>|</span>
                                <span>{indMatch.objectivePoints2} obj</span>
                                <span className={styles.statDivider}>|</span>
                                <span>{indMatch.victoryPointsFor2} VP</span>
                              </div>
                            )}
                          </div>

                          <div>
                            {player1 && player2 && (
                              !indMatch.isCompleted ? (
                                <button
                                  onClick={() => setSelectedMatch({ individualMatch: indMatch, player1, player2 })}
                                  className={clsx('btn btn-primary', styles.resultBtn)}
                                >
                                  <ClipboardEdit size={14} />
                                  Enter Results
                                </button>
                              ) : (
                                <button
                                  onClick={() => setSelectedMatch({ individualMatch: indMatch, player1, player2 })}
                                  className={clsx('btn btn-secondary', styles.resultBtn)}
                                >
                                  <Pencil size={14} />
                                  Edit Results
                                </button>
                              )
                            )}

                            {indMatch.isCompleted && (
                              <div className={styles.completeLabel}>
                                <CheckCircle2 size={14} />
                                Complete
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  team1 && team2 && !teamMatch.isCompleted && (
                    <PairingSetup
                      teamMatch={teamMatch}
                      team1={team1}
                      team2={team2}
                      onSave={handleSetIndividualPairings}
                    />
                  )
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* No matches state */}
      {displayedMatches.length === 0 && pairings.length === 0 && !isViewingCurrentRound && (
        <div className="card">
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Gamepad2 size={48} />
            </div>
            <p className={styles.emptyText}>
              No matches found for Round {selectedRound}.
            </p>
          </div>
        </div>
      )}

      {/* Match Result Form Modal */}
      {selectedMatch && (
        <IndividualMatchResultForm
          individualMatch={selectedMatch.individualMatch}
          player1={selectedMatch.player1}
          player2={selectedMatch.player2}
          onSave={handleSaveMatchResult}
          onCancel={() => setSelectedMatch(null)}
        />
      )}
    </div>
  );
};

// Pairing Setup Component
interface PairingSetupProps {
  teamMatch: TeamMatch;
  team1: Team;
  team2: Team;
  onSave: (teamMatchId: string, pairings: { player1Id: string; player2Id: string }[]) => void;
}

const PairingSetup: React.FC<PairingSetupProps> = ({ teamMatch, team1, team2, onSave }) => {
  const toast = useToast();
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

  // Get available players for team 1 (exclude already selected)
  const getAvailableTeam1Players = (currentIndex: number) => {
    const selectedPlayerIds = pairings
      .map((p, idx) => idx !== currentIndex ? p.player1Id : null)
      .filter(Boolean);
    return team1.players.filter((player: Player) => !selectedPlayerIds.includes(player.id));
  };

  // Get available players for team 2 (exclude already selected)
  const getAvailableTeam2Players = (currentIndex: number) => {
    const selectedPlayerIds = pairings
      .map((p, idx) => idx !== currentIndex ? p.player2Id : null)
      .filter(Boolean);
    return team2.players.filter((player: Player) => !selectedPlayerIds.includes(player.id));
  };

  const handleSubmit = () => {
    // Validate all pairings are filled
    if (!pairings.every(p => p.player1Id && p.player2Id)) {
      toast.warning('Please select all players for all matches');
      return;
    }

    // Check for duplicates
    const team1Players = pairings.map(p => p.player1Id);
    const team2Players = pairings.map(p => p.player2Id);

    if (new Set(team1Players).size !== 3 || new Set(team2Players).size !== 3) {
      toast.warning('Each player can only be in one match');
      return;
    }

    onSave(teamMatch.id, pairings);
  };

  const isValid = pairings.every(p => p.player1Id && p.player2Id);

  return (
    <div className={styles.setupBox}>
      <h4 className={styles.setupTitle}>
        <Target size={18} className={styles.setupTitleIcon} />
        Set Individual Player Pairings
      </h4>

      {pairings.map((pairing, index) => (
        <div key={index} className={styles.setupRow}>
          <select
            value={pairing.player1Id}
            onChange={(e) => handlePairingChange(index, 'player1Id', e.target.value)}
            className="form-input"
          >
            <option value="">Select {team1.name} Player</option>
            {getAvailableTeam1Players(index).map((player: Player) => (
              <option key={player.id} value={player.id}>
                {player.nickname} ({player.army})
              </option>
            ))}
          </select>

          <div className={styles.setupVs}>
            <Swords size={18} />
          </div>

          <select
            value={pairing.player2Id}
            onChange={(e) => handlePairingChange(index, 'player2Id', e.target.value)}
            className="form-input"
          >
            <option value="">Select {team2.name} Player</option>
            {getAvailableTeam2Players(index).map((player: Player) => (
              <option key={player.id} value={player.id}>
                {player.nickname} ({player.army})
              </option>
            ))}
          </select>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={!isValid}
        className={clsx('btn btn-primary', styles.setupSaveBtn)}
      >
        <Save size={18} />
        Save Individual Pairings
      </button>
    </div>
  );
};

export default Pairings;
