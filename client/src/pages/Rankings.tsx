import React, { useState } from 'react';
import {
  Trophy,
  Building2,
  Gamepad2,
  Crown,
  Palette,
  BarChart3,
  Medal,
  AlertCircle,
} from 'lucide-react';
import clsx from 'clsx';
import { useTournament } from '../contexts/TournamentContext';
import {
  calculatePlayerRankings,
  calculateTeamRankings,
  sortPlayerRankings,
  sortTeamRankings,
} from '../utils/rankingUtils';
import { Team, Player } from '../types';
import LoadingSkeleton from '../components/LoadingSkeleton';
import MatchHistoryModal from '../components/MatchHistoryModal';
import type { MatchHistoryEntry } from '../components/MatchHistoryModal';
import styles from './Rankings.module.css';

const Rankings: React.FC = () => {
  const { getTeams, tournament, loading, error } = useTournament();
  const [selectedTeamHistory, setSelectedTeamHistory] = useState<Team | null>(
    null
  );
  const [selectedPlayerHistory, setSelectedPlayerHistory] = useState<{
    player: Player;
    team: Team;
  } | null>(null);

  if (loading) {
    return (
      <div className="container">
        <h2 className={styles.loadingTitle}>Tournament Rankings</h2>
        <div className="card">
          <LoadingSkeleton variant="table-rows" count={5} columns={13} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h2 className={styles.loadingTitle}>Tournament Rankings</h2>
        <div className="alert alert-error">
          <span className={styles.errorIcon}>
            <AlertCircle size={18} />
          </span>
          <strong>Error:</strong> {error}
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
  const getTeamMatchHistory = (team: Team): MatchHistoryEntry[] => {
    const matches: MatchHistoryEntry[] = [];

    teamMatches.forEach((teamMatch) => {
      if (!teamMatch.isCompleted || !teamMatch.individualMatches) return;

      const isTeam1 = teamMatch.team1Id === team.id;
      const isTeam2 = teamMatch.team2Id === team.id;

      if (!isTeam1 && !isTeam2) return;

      const opponentTeam = teams.find(
        (t) => t.id === (isTeam1 ? teamMatch.team2Id : teamMatch.team1Id)
      );

      teamMatch.individualMatches.forEach((match) => {
        if (!match.isCompleted) return;

        const player = team.players.find(
          (p) => p.id === (isTeam1 ? match.player1Id : match.player2Id)
        );
        const opponentPlayer = opponentTeam?.players.find(
          (p) => p.id === (isTeam1 ? match.player2Id : match.player1Id)
        );

        if (!player || !opponentPlayer) return;

        const objectivePoints = isTeam1
          ? match.objectivePoints1
          : match.objectivePoints2;
        const objectivePointsOpponent = isTeam1
          ? match.objectivePoints2
          : match.objectivePoints1;
        const tournamentPoints = isTeam1
          ? match.tournamentPoints1
          : match.tournamentPoints2;
        const victoryPoints = isTeam1
          ? match.victoryPointsFor1
          : match.victoryPointsFor2;

        const result =
          objectivePoints > objectivePointsOpponent
            ? 'Win'
            : objectivePoints < objectivePointsOpponent
              ? 'Loss'
              : 'Draw';

        matches.push({
          round: teamMatch.round,
          opponent: opponentTeam?.name || 'Unknown',
          result,
          tournamentPoints,
          objectivePoints,
          victoryPoints,
          tableNumber: teamMatch.tableNumber,
          player: player.nickname,
          opponentPlayer: opponentPlayer.nickname,
        });
      });
    });

    return matches.sort((a, b) => {
      if (a.round !== b.round) return a.round - b.round;
      return (a.player ?? '').localeCompare(b.player ?? '');
    });
  };

  // Get player match history
  const getPlayerMatchHistory = (player: Player): MatchHistoryEntry[] => {
    const matches: MatchHistoryEntry[] = [];

    teamMatches.forEach((teamMatch) => {
      if (!teamMatch.isCompleted || !teamMatch.individualMatches) return;

      teamMatch.individualMatches.forEach((match) => {
        if (!match.isCompleted) return;

        const isPlayer1 = match.player1Id === player.id;
        const isPlayer2 = match.player2Id === player.id;

        if (!isPlayer1 && !isPlayer2) return;

        const opponentId = isPlayer1 ? match.player2Id : match.player1Id;
        let opponentName = 'Unknown';

        teams.forEach((team) => {
          const foundPlayer = team.players.find((p) => p.id === opponentId);
          if (foundPlayer) {
            opponentName = `${foundPlayer.nickname} (${team.name})`;
          }
        });

        const objectivePoints = isPlayer1
          ? match.objectivePoints1
          : match.objectivePoints2;
        const objectivePointsOpponent = isPlayer1
          ? match.objectivePoints2
          : match.objectivePoints1;
        const result =
          objectivePoints > objectivePointsOpponent
            ? 'Win'
            : objectivePoints < objectivePointsOpponent
              ? 'Loss'
              : 'Draw';

        matches.push({
          round: teamMatch.round,
          opponent: opponentName,
          result,
          tournamentPoints: isPlayer1
            ? match.tournamentPoints1
            : match.tournamentPoints2,
          objectivePoints,
          victoryPoints: isPlayer1
            ? match.victoryPointsFor1
            : match.victoryPointsFor2,
        });
      });
    });

    return matches.sort((a, b) => a.round - b.round);
  };

  const renderRankBadge = (position: number) => {
    if (position === 1) {
      return (
        <span className={clsx(styles.rankBadge, styles.rankGold)}>
          <Medal size={16} />
        </span>
      );
    }
    if (position === 2) {
      return (
        <span className={clsx(styles.rankBadge, styles.rankSilver)}>
          <Medal size={16} />
        </span>
      );
    }
    if (position === 3) {
      return (
        <span className={clsx(styles.rankBadge, styles.rankBronze)}>
          <Medal size={16} />
        </span>
      );
    }
    return (
      <span className={clsx(styles.rankBadge, styles.rankDefault)}>
        {position}
      </span>
    );
  };

  const renderDiff = (value: number) => (
    <span className={value >= 0 ? styles.pointsPositive : styles.pointsNegative}>
      {value >= 0 ? '+' : ''}
      {value}
    </span>
  );

  return (
    <div className={styles.page}>
      <h2 className={styles.pageTitle}>
        <span className={styles.pageTitleIcon}>
          <Trophy size={28} />
        </span>
        <span className={styles.pageTitleText}>Tournament Rankings</span>
      </h2>

      {teams.length === 0 ? (
        <div className="card">
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>
              <Trophy size={48} />
            </div>
            <h3 className={styles.emptyStateTitle}>No Rankings Yet</h3>
            <p className={styles.emptyStateMessage}>
              Rankings will appear once teams are registered and matches are
              played.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Team Rankings */}
          <div className="card">
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>
                <Building2 size={22} />
              </span>
              Team Rankings
              <span className={styles.sectionSubtitle}>
                (includes painted army bonuses)
              </span>
            </h3>

            {teamRankings.length === 0 ? (
              <p className={styles.emptyTableMessage}>
                No matches completed yet. Rankings will appear after matches are
                played.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Team</th>
                      <th>Tournament Pts</th>
                      <th>Obj Pts</th>
                      <th>Obj Against</th>
                      <th>Obj Diff</th>
                      <th>Own VP</th>
                      <th>Enemy VP</th>
                      <th>VP Diff</th>
                      <th>Matches</th>
                      <th>W-D-L</th>
                      <th>Paint Bonus</th>
                      <th>History</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamRankings.map((ranking, index) => (
                      <tr key={ranking.team.id}>
                        <td>{renderRankBadge(index + 1)}</td>
                        <td>
                          <strong>{ranking.team.name}</strong>
                        </td>
                        <td>
                          <strong className={styles.pointsValue}>
                            {ranking.tournamentPoints}
                          </strong>
                        </td>
                        <td>{ranking.objectivePoints}</td>
                        <td>
                          <span className={styles.pointsNegative}>
                            {ranking.objectivePointsAgainst}
                          </span>
                        </td>
                        <td>{renderDiff(ranking.objectivePointsDifference)}</td>
                        <td>
                          <span className={styles.pointsPositive}>
                            {ranking.victoryPointsFor}
                          </span>
                        </td>
                        <td>
                          <span className={styles.pointsNegative}>
                            {ranking.victoryPointsAgainst}
                          </span>
                        </td>
                        <td>{renderDiff(ranking.victoryPointsDifference)}</td>
                        <td>{ranking.matchesPlayed}</td>
                        <td>
                          <span className={styles.wdlRecord}>
                            <span className={styles.wdlWin}>
                              {ranking.wins}
                            </span>
                            <span className={styles.wdlSep}>-</span>
                            <span className={styles.wdlDraw}>
                              {ranking.draws}
                            </span>
                            <span className={styles.wdlSep}>-</span>
                            <span className={styles.wdlLoss}>
                              {ranking.losses}
                            </span>
                          </span>
                        </td>
                        <td>
                          <span
                            className={clsx(
                              styles.paintBadge,
                              ranking.paintedBonus > 0
                                ? styles.paintBadgeActive
                                : styles.paintBadgeInactive
                            )}
                          >
                            +{ranking.paintedBonus}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() =>
                              setSelectedTeamHistory(ranking.team)
                            }
                            className={clsx('btn btn-secondary', styles.viewBtn)}
                          >
                            <span className={styles.viewBtnIcon}>
                              <BarChart3 size={14} />
                            </span>
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Player Rankings */}
          <div className="card">
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>
                <Gamepad2 size={22} />
              </span>
              Individual Player Rankings
              <span className={styles.sectionSubtitle}>
                (excludes painted army bonuses)
              </span>
            </h3>

            {playerRankings.length === 0 ? (
              <p className={styles.emptyTableMessage}>
                No matches completed yet. Rankings will appear after matches are
                played.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Player</th>
                      <th>Team</th>
                      <th>Army</th>
                      <th>Tournament Pts</th>
                      <th>Obj Pts</th>
                      <th>Obj Against</th>
                      <th>Obj Diff</th>
                      <th>Own VP</th>
                      <th>Enemy VP</th>
                      <th>VP Diff</th>
                      <th>Matches</th>
                      <th>W-D-L</th>
                      <th>History</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playerRankings.map((ranking, index) => (
                      <tr key={ranking.player.id}>
                        <td>{renderRankBadge(index + 1)}</td>
                        <td>
                          <div className={styles.playerName}>
                            {ranking.player.isCaptain && (
                              <span className={styles.captainIcon}>
                                <Crown size={14} />
                              </span>
                            )}
                            <strong>{ranking.player.nickname}</strong>
                            {ranking.player.isPainted && (
                              <span className={styles.paintedIcon}>
                                <Palette size={14} />
                              </span>
                            )}
                          </div>
                        </td>
                        <td>{ranking.team.name}</td>
                        <td>
                          <span className={styles.armyTag}>
                            {ranking.player.army}
                          </span>
                        </td>
                        <td>
                          <strong className={styles.pointsValue}>
                            {ranking.tournamentPoints}
                          </strong>
                        </td>
                        <td>{ranking.objectivePoints}</td>
                        <td>
                          <span className={styles.pointsNegative}>
                            {ranking.objectivePointsAgainst}
                          </span>
                        </td>
                        <td>
                          {renderDiff(ranking.objectivePointsDifference)}
                        </td>
                        <td>
                          <span className={styles.pointsPositive}>
                            {ranking.victoryPointsFor}
                          </span>
                        </td>
                        <td>
                          <span className={styles.pointsNegative}>
                            {ranking.victoryPointsAgainst}
                          </span>
                        </td>
                        <td>
                          {renderDiff(ranking.victoryPointsDifference)}
                        </td>
                        <td>{ranking.matchesPlayed}</td>
                        <td>
                          <span className={styles.wdlRecord}>
                            <span className={styles.wdlWin}>
                              {ranking.wins}
                            </span>
                            <span className={styles.wdlSep}>-</span>
                            <span className={styles.wdlDraw}>
                              {ranking.draws}
                            </span>
                            <span className={styles.wdlSep}>-</span>
                            <span className={styles.wdlLoss}>
                              {ranking.losses}
                            </span>
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() =>
                              setSelectedPlayerHistory({
                                player: ranking.player,
                                team: ranking.team,
                              })
                            }
                            className={clsx('btn btn-secondary', styles.viewBtn)}
                          >
                            <span className={styles.viewBtnIcon}>
                              <BarChart3 size={14} />
                            </span>
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
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
