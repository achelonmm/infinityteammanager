import React, { useState } from 'react';
import { useTournament } from '../contexts/TournamentContext';
import { calculatePlayerRankings, calculateTeamRankings, sortPlayerRankings, sortTeamRankings } from '../utils/rankingUtils';
import { Team, Player, TeamMatch, IndividualMatch } from '../types';

// Match History Modal Component
interface MatchHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  matches: Array<{
    round: number;
    opponent: string;
    result: string;
    tournamentPoints: number;
    objectivePoints: number;
    victoryPoints: number;
    tableNumber?: number;
    player?: string;
    opponentPlayer?: string;
  }>;
  isTeamHistory?: boolean;
}

const MatchHistoryModal: React.FC<MatchHistoryModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  matches,
  isTeamHistory = false 
}) => {
  if (!isOpen) return null;

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
    maxWidth: '1100px',
    width: '95%',
    maxHeight: '90%',
    overflow: 'auto',
    boxShadow: 'var(--shadow-xl)',
    border: '1px solid var(--color-neutral-200)'
  };

  // Group matches by round for team history
  const groupedMatches = isTeamHistory 
    ? matches.reduce((acc, match) => {
        if (!acc[match.round]) {
          acc[match.round] = [];
        }
        acc[match.round].push(match);
        return acc;
      }, {} as Record<number, typeof matches>)
    : null;

  return (
    <div style={containerStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h3 style={{
          fontSize: 'var(--font-size-2xl)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-primary)',
          marginBottom: 'var(--spacing-6)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-3)'
        }}>
          <span>📊</span>
          {title}
        </h3>

        {matches.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-neutral-600)', padding: 'var(--spacing-8)' }}>
            No matches played yet.
          </p>
        ) : isTeamHistory && groupedMatches ? (
          // Team history with rounds grouped
          <div>
            {Object.entries(groupedMatches).map(([round, roundMatches]) => (
              <div key={round} style={{ marginBottom: 'var(--spacing-6)' }}>
                <div style={{
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
                  color: 'white',
                  padding: 'var(--spacing-3) var(--spacing-4)',
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: 'var(--spacing-3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-3)',
                  fontWeight: 'var(--font-weight-bold)'
                }}>
                  <span style={{ fontSize: 'var(--font-size-lg)' }}>🎯</span>
                  Round {round} - vs {roundMatches[0].opponent} - Table {roundMatches[0].tableNumber}
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{
                          background: 'var(--color-neutral-100)',
                          padding: 'var(--spacing-3)',
                          textAlign: 'left',
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: 'var(--font-weight-semibold)',
                          borderBottom: '2px solid var(--color-neutral-300)'
                        }}>Player</th>
                        <th style={{
                          background: 'var(--color-neutral-100)',
                          padding: 'var(--spacing-3)',
                          textAlign: 'left',
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: 'var(--font-weight-semibold)',
                          borderBottom: '2px solid var(--color-neutral-300)'
                        }}>Opponent</th>
                        <th style={{
                          background: 'var(--color-neutral-100)',
                          padding: 'var(--spacing-3)',
                          textAlign: 'left',
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: 'var(--font-weight-semibold)',
                          borderBottom: '2px solid var(--color-neutral-300)'
                        }}>Result</th>
                        <th style={{
                          background: 'var(--color-neutral-100)',
                          padding: 'var(--spacing-3)',
                          textAlign: 'left',
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: 'var(--font-weight-semibold)',
                          borderBottom: '2px solid var(--color-neutral-300)'
                        }}>Tourney Pts</th>
                        <th style={{
                          background: 'var(--color-neutral-100)',
                          padding: 'var(--spacing-3)',
                          textAlign: 'left',
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: 'var(--font-weight-semibold)',
                          borderBottom: '2px solid var(--color-neutral-300)'
                        }}>Obj Pts</th>
                        <th style={{
                          background: 'var(--color-neutral-100)',
                          padding: 'var(--spacing-3)',
                          textAlign: 'left',
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: 'var(--font-weight-semibold)',
                          borderBottom: '2px solid var(--color-neutral-300)'
                        }}>VP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roundMatches.map((match, index) => (
                        <tr key={index} style={{
                          background: index % 2 === 0 ? 'white' : 'var(--color-neutral-50)'
                        }}>
                          <td style={{ padding: 'var(--spacing-3)', borderBottom: '1px solid var(--color-neutral-200)' }}>
                            <strong>{match.player}</strong>
                          </td>
                          <td style={{ padding: 'var(--spacing-3)', borderBottom: '1px solid var(--color-neutral-200)' }}>
                            {match.opponentPlayer}
                          </td>
                          <td style={{ padding: 'var(--spacing-3)', borderBottom: '1px solid var(--color-neutral-200)' }}>
                            <span style={{
                              background: match.result === 'Win' ? 'var(--color-success)' :
                                         match.result === 'Draw' ? 'var(--color-warning)' :
                                         'var(--color-error)',
                              color: 'white',
                              padding: 'var(--spacing-1) var(--spacing-3)',
                              borderRadius: 'var(--radius-full)',
                              fontSize: 'var(--font-size-xs)',
                              fontWeight: 'var(--font-weight-semibold)'
                            }}>
                              {match.result}
                            </span>
                          </td>
                          <td style={{ padding: 'var(--spacing-3)', borderBottom: '1px solid var(--color-neutral-200)' }}>
                            <strong style={{ color: 'var(--color-primary)' }}>{match.tournamentPoints}</strong>
                          </td>
                          <td style={{ padding: 'var(--spacing-3)', borderBottom: '1px solid var(--color-neutral-200)' }}>
                            {match.objectivePoints}
                          </td>
                          <td style={{ padding: 'var(--spacing-3)', borderBottom: '1px solid var(--color-neutral-200)' }}>
                            {match.victoryPoints}
                          </td>
                        </tr>
                      ))}
                      {/* Round totals row */}
                      <tr style={{ 
                        background: 'linear-gradient(135deg, var(--color-neutral-100), var(--color-neutral-50))',
                        fontWeight: 'var(--font-weight-bold)'
                      }}>
                        <td colSpan={3} style={{ 
                          padding: 'var(--spacing-3)', 
                          borderBottom: '2px solid var(--color-neutral-300)',
                          textAlign: 'right'
                        }}>
                          <strong>Round Total:</strong>
                        </td>
                        <td style={{ padding: 'var(--spacing-3)', borderBottom: '2px solid var(--color-neutral-300)' }}>
                          <strong style={{ color: 'var(--color-primary)' }}>
                            {roundMatches.reduce((sum, m) => sum + m.tournamentPoints, 0)}
                          </strong>
                        </td>
                        <td style={{ padding: 'var(--spacing-3)', borderBottom: '2px solid var(--color-neutral-300)' }}>
                          {roundMatches.reduce((sum, m) => sum + m.objectivePoints, 0)}
                        </td>
                        <td style={{ padding: 'var(--spacing-3)', borderBottom: '2px solid var(--color-neutral-300)' }}>
                          {roundMatches.reduce((sum, m) => sum + m.victoryPoints, 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Player history (existing single table)
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
                    color: 'white',
                    padding: 'var(--spacing-3)',
                    textAlign: 'left',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-semibold)'
                  }}>Round</th>
                  <th style={{
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
                    color: 'white',
                    padding: 'var(--spacing-3)',
                    textAlign: 'left',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-semibold)'
                  }}>Opponent</th>
                  <th style={{
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
                    color: 'white',
                    padding: 'var(--spacing-3)',
                    textAlign: 'left',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-semibold)'
                  }}>Result</th>
                  <th style={{
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
                    color: 'white',
                    padding: 'var(--spacing-3)',
                    textAlign: 'left',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-semibold)'
                  }}>Tourney Pts</th>
                  <th style={{
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
                    color: 'white',
                    padding: 'var(--spacing-3)',
                    textAlign: 'left',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-semibold)'
                  }}>Obj Pts</th>
                  <th style={{
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
                    color: 'white',
                    padding: 'var(--spacing-3)',
                    textAlign: 'left',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-semibold)'
                  }}>VP</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match, index) => (
                  <tr key={index} style={{
                    background: index % 2 === 0 ? 'white' : 'var(--color-neutral-50)'
                  }}>
                    <td style={{ padding: 'var(--spacing-3)', borderBottom: '1px solid var(--color-neutral-200)' }}>
                      <strong>Round {match.round}</strong>
                    </td>
                    <td style={{ padding: 'var(--spacing-3)', borderBottom: '1px solid var(--color-neutral-200)' }}>
                      {match.opponent}
                    </td>
                    <td style={{ padding: 'var(--spacing-3)', borderBottom: '1px solid var(--color-neutral-200)' }}>
                      <span style={{
                        background: match.result === 'Win' ? 'var(--color-success)' :
                                   match.result === 'Draw' ? 'var(--color-warning)' :
                                   'var(--color-error)',
                        color: 'white',
                        padding: 'var(--spacing-1) var(--spacing-3)',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 'var(--font-weight-semibold)'
                      }}>
                        {match.result}
                      </span>
                    </td>
                    <td style={{ padding: 'var(--spacing-3)', borderBottom: '1px solid var(--color-neutral-200)' }}>
                      <strong style={{ color: 'var(--color-primary)' }}>{match.tournamentPoints}</strong>
                    </td>
                    <td style={{ padding: 'var(--spacing-3)', borderBottom: '1px solid var(--color-neutral-200)' }}>
                      {match.objectivePoints}
                    </td>
                    <td style={{ padding: 'var(--spacing-3)', borderBottom: '1px solid var(--color-neutral-200)' }}>
                      {match.victoryPoints}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: 'var(--spacing-6)', textAlign: 'center' }}>
          <button onClick={onClose} className="btn btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Rankings: React.FC = () => {
  const { getTeams, tournament, loading, error } = useTournament();
  const [selectedTeamHistory, setSelectedTeamHistory] = useState<Team | null>(null);
  const [selectedPlayerHistory, setSelectedPlayerHistory] = useState<{ player: Player; team: Team } | null>(null);
  
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
          Tournament Rankings
        </h2>
        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
          <div className="loading-spinner" style={{ margin: '0 auto var(--spacing-4)' }}></div>
          <p style={{ color: 'var(--color-neutral-600)' }}>Loading rankings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h2 style={{ 
          marginBottom: 'var(--spacing-8)', 
          color: 'var(--color-primary)',
          fontSize: 'var(--font-size-3xl)',
          fontWeight: 'var(--font-weight-bold)',
          textAlign: 'center'
        }}>
          Tournament Rankings
        </h2>
        <div className="alert alert-error">
          <strong>⚠️ Error:</strong> {error}
        </div>
      </div>
    );
  }

  const teams = getTeams();
  const teamMatches = tournament?.teamMatches || [];

  // Calculate rankings
  const playerRankings = sortPlayerRankings(
    calculatePlayerRankings(teams, teamMatches)
  );

  const teamRankings = sortTeamRankings(
    calculateTeamRankings(teams, teamMatches)
  );

  // Get team match history (showing individual games)
const getTeamMatchHistory = (team: Team) => {
  const matches: Array<{
    round: number;
    opponent: string;
    result: string;
    tournamentPoints: number;
    objectivePoints: number;
    victoryPoints: number;
    tableNumber: number;
    player: string;
    opponentPlayer: string;
  }> = [];

  teamMatches.forEach(teamMatch => {
    if (!teamMatch.isCompleted || !teamMatch.individualMatches) return;

    const isTeam1 = teamMatch.team1Id === team.id;
    const isTeam2 = teamMatch.team2Id === team.id;

    if (!isTeam1 && !isTeam2) return;

    const opponentTeam = teams.find(t => t.id === (isTeam1 ? teamMatch.team2Id : teamMatch.team1Id));
    
    // Process each individual match
    teamMatch.individualMatches.forEach(match => {
      if (!match.isCompleted) return;

      const player = team.players.find(p => p.id === (isTeam1 ? match.player1Id : match.player2Id));
      const opponentPlayer = opponentTeam?.players.find(p => p.id === (isTeam1 ? match.player2Id : match.player1Id));

      if (!player || !opponentPlayer) return;

      const objectivePoints = isTeam1 ? match.objectivePoints1 : match.objectivePoints2;
      const objectivePointsOpponent = isTeam1 ? match.objectivePoints2 : match.objectivePoints1;
      const tournamentPoints = isTeam1 ? match.tournamentPoints1 : match.tournamentPoints2;
      const victoryPoints = isTeam1 ? match.victoryPointsFor1 : match.victoryPointsFor2;

      const result = objectivePoints > objectivePointsOpponent ? 'Win' :
                     objectivePoints < objectivePointsOpponent ? 'Loss' : 'Draw';

      matches.push({
        round: teamMatch.round,
        opponent: opponentTeam?.name || 'Unknown',
        result,
        tournamentPoints,
        objectivePoints,
        victoryPoints,
        tableNumber: teamMatch.tableNumber,
        player: player.nickname,
        opponentPlayer: opponentPlayer.nickname
      });
    });
  });

  // Sort by round, then by player name for consistent grouping
  return matches.sort((a, b) => {
    if (a.round !== b.round) return a.round - b.round;
    return a.player.localeCompare(b.player);
  });
};

  // Get player match history
  const getPlayerMatchHistory = (player: Player) => {
    const matches: Array<{
      round: number;
      opponent: string;
      result: string;
      tournamentPoints: number;
      objectivePoints: number;
      victoryPoints: number;
    }> = [];

    teamMatches.forEach(teamMatch => {
      if (!teamMatch.isCompleted || !teamMatch.individualMatches) return;

      teamMatch.individualMatches.forEach(match => {
        if (!match.isCompleted) return;

        const isPlayer1 = match.player1Id === player.id;
        const isPlayer2 = match.player2Id === player.id;

        if (!isPlayer1 && !isPlayer2) return;

        // Find opponent
        const opponentId = isPlayer1 ? match.player2Id : match.player1Id;
        let opponentName = 'Unknown';
        
        teams.forEach(team => {
          const foundPlayer = team.players.find(p => p.id === opponentId);
          if (foundPlayer) {
            opponentName = `${foundPlayer.nickname} (${team.name})`;
          }
        });

        const objectivePoints = isPlayer1 ? match.objectivePoints1 : match.objectivePoints2;
        const objectivePointsOpponent = isPlayer1 ? match.objectivePoints2 : match.objectivePoints1;
        const result = objectivePoints > objectivePointsOpponent ? 'Win' :
                       objectivePoints < objectivePointsOpponent ? 'Loss' : 'Draw';

        matches.push({
          round: teamMatch.round,
          opponent: opponentName,
          result,
          tournamentPoints: isPlayer1 ? match.tournamentPoints1 : match.tournamentPoints2,
          objectivePoints,
          victoryPoints: isPlayer1 ? match.victoryPointsFor1 : match.victoryPointsFor2
        });
      });
    });

    return matches.sort((a, b) => a.round - b.round);
  };

  const containerStyle = {
    maxWidth: '1600px',
    margin: '0 auto',
    padding: 'var(--spacing-4)',
  };

  const cardStyle = {
    background: 'white',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-lg)',
    padding: 'var(--spacing-6)',
    marginBottom: 'var(--spacing-6)',
    border: '1px solid var(--color-neutral-200)',
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse' as const,
    marginTop: 'var(--spacing-4)',
  };

  const headerStyle = {
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
    color: 'white',
    padding: 'var(--spacing-4)',
    textAlign: 'left' as const,
    fontWeight: 'var(--font-weight-semibold)',
    fontSize: 'var(--font-size-sm)',
  };

  const cellStyle = {
    padding: 'var(--spacing-4)',
    borderBottom: '1px solid var(--color-neutral-200)',
  };

  const getRankingBadge = (position: number) => {
    if (position === 1) return { emoji: '🥇', color: '#FFD700' };
    if (position === 2) return { emoji: '🥈', color: '#C0C0C0' };
    if (position === 3) return { emoji: '🥉', color: '#CD7F32' };
    return { emoji: `${position}`, color: 'var(--color-neutral-600)' };
  };

  return (
    <div style={containerStyle} className="animate-fade-in">
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
        🏆 Tournament Rankings
      </h2>

      {teams.length === 0 ? (
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
            <div style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--spacing-4)' }}>
              🏆
            </div>
            <h3 style={{ color: 'var(--color-primary)', marginBottom: 'var(--spacing-4)' }}>
              No Rankings Yet
            </h3>
            <p style={{ color: 'var(--color-neutral-600)' }}>
              Rankings will appear once teams are registered and matches are played.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Team Rankings */}
          <div style={cardStyle}>
            <h3 style={{ 
              marginBottom: 'var(--spacing-6)',
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-3)'
            }}>
              <span>🏢</span>
              Team Rankings
              <span style={{ 
                fontSize: 'var(--font-size-sm)', 
                color: 'var(--color-neutral-600)',
                fontWeight: 'var(--font-weight-normal)'
              }}>
                (includes painted army bonuses)
              </span>
            </h3>
            
            {teamRankings.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--color-neutral-600)', fontStyle: 'italic' }}>
                No matches completed yet. Rankings will appear after matches are played.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={headerStyle}>Rank</th>
                      <th style={headerStyle}>Team</th>
                      <th style={headerStyle}>Tournament Pts</th>
                      <th style={headerStyle}>Obj Pts</th>
                      <th style={headerStyle}>Obj Against</th>
                      <th style={headerStyle}>Obj Diff</th>
                      <th style={headerStyle}>Own VP</th>
                      <th style={headerStyle}>Enemy VP</th>
                      <th style={headerStyle}>VP Diff</th>
                      <th style={headerStyle}>Matches</th>
                      <th style={headerStyle}>W-D-L</th>
                      <th style={headerStyle}>Paint Bonus</th>
                      <th style={headerStyle}>History</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamRankings.map((ranking, index) => {
                      const badge = getRankingBadge(index + 1);
                      return (
                        <tr key={ranking.team.id} style={{ 
                          background: index % 2 === 0 ? 'white' : 'var(--color-neutral-50)' 
                        }}>
                          <td style={cellStyle}>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 'var(--spacing-2)',
                              fontWeight: 'var(--font-weight-bold)',
                              color: badge.color
                            }}>
                              <span style={{ fontSize: 'var(--font-size-lg)' }}>
                                {badge.emoji}
                              </span>
                            </div>
                          </td>
                          <td style={cellStyle}>
                            <strong>{ranking.team.name}</strong>
                          </td>
                          <td style={cellStyle}>
                            <strong style={{ color: 'var(--color-primary)' }}>
                              {ranking.tournamentPoints}
                            </strong>
                          </td>
                          <td style={cellStyle}>{ranking.objectivePoints}</td>
                          <td style={cellStyle}>
                            <span style={{ color: 'var(--color-error)' }}>
                              {ranking.objectivePointsAgainst}
                            </span>
                          </td>
                          <td style={cellStyle}>
                            <span style={{ 
                              color: ranking.objectivePointsDifference >= 0 ? 
                                'var(--color-success)' : 'var(--color-error)',
                              fontWeight: 'var(--font-weight-semibold)'
                            }}>
                              {ranking.objectivePointsDifference >= 0 ? '+' : ''}
                              {ranking.objectivePointsDifference}
                            </span>
                          </td>
                          <td style={cellStyle}>
                            <span style={{ color: 'var(--color-success)' }}>
                              {ranking.victoryPointsFor}
                            </span>
                          </td>
                          <td style={cellStyle}>
                            <span style={{ color: 'var(--color-error)' }}>
                              {ranking.victoryPointsAgainst}
                            </span>
                          </td>
                          <td style={cellStyle}>
                            <span style={{ 
                              color: ranking.victoryPointsDifference >= 0 ? 
                                'var(--color-success)' : 'var(--color-error)',
                              fontWeight: 'var(--font-weight-semibold)'
                            }}>
                              {ranking.victoryPointsDifference >= 0 ? '+' : ''}
                              {ranking.victoryPointsDifference}
                            </span>
                          </td>
                          <td style={cellStyle}>{ranking.matchesPlayed}</td>
                          <td style={cellStyle}>
                            <span style={{ color: 'var(--color-success)' }}>{ranking.wins}</span>-
                            <span style={{ color: 'var(--color-warning)' }}>{ranking.draws}</span>-
                            <span style={{ color: 'var(--color-error)' }}>{ranking.losses}</span>
                          </td>
                          <td style={cellStyle}>
                            <span style={{ 
                              background: ranking.paintedBonus > 0 ? 'var(--color-success)' : 'var(--color-neutral-200)',
                              color: ranking.paintedBonus > 0 ? 'white' : 'var(--color-neutral-600)',
                              padding: 'var(--spacing-1) var(--spacing-3)',
                              borderRadius: 'var(--radius-full)',
                              fontSize: 'var(--font-size-sm)',
                              fontWeight: 'var(--font-weight-medium)'
                            }}>
                              +{ranking.paintedBonus}
                            </span>
                          </td>
                          <td style={cellStyle}>
                            <button
                              onClick={() => setSelectedTeamHistory(ranking.team)}
                              className="btn btn-secondary"
                              style={{ fontSize: 'var(--font-size-sm)', padding: 'var(--spacing-2) var(--spacing-3)' }}
                            >
                              <span>📊</span>
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Player Rankings */}
          <div style={cardStyle}>
            <h3 style={{ 
              marginBottom: 'var(--spacing-6)',
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-3)'
            }}>
              <span>🎮</span>
              Individual Player Rankings
              <span style={{ 
                fontSize: 'var(--font-size-sm)', 
                color: 'var(--color-neutral-600)',
                fontWeight: 'var(--font-weight-normal)'
              }}>
                (excludes painted army bonuses)
              </span>
            </h3>
            
            {playerRankings.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--color-neutral-600)', fontStyle: 'italic' }}>
                No matches completed yet. Rankings will appear after matches are played.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={headerStyle}>Rank</th>
                      <th style={headerStyle}>Player</th>
                      <th style={headerStyle}>Team</th>
                      <th style={headerStyle}>Army</th>
                      <th style={headerStyle}>Tournament Pts</th>
                      <th style={headerStyle}>Obj Pts</th>
                      <th style={headerStyle}>Obj Against</th>
                      <th style={headerStyle}>Obj Diff</th>
                      <th style={headerStyle}>Own VP</th>
                      <th style={headerStyle}>Enemy VP</th>
                      <th style={headerStyle}>VP Diff</th>
                      <th style={headerStyle}>Matches</th>
                      <th style={headerStyle}>W-D-L</th>
                      <th style={headerStyle}>History</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playerRankings.map((ranking, index) => {
                      const badge = getRankingBadge(index + 1);
                      return (
                        <tr key={ranking.player.id} style={{ 
                          background: index % 2 === 0 ? 'white' : 'var(--color-neutral-50)' 
                        }}>
                          <td style={cellStyle}>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 'var(--spacing-2)',
                              fontWeight: 'var(--font-weight-bold)',
                              color: badge.color
                            }}>
                              <span style={{ fontSize: 'var(--font-size-lg)' }}>
                                {badge.emoji}
                              </span>
                            </div>
                          </td>
                          <td style={cellStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                              {ranking.player.isCaptain && (
                                <span style={{ fontSize: 'var(--font-size-sm)' }}>👑</span>
                              )}
                              <strong>{ranking.player.nickname}</strong>
                              {ranking.player.isPainted && (
                                <span style={{ fontSize: 'var(--font-size-sm)' }}>🎨</span>
                              )}
                            </div>
                          </td>
                          <td style={cellStyle}>{ranking.team.name}</td>
                          <td style={cellStyle}>
                            <span style={{ 
                              background: 'var(--color-neutral-100)',
                              padding: 'var(--spacing-1) var(--spacing-3)',
                              borderRadius: 'var(--radius-full)',
                              fontSize: 'var(--font-size-sm)'
                            }}>
                              {ranking.player.army}
                            </span>
                          </td>
                          <td style={cellStyle}>
                            <strong style={{ color: 'var(--color-primary)' }}>
                              {ranking.tournamentPoints}
                            </strong>
                          </td>
                          <td style={cellStyle}>{ranking.objectivePoints}</td>
                          <td style={cellStyle}>
                            <span style={{ color: 'var(--color-error)' }}>
                              {ranking.objectivePointsAgainst}
                            </span>
                          </td>
                          <td style={cellStyle}>
                            <span style={{ 
                              color: ranking.objectivePointsDifference >= 0 ? 
                                'var(--color-success)' : 'var(--color-error)',
                              fontWeight: 'var(--font-weight-semibold)'
                            }}>
                              {ranking.objectivePointsDifference >= 0 ? '+' : ''}
                              {ranking.objectivePointsDifference}
                            </span>
                          </td>
                          <td style={cellStyle}>
                            <span style={{ color: 'var(--color-success)' }}>
                              {ranking.victoryPointsFor}
                            </span>
                          </td>
                          <td style={cellStyle}>
                            <span style={{ color: 'var(--color-error)' }}>
                              {ranking.victoryPointsAgainst}
                            </span>
                          </td>
                          <td style={cellStyle}>
                            <span style={{ 
                              color: ranking.victoryPointsDifference >= 0 ? 
                                'var(--color-success)' : 'var(--color-error)',
                              fontWeight: 'var(--font-weight-semibold)'
                            }}>
                              {ranking.victoryPointsDifference >= 0 ? '+' : ''}
                              {ranking.victoryPointsDifference}
                            </span>
                          </td>
                          <td style={cellStyle}>{ranking.matchesPlayed}</td>
                          <td style={cellStyle}>
                            <span style={{ color: 'var(--color-success)' }}>{ranking.wins}</span>-
                            <span style={{ color: 'var(--color-warning)' }}>{ranking.draws}</span>-
                            <span style={{ color: 'var(--color-error)' }}>{ranking.losses}</span>
                          </td>
                          <td style={cellStyle}>
                          <button
                            onClick={() => setSelectedPlayerHistory({ player: ranking.player, team: ranking.team })}
                            className="btn btn-secondary"
                            style={{ fontSize: 'var(--font-size-sm)', padding: 'var(--spacing-2) var(--spacing-3)' }}
                          >
                          <span>📊</span>
                          View
                          </button>
                          </td>
                          </tr>
                          );
                          })}
                          </tbody>
                          </table>
                          </div>
                          )}
                          </div>
                          </>
    )}
    {/* Team Match History Modal */}
{selectedTeamHistory && (
  <MatchHistoryModal
    isOpen={true}
    onClose={() => setSelectedTeamHistory(null)}
    title={`${selectedTeamHistory.name} - Match History`}
    matches={getTeamMatchHistory(selectedTeamHistory)}
    isTeamHistory={true}
  />
)}

{/* Player Match History Modal */}
{selectedPlayerHistory && (
  <MatchHistoryModal
    isOpen={true}
    onClose={() => setSelectedPlayerHistory(null)}
    title={`${selectedPlayerHistory.player.nickname} (${selectedPlayerHistory.team.name}) - Match History`}
    matches={getPlayerMatchHistory(selectedPlayerHistory.player)}
    isTeamHistory={false}
  />
)}
    </div>
  );
};
export default Rankings;