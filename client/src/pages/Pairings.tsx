import React, { useState, useEffect } from 'react';
import { useTournament } from '../contexts/TournamentContext';
import IndividualMatchResultForm from '../components/IndividualMatchResultForm';
import { IndividualMatch, Player } from '../types';

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
      alert('Error generating pairings: ' + (error instanceof Error ? error.message : 'Unknown error'));
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

  const handleSetIndividualPairings = async (teamMatchId: string, pairings: { player1Id: string; player2Id: string }[]) => {
    try {
      await setIndividualPairings(teamMatchId, pairings);
      setLocalIndividualPairings(prev => ({ ...prev, [teamMatchId]: pairings }));
    } catch (error) {
      console.error('Error setting individual pairings:', error);
    }
  };

  const handleSaveMatchResult = async (matchId: string, results: any) => {
    try {
      await updateIndividualMatch(matchId, results);
      setSelectedMatch(null);
      setSelectedRound(selectedRound); // This will trigger a re-render
    } catch (error) {
      console.error('Error saving match result:', error);
      alert('Error saving match result. Please try again.');
    }
  };

  const handleAdvanceRound = async () => {
    if (window.confirm('Are you sure you want to advance to the next round? This action cannot be undone.')) {
      try {
        await advanceToNextRound();
        setSelectedRound(currentRound + 1);
      } catch (error) {
        console.error('Error advancing round:', error);
      }
    }
  };

  const displayedMatches = selectedRound !== null ? getRoundMatches(selectedRound) : currentRoundMatches;
  const isViewingCurrentRound = selectedRound === currentRound;

  const cardStyle = {
    background: 'white',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-lg)',
    padding: 'var(--spacing-6)',
    marginBottom: 'var(--spacing-6)',
    border: '1px solid var(--color-neutral-200)',
  };

  const teamCardStyle = {
    background: 'linear-gradient(135deg, white, var(--color-neutral-50))',
    border: '1px solid var(--color-neutral-200)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--spacing-6)',
    marginBottom: 'var(--spacing-4)',
  };

  if (loading) {
    return (
      <div className="container">
        <h2 style={{ 
          marginBottom: 'var(--spacing-8)', 
          color: 'var(--color-primary)',
          fontSize: 'var(--font-size-3xl)',
          fontWeight: 'var(--font-weight-bold)',
          textAlign: 'center'
        }}>
          Pairings & Results
        </h2>
        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
          <div className="loading-spinner" style={{ margin: '0 auto var(--spacing-4)' }}></div>
          <p style={{ color: 'var(--color-neutral-600)' }}>Loading pairings...</p>
        </div>
      </div>
    );
  }

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
        ⚔️ Pairings & Results
      </h2>

      {/* Round Selector */}
      {allRounds.length > 0 && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', flexWrap: 'wrap' }}>
            <h3 style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-primary)',
              margin: 0
            }}>
              View Round:
            </h3>
            {allRounds.map(round => (
              <button
                key={round}
                onClick={() => setSelectedRound(round)}
                className={selectedRound === round ? 'btn btn-primary' : 'btn btn-outline'}
                style={{ fontSize: 'var(--font-size-sm)' }}
              >
                Round {round}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Generate Pairings Section (only show for current round) */}
      {isViewingCurrentRound && currentRoundMatches.length === 0 && pairings.length === 0 && (
        <div style={cardStyle}>
          <h3 style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-primary)',
            marginBottom: 'var(--spacing-6)',
            textAlign: 'center'
          }}>
            Round {currentRound} - Generate Pairings
          </h3>
          
          <div style={{ textAlign: 'center' }}>
            <p style={{ 
              color: 'var(--color-neutral-600)', 
              marginBottom: 'var(--spacing-6)',
              fontSize: 'var(--font-size-base)'
            }}>
              Generate pairings for round {currentRound}. Teams will be paired based on their current standings.
            </p>
            <button
              onClick={handleGeneratePairings}
              className="btn btn-primary"
              style={{ fontSize: 'var(--font-size-lg)', padding: 'var(--spacing-4) var(--spacing-8)' }}
            >
              <span>🎲</span>
              Generate Round {currentRound} Pairings
            </button>
          </div>
        </div>
      )}

      {/* Preview Generated Pairings */}
      {pairings.length > 0 && (
        <div style={cardStyle}>
          <h3 style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-primary)',
            marginBottom: 'var(--spacing-6)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-3)'
          }}>
            <span>👀</span>
            Preview Round {currentRound} Pairings
          </h3>

          <div className="alert alert-info" style={{ marginBottom: 'var(--spacing-6)' }}>
            <strong>ℹ️ Review the pairings below.</strong> You can adjust table assignments before saving. 
            Teams are paired to avoid previous opponents and tables when possible.
          </div>

          {pairings.map((pairing, index) => {
          const team1 = teams.find(t => t.id === pairing.team1Id);
          const team2 = teams.find(t => t.id === pairing.team2Id);

          return (
            <div key={index} style={teamCardStyle}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'auto 1fr auto 1fr auto',
                gap: 'var(--spacing-4)',
                alignItems: 'center'
              }}>
                {/* Table selector */}
                <div>
                  <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)', display: 'block', marginBottom: 'var(--spacing-2)' }}>
                    Table:
                  </label>
                  <select
                    value={pairing.tableNumber}
                    onChange={(e) => {
                      const newPairings = [...pairings];
                      newPairings[index] = { ...newPairings[index], tableNumber: parseInt(e.target.value) };
                      updatePairings(newPairings);
                    }}
                    className="form-input"
                    style={{ minWidth: '100px' }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>Table {num}</option>
                    ))}
                  </select>
                </div>

                {/* Team 1 selector */}
                <div>
                  <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)', display: 'block', marginBottom: 'var(--spacing-2)' }}>
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
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)', marginTop: 'var(--spacing-1)' }}>
                    {team1?.players.map(p => p.nickname).join(', ')}
                  </div>
                </div>

                {/* VS */}
                <div style={{ 
                  fontSize: 'var(--font-size-2xl)', 
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--color-neutral-400)'
                }}>
                  VS
                </div>

                {/* Team 2 selector */}
                <div>
                  <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)', display: 'block', marginBottom: 'var(--spacing-2)' }}>
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
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)', marginTop: 'var(--spacing-1)' }}>
                    {team2?.players.map(p => p.nickname).join(', ')}
                  </div>
                </div>

                {/* Empty column for layout balance */}
                <div></div>
              </div>
            </div>
          );
        })}

          <div style={{ display: 'flex', gap: 'var(--spacing-4)', justifyContent: 'center', marginTop: 'var(--spacing-6)' }}>
            <button
              onClick={clearPairings}
              className="btn btn-outline"
            >
              <span>❌</span>
              Cancel
            </button>
            <button
              onClick={handleSavePairings}
              className="btn btn-success"
              style={{ fontSize: 'var(--font-size-lg)', padding: 'var(--spacing-4) var(--spacing-8)' }}
            >
              <span>💾</span>
              Save Pairings
            </button>
          </div>
        </div>
      )}

      {/* Display Current/Selected Round Matches */}
      {displayedMatches.length > 0 && (
        <div style={cardStyle}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 'var(--spacing-6)',
            flexWrap: 'wrap',
            gap: 'var(--spacing-4)'
          }}>
            <h3 style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-primary)',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-3)'
            }}>
              <span>🎯</span>
              Round {selectedRound} Matches
            </h3>

            {/* Advance to Next Round Button */}
            {isViewingCurrentRound && canAdvanceToNextRound && (
              <button
                onClick={handleAdvanceRound}
                className="btn btn-success"
              >
                <span>⏭️</span>
                Advance to Round {currentRound + 1}
              </button>
            )}

            {isViewingCurrentRound && currentRoundMatches.length > 0 && !currentRoundMatches.some(m => m.isCompleted) && (
            <button
              onClick={async () => {
                if (window.confirm('Are you sure you want to delete all matches for this round? This cannot be undone.')) {
                  try {
                    await deleteRoundMatches(currentRound);
                  } catch (error) {
                    console.error('Error deleting round:', error);
                    alert('Failed to delete round matches');
                  }
                }
              }}
              className="btn btn-warning"
            >
              <span>🗑️</span>
              Delete Round {currentRound} Matches
            </button>
          )}
          </div>

          {displayedMatches.map((teamMatch) => {
            const team1 = teams.find(t => t.id === teamMatch.team1Id);
            const team2 = teams.find(t => t.id === teamMatch.team2Id);
            const hasIndividualMatches = teamMatch.individualMatches && teamMatch.individualMatches.length > 0;

            return (
              <div key={teamMatch.id} style={teamCardStyle}>
                {/* Team Match Header */}
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto 1fr auto',
                  gap: 'var(--spacing-4)',
                  alignItems: 'center',
                  marginBottom: hasIndividualMatches ? 'var(--spacing-6)' : 0
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
                    color: 'white',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--spacing-3) var(--spacing-4)',
                    fontWeight: 'var(--font-weight-bold)',
                    fontSize: 'var(--font-size-sm)',
                    minWidth: '100px',
                    textAlign: 'center'
                  }}>
                    Table {teamMatch.tableNumber}
                  </div>

                  <div>
                    <strong style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-primary)' }}>
                      {team1?.name || 'Unknown Team'}
                    </strong>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>
                      {team1?.players.map(p => p.nickname).join(', ')}
                    </div>
                  </div>

                  <div style={{ 
                    fontSize: 'var(--font-size-2xl)', 
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--color-neutral-400)'
                  }}>
                    VS
                  </div>

                  <div>
                    <strong style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-secondary)' }}>
                      {team2?.name || 'Unknown Team'}
                    </strong>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>
                      {team2?.players.map(p => p.nickname).join(', ')}
                    </div>
                  </div>

                  {teamMatch.isCompleted && (
                    <div style={{
                      background: 'linear-gradient(135deg, var(--color-success), var(--color-success-light))',
                      color: 'white',
                      borderRadius: 'var(--radius-lg)',
                      padding: 'var(--spacing-2) var(--spacing-4)',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-semibold)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-2)'
                    }}>
                      <span>✅</span>
                      Completed
                    </div>
                  )}
                </div>

                {/* Individual Matches */}
                {hasIndividualMatches ? (
                  <div>
                    <h4 style={{
                      fontSize: 'var(--font-size-base)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-neutral-700)',
                      marginBottom: 'var(--spacing-4)',
                      paddingTop: 'var(--spacing-4)',
                      borderTop: '1px solid var(--color-neutral-200)'
                    }}>
                      Individual Matches:
                    </h4>
                    {teamMatch.individualMatches.map((indMatch) => {
                    const player1 = team1?.players.find(p => p.id === indMatch.player1Id);
                    const player2 = team2?.players.find(p => p.id === indMatch.player2Id);

                      return (
                        <div 
                          key={indMatch.id}
                          style={{
                            background: indMatch.isCompleted ? 'var(--color-success-light)' : 'white',
                            border: '1px solid var(--color-neutral-200)',
                            borderRadius: 'var(--radius-base)',
                            padding: 'var(--spacing-4)',
                            marginBottom: 'var(--spacing-3)',
                            display: 'grid',
                            gridTemplateColumns: '1fr auto 1fr auto',
                            gap: 'var(--spacing-4)',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <strong>{player1?.nickname || 'Unknown'}</strong>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-neutral-600)' }}>
                              {player1?.army}
                            </div>
                            {indMatch.isCompleted && (
                              <div style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-2)' }}>
                                <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)' }}>
                                  {indMatch.tournamentPoints1} pts
                                </span>
                                {' | '}
                                <span>{indMatch.objectivePoints1} obj</span>
                                {' | '}
                                <span>{indMatch.victoryPointsFor1} VP</span>
                              </div>
                            )}
                          </div>

                          <div style={{ 
                            fontSize: 'var(--font-size-lg)', 
                            fontWeight: 'var(--font-weight-bold)',
                            color: 'var(--color-neutral-400)'
                          }}>
                            vs
                          </div>

                          <div>
                            <strong>{player2?.nickname || 'Unknown'}</strong>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-neutral-600)' }}>
                              {player2?.army}
                            </div>
                            {indMatch.isCompleted && (
                              <div style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-2)' }}>
                                <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
                                  {indMatch.tournamentPoints2} pts
                                </span>
                                {' | '}
                                <span>{indMatch.objectivePoints2} obj</span>
                                {' | '}
                                <span>{indMatch.victoryPointsFor2} VP</span>
                              </div>
                            )}
                          </div>

                          {player1 && player2 && (
                          !indMatch.isCompleted ? (
                            <button
                              onClick={() => setSelectedMatch({ individualMatch: indMatch, player1, player2 })}
                              className="btn btn-primary"
                              style={{ fontSize: 'var(--font-size-sm)' }}
                            >
                              <span>📝</span>
                              Enter Results
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedMatch({ individualMatch: indMatch, player1, player2 })}
                              className="btn btn-secondary"
                              style={{ fontSize: 'var(--font-size-sm)' }}
                            >
                              <span>✏️</span>
                              Edit Results
                            </button>
                          )
                        )}
                          
                          {indMatch.isCompleted && (
                            <div style={{
                              color: 'var(--color-success)',
                              fontWeight: 'var(--font-weight-semibold)',
                              fontSize: 'var(--font-size-sm)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 'var(--spacing-2)'
                            }}>
                              <span>✅</span>
                              Complete
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  team1 && team2 && !teamMatch.isCompleted && (
                    <div style={{ marginTop: 'var(--spacing-4)' }}>
                      <PairingSetup
                        teamMatch={teamMatch}
                        team1={team1}
                        team2={team2}
                        onSave={handleSetIndividualPairings}
                      />
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* No matches state */}
      {displayedMatches.length === 0 && pairings.length === 0 && !isViewingCurrentRound && (
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
            <div style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--spacing-4)' }}>
              🎮
            </div>
            <p style={{ color: 'var(--color-neutral-600)', fontSize: 'var(--font-size-lg)' }}>
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
  teamMatch: any;
  team1: any;
  team2: any;
  onSave: (teamMatchId: string, pairings: { player1Id: string; player2Id: string }[]) => void;
}

const PairingSetup: React.FC<PairingSetupProps> = ({ teamMatch, team1, team2, onSave }) => {
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
    return team1.players.filter((player: any) => !selectedPlayerIds.includes(player.id));
  };

  // Get available players for team 2 (exclude already selected)
  const getAvailableTeam2Players = (currentIndex: number) => {
    const selectedPlayerIds = pairings
      .map((p, idx) => idx !== currentIndex ? p.player2Id : null)
      .filter(Boolean);
    return team2.players.filter((player: any) => !selectedPlayerIds.includes(player.id));
  };

  const handleSubmit = () => {
    // Validate all pairings are filled
    if (!pairings.every(p => p.player1Id && p.player2Id)) {
      alert('Please select all players for all matches');
      return;
    }

    // Check for duplicates
    const team1Players = pairings.map(p => p.player1Id);
    const team2Players = pairings.map(p => p.player2Id);
    
    if (new Set(team1Players).size !== 3 || new Set(team2Players).size !== 3) {
      alert('Each player can only be in one match');
      return;
    }

    onSave(teamMatch.id, pairings);
  };

  const isValid = pairings.every(p => p.player1Id && p.player2Id);

  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--color-neutral-50), white)',
      border: '2px dashed var(--color-primary)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--spacing-6)'
    }}>
      <h4 style={{
        fontSize: 'var(--font-size-lg)',
        fontWeight: 'var(--font-weight-semibold)',
        color: 'var(--color-primary)',
        marginBottom: 'var(--spacing-4)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-2)'
      }}>
        <span>🎯</span>
        Set Individual Player Pairings
      </h4>

      {pairings.map((pairing, index) => (
        <div key={index} style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr auto 1fr',
          gap: 'var(--spacing-4)',
          marginBottom: 'var(--spacing-4)',
          alignItems: 'center'
        }}>
          <select
            value={pairing.player1Id}
            onChange={(e) => handlePairingChange(index, 'player1Id', e.target.value)}
            className="form-input"
          >
            <option value="">Select {team1.name} Player</option>
            {getAvailableTeam1Players(index).map((player: any) => (
              <option key={player.id} value={player.id}>
                {player.nickname} ({player.army})
              </option>
            ))}
          </select>

          <span style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-neutral-500)' }}>VS</span>

          <select
            value={pairing.player2Id}
            onChange={(e) => handlePairingChange(index, 'player2Id', e.target.value)}
            className="form-input"
          >
            <option value="">Select {team2.name} Player</option>
            {getAvailableTeam2Players(index).map((player: any) => (
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
        className="btn btn-primary"
        style={{ marginTop: 'var(--spacing-4)', width: '100%' }}
      >
        <span>💾</span>
        Save Individual Pairings
      </button>
    </div>
  );
};

export default Pairings;