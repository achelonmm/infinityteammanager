import React, { useState } from 'react';
import { Trophy, Target, Crown } from 'lucide-react';
import clsx from 'clsx';
import { useTournament } from '../contexts/TournamentContext';
import { calculateTournamentStats } from '../utils/statisticsUtils';
import styles from './Statistics.module.css';

const ARMY_COLORS = [
  styles.armyColor0,
  styles.armyColor1,
  styles.armyColor2,
  styles.armyColor3,
  styles.armyColor4,
  styles.armyColor5,
  styles.armyColor6,
  styles.armyColor7,
  styles.armyColor8,
  styles.armyColor9,
  styles.armyColor10,
];

const Statistics: React.FC = () => {
  const { getTeams, getPlayers, tournament } = useTournament();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'armies' | 'players' | 'achievements'
  >('overview');

  const teams = getTeams();
  const players = getPlayers();
  const teamMatches = tournament?.teamMatches || [];
  const currentRound = tournament?.currentRound || 1;

  const stats = calculateTournamentStats(
    teams,
    players,
    teamMatches,
    currentRound
  );

  const winRateClass = (rate: number) => {
    if (rate >= 60) return styles.winRateHigh;
    if (rate >= 40) return styles.winRateMid;
    return styles.winRateLow;
  };

  const renderOverview = () => (
    <div>
      {/* Key Stats Grid */}
      <div className={styles.statGrid}>
        <div className={clsx(styles.statCard, styles.statCardAccentGreen)}>
          <h3 className={styles.statCardLabel}>Total Teams</h3>
          <p className={clsx(styles.statCardValue, styles.statCardValueGreen)}>
            {stats.totalTeams}
          </p>
        </div>

        <div className={clsx(styles.statCard, styles.statCardAccentCyan)}>
          <h3 className={styles.statCardLabel}>Total Players</h3>
          <p className={clsx(styles.statCardValue, styles.statCardValueCyan)}>
            {stats.totalPlayers}
          </p>
        </div>

        <div className={clsx(styles.statCard, styles.statCardAccentAmber)}>
          <h3 className={styles.statCardLabel}>Current Round</h3>
          <p className={clsx(styles.statCardValue, styles.statCardValueAmber)}>
            {stats.currentRound}
          </p>
        </div>

        <div className={clsx(styles.statCard, styles.statCardAccentError)}>
          <h3 className={styles.statCardLabel}>Match Completion</h3>
          <p className={clsx(styles.statCardValue, styles.statCardValueError)}>
            {stats.totalMatches > 0
              ? Math.round(
                  (stats.completedMatches / stats.totalMatches) * 100
                )
              : 0}
            %
          </p>
          <p className={styles.statCardSub}>
            {stats.completedMatches} / {stats.totalMatches}
          </p>
        </div>
      </div>

      {/* Tournament Progress */}
      <div className="card">
        <h3 className={styles.sectionTitle}>Tournament Progress</h3>

        <div className={styles.progressSection}>
          <div className={styles.progressLabel}>
            <span>Matches Completed</span>
            <span>
              {stats.completedMatches} / {stats.totalMatches}
            </span>
          </div>
          <div className={styles.progressTrack}>
            <div
              className={clsx(styles.progressFill, styles.progressFillGreen)}
              style={{
                width: `${
                  stats.totalMatches > 0
                    ? (stats.completedMatches / stats.totalMatches) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        {stats.totalRounds > 0 && (
          <div className={styles.progressSection}>
            <div className={styles.progressLabel}>
              <span>Round Progress</span>
              <span>
                Round {stats.currentRound}{' '}
                {stats.totalRounds > 1 ? `of ${stats.totalRounds}` : ''}
              </span>
            </div>
            <div className={styles.progressTrack}>
              <div
                className={clsx(styles.progressFill, styles.progressFillCyan)}
                style={{
                  width: `${
                    stats.totalRounds > 0
                      ? ((stats.currentRound - 1) /
                          Math.max(stats.totalRounds, stats.currentRound)) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Army Distribution Chart */}
      <div className="card">
        <h3 className={styles.sectionTitle}>Army Distribution</h3>
        {stats.armyDistribution.length > 0 ? (
          <div>
            {stats.armyDistribution.map((army, index) => (
              <div key={army.army} className={styles.armyItem}>
                <div className={styles.armyLabel}>
                  <span className={styles.armyName}>{army.army}</span>
                  <span className={styles.armyCount}>
                    {army.count} players ({army.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className={styles.armyBar}>
                  <div
                    className={clsx(
                      styles.armyBarFill,
                      ARMY_COLORS[index % ARMY_COLORS.length]
                    )}
                    style={{ width: `${Math.min(army.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.emptyText}>No army data available yet.</p>
        )}
      </div>
    </div>
  );

  const renderArmies = () => (
    <div className="card">
      <h3 className={styles.sectionTitle}>Army Performance Analysis</h3>
      {stats.armyPerformance.length > 0 ? (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Army</th>
                <th>Players</th>
                <th>Games</th>
                <th>Win Rate</th>
                <th>Avg Objective</th>
                <th>Avg Kill Ratio</th>
              </tr>
            </thead>
            <tbody>
              {stats.armyPerformance.map((army) => (
                <tr key={army.army}>
                  <td>
                    <strong>{army.army}</strong>
                  </td>
                  <td>{army.players.length}</td>
                  <td>{army.gamesPlayed}</td>
                  <td>
                    <span className={winRateClass(army.winRate)}>
                      {army.winRate.toFixed(1)}%
                    </span>
                  </td>
                  <td>{army.averageObjectivePoints.toFixed(1)}</td>
                  <td>{army.averageKillRatio.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className={styles.emptyText}>
          No army performance data available yet. Complete some matches to see
          statistics.
        </p>
      )}
    </div>
  );

  const renderPlayers = () => (
    <div>
      {/* Top Performers */}
      <div className="card">
        <h3 className={styles.sectionTitle}>Top Performers (by Win Rate)</h3>
        {stats.topPerformers.length > 0 ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Army</th>
                  <th>Games</th>
                  <th>Win Rate</th>
                  <th>Avg Obj</th>
                  <th>Kill Ratio</th>
                  <th>Total Pts</th>
                </tr>
              </thead>
              <tbody>
                {stats.topPerformers.map((performance, index) => (
                  <tr
                    key={performance.player.id}
                    className={clsx(
                      index === 0 && styles.podiumGold,
                      index === 1 && styles.podiumSilver,
                      index === 2 && styles.podiumBronze
                    )}
                  >
                    <td>
                      <strong>
                        {index < 3 && (
                          <span className={styles.rankPrefix}>
                            #{index + 1}
                          </span>
                        )}
                        {performance.player.nickname}
                      </strong>
                      {performance.player.isCaptain && (
                        <span className={styles.captainBadge}>C</span>
                      )}
                    </td>
                    <td>{performance.player.army}</td>
                    <td>{performance.gamesPlayed}</td>
                    <td>
                      <span className={winRateClass(performance.winRate)}>
                        {performance.winRate.toFixed(1)}%
                      </span>
                    </td>
                    <td>
                      {performance.averageObjectivePoints.toFixed(1)}
                    </td>
                    <td>{performance.killRatio.toFixed(2)}</td>
                    <td>
                      <span className={styles.totalPoints}>
                        {performance.totalTournamentPoints}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className={styles.emptyText}>
            No player performance data available yet. Complete some matches to
            see statistics.
          </p>
        )}
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div>
      {/* Special Achievements */}
      <div className={styles.achievementGrid}>
        {stats.mostKills && (
          <div
            className={clsx(
              'card',
              styles.achievementCard,
              styles.achievementCardKills
            )}
          >
            <h4
              className={clsx(
                styles.achievementTitle,
                styles.achievementTitleKills
              )}
            >
              <span className={styles.achievementIcon}>
                <Trophy size={20} />
              </span>
              Highest Kill Ratio
            </h4>
            <div className={styles.achievementBody}>
              <p className={styles.achievementPlayer}>
                {stats.mostKills.player.nickname}
              </p>
              <p className={styles.achievementArmy}>
                {stats.mostKills.player.army}
              </p>
              <p
                className={clsx(
                  styles.achievementValue,
                  styles.achievementValueKills
                )}
              >
                {stats.mostKills.killRatio.toFixed(2)}
              </p>
              <p className={styles.achievementSub}>
                {stats.mostKills.gamesPlayed} games played
              </p>
            </div>
          </div>
        )}

        {stats.highestObjectiveAverage && (
          <div
            className={clsx(
              'card',
              styles.achievementCard,
              styles.achievementCardObjective
            )}
          >
            <h4
              className={clsx(
                styles.achievementTitle,
                styles.achievementTitleObjective
              )}
            >
              <span className={styles.achievementIcon}>
                <Target size={20} />
              </span>
              Best Objective Player
            </h4>
            <div className={styles.achievementBody}>
              <p className={styles.achievementPlayer}>
                {stats.highestObjectiveAverage.player.nickname}
              </p>
              <p className={styles.achievementArmy}>
                {stats.highestObjectiveAverage.player.army}
              </p>
              <p
                className={clsx(
                  styles.achievementValue,
                  styles.achievementValueObjective
                )}
              >
                {stats.highestObjectiveAverage.averageObjectivePoints.toFixed(1)}
              </p>
              <p className={styles.achievementSub}>
                average objective points
              </p>
            </div>
          </div>
        )}

        {stats.topPerformers.length > 0 && (
          <div
            className={clsx(
              'card',
              styles.achievementCard,
              styles.achievementCardLeader
            )}
          >
            <h4
              className={clsx(
                styles.achievementTitle,
                styles.achievementTitleLeader
              )}
            >
              <span className={styles.achievementIcon}>
                <Crown size={20} />
              </span>
              Tournament Leader
            </h4>
            <div className={styles.achievementBody}>
              <p className={styles.achievementPlayer}>
                {stats.topPerformers[0].player.nickname}
              </p>
              <p className={styles.achievementArmy}>
                {stats.topPerformers[0].player.army}
              </p>
              <p
                className={clsx(
                  styles.achievementValue,
                  styles.achievementValueLeader
                )}
              >
                {stats.topPerformers[0].totalTournamentPoints}
              </p>
              <p className={styles.achievementSub}>
                tournament points (
                {stats.topPerformers[0].winRate.toFixed(1)}% win rate)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Additional Stats */}
      <div className="card">
        <h4 className={styles.sectionTitle}>Tournament Insights</h4>
        <div className={styles.insightsGrid}>
          <div className={styles.insightItem}>
            <h5>Most Popular Army</h5>
            <p className={styles.insightValue}>
              {stats.armyDistribution.length > 0
                ? stats.armyDistribution[0].army
                : 'N/A'}
            </p>
            <p className={styles.insightSub}>
              {stats.armyDistribution.length > 0
                ? `${stats.armyDistribution[0].count} players (${stats.armyDistribution[0].percentage.toFixed(1)}%)`
                : 'No data'}
            </p>
          </div>

          <div className={styles.insightItem}>
            <h5>Best Performing Army</h5>
            <p className={styles.insightValue}>
              {stats.armyPerformance.length > 0
                ? stats.armyPerformance[0].army
                : 'N/A'}
            </p>
            <p className={styles.insightSub}>
              {stats.armyPerformance.length > 0
                ? `${stats.armyPerformance[0].winRate.toFixed(1)}% win rate`
                : 'No data'}
            </p>
          </div>

          <div className={styles.insightItem}>
            <h5>Average Match Completion</h5>
            <p className={styles.insightValue}>
              {stats.totalMatches > 0
                ? (
                    (stats.completedMatches / stats.totalMatches) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </p>
            <p className={styles.insightSub}>
              {stats.completedMatches} of {stats.totalMatches} matches
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container">
      <h2 className={styles.pageTitle}>
        <span className={styles.pageTitleIcon}>
          <Trophy size={28} />
        </span>
        Tournament Statistics
      </h2>

      <div className={styles.tabList} role="tablist">
        <button
          className={clsx(
            styles.tab,
            activeTab === 'overview' && styles.tabActive
          )}
          onClick={() => setActiveTab('overview')}
          role="tab"
          aria-selected={activeTab === 'overview'}
        >
          Overview
        </button>
        <button
          className={clsx(
            styles.tab,
            activeTab === 'armies' && styles.tabActive
          )}
          onClick={() => setActiveTab('armies')}
          role="tab"
          aria-selected={activeTab === 'armies'}
        >
          Army Analysis
        </button>
        <button
          className={clsx(
            styles.tab,
            activeTab === 'players' && styles.tabActive
          )}
          onClick={() => setActiveTab('players')}
          role="tab"
          aria-selected={activeTab === 'players'}
        >
          Player Performance
        </button>
        <button
          className={clsx(
            styles.tab,
            activeTab === 'achievements' && styles.tabActive
          )}
          onClick={() => setActiveTab('achievements')}
          role="tab"
          aria-selected={activeTab === 'achievements'}
        >
          Achievements
        </button>
      </div>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'armies' && renderArmies()}
      {activeTab === 'players' && renderPlayers()}
      {activeTab === 'achievements' && renderAchievements()}
    </div>
  );
};

export default Statistics;
