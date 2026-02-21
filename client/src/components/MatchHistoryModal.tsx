import React from 'react';
import { BarChart3, Target } from 'lucide-react';
import clsx from 'clsx';
import Modal from './Modal';
import styles from './MatchHistoryModal.module.css';

export interface MatchHistoryEntry {
  round: number;
  opponent: string;
  result: string;
  tournamentPoints: number;
  objectivePoints: number;
  victoryPoints: number;
  tableNumber?: number;
  player?: string;
  opponentPlayer?: string;
}

interface MatchHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  matches: MatchHistoryEntry[];
  isTeamHistory?: boolean;
}

const MatchHistoryModal: React.FC<MatchHistoryModalProps> = ({
  isOpen,
  onClose,
  title,
  matches,
  isTeamHistory = false,
}) => {
  // Group matches by round for team history
  const groupedMatches = isTeamHistory
    ? matches.reduce((acc, match) => {
        if (!acc[match.round]) {
          acc[match.round] = [];
        }
        acc[match.round].push(match);
        return acc;
      }, {} as Record<number, MatchHistoryEntry[]>)
    : null;

  const resultBadgeClass = (result: string) =>
    clsx(
      styles.resultBadge,
      result === 'Win' && styles.resultWin,
      result === 'Draw' && styles.resultDraw,
      result === 'Loss' && styles.resultLoss
    );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      titleIcon={<BarChart3 size={20} />}
      size="xl"
    >
      {matches.length === 0 ? (
        <p className={styles.emptyMessage}>No matches played yet.</p>
      ) : isTeamHistory && groupedMatches ? (
        <div>
          {Object.entries(groupedMatches).map(([round, roundMatches]) => (
            <div key={round} className={styles.roundGroup}>
              <div className={styles.roundHeader}>
                <span className={styles.roundHeaderIcon}>
                  <Target size={18} />
                </span>
                Round {round} - vs {roundMatches[0].opponent} - Table{' '}
                {roundMatches[0].tableNumber}
              </div>

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th>Opponent</th>
                      <th>Result</th>
                      <th>Tourney Pts</th>
                      <th>Obj Pts</th>
                      <th>VP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roundMatches.map((match, index) => (
                      <tr key={index}>
                        <td>
                          <strong>{match.player}</strong>
                        </td>
                        <td>{match.opponentPlayer}</td>
                        <td>
                          <span className={resultBadgeClass(match.result)}>
                            {match.result}
                          </span>
                        </td>
                        <td>
                          <strong className={styles.pointsHighlight}>
                            {match.tournamentPoints}
                          </strong>
                        </td>
                        <td>{match.objectivePoints}</td>
                        <td>{match.victoryPoints}</td>
                      </tr>
                    ))}
                    {/* Round totals row */}
                    <tr className={styles.roundTotalsRow}>
                      <td colSpan={3} className={styles.roundTotalsLabel}>
                        <strong>Round Total:</strong>
                      </td>
                      <td>
                        <strong className={styles.pointsHighlight}>
                          {roundMatches.reduce(
                            (sum, m) => sum + m.tournamentPoints,
                            0
                          )}
                        </strong>
                      </td>
                      <td>
                        {roundMatches.reduce(
                          (sum, m) => sum + m.objectivePoints,
                          0
                        )}
                      </td>
                      <td>
                        {roundMatches.reduce(
                          (sum, m) => sum + m.victoryPoints,
                          0
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Player history — single table */
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Round</th>
                <th>Opponent</th>
                <th>Result</th>
                <th>Tourney Pts</th>
                <th>Obj Pts</th>
                <th>VP</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match, index) => (
                <tr key={index}>
                  <td>
                    <strong>Round {match.round}</strong>
                  </td>
                  <td>{match.opponent}</td>
                  <td>
                    <span className={resultBadgeClass(match.result)}>
                      {match.result}
                    </span>
                  </td>
                  <td>
                    <strong className={styles.pointsHighlight}>
                      {match.tournamentPoints}
                    </strong>
                  </td>
                  <td>{match.objectivePoints}</td>
                  <td>{match.victoryPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
};

export default MatchHistoryModal;
