import React, { useState } from 'react';
import { Trophy, Target, Crown } from 'lucide-react';
import clsx from 'clsx';
import {
  ResponsiveContainer,
  PieChart, Pie, Cell, Label,
  Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';
import { useTournament } from '../contexts/TournamentContext';
import { calculateTournamentStats } from '../utils/statisticsUtils';
import styles from './Statistics.module.css';

const CHART_COLORS = [
  '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#6366f1',
  '#0891b2', '#f97316', '#a855f7', '#ec4899', '#84cc16', '#14b8a6',
];

const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '0.5rem',
  },
  labelStyle: { color: '#f1f5f9' },
  itemStyle: { color: '#94a3b8' },
};

const winRateColor = (rate: number) => {
  if (rate >= 60) return '#10b981';
  if (rate >= 40) return '#f59e0b';
  return '#ef4444';
};

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

      {/* Army Distribution Pie Chart */}
      <div className="card">
        <h3 className={styles.sectionTitle}>Army Distribution</h3>
        {stats.armyDistribution.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={stats.armyDistribution}
                dataKey="count"
                nameKey="army"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={2}
              >
                <Label
                  content={({ viewBox }) => {
                    if (!viewBox || !('cx' in viewBox)) return null;
                    const { cx, cy } = viewBox as { cx: number; cy: number };
                    return (
                      <g>
                        <text
                          x={cx}
                          y={(cy ?? 0) - 6}
                          textAnchor="middle"
                          fill="#f1f5f9"
                          fontSize={28}
                          fontWeight="bold"
                        >
                          {stats.totalPlayers}
                        </text>
                        <text
                          x={cx}
                          y={(cy ?? 0) + 14}
                          textAnchor="middle"
                          fill="#94a3b8"
                          fontSize={11}
                        >
                          PLAYERS
                        </text>
                      </g>
                    );
                  }}
                />
                {stats.armyDistribution.map((entry, index) => (
                  <Cell
                    key={entry.army}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => {
                  const entry = stats.armyDistribution.find(a => a.army === name);
                  return [
                    `${value} players (${entry?.percentage.toFixed(1) ?? 0}%)`,
                    name,
                  ];
                }}
                {...TOOLTIP_STYLE}
              />
              <Legend
                formatter={(value) => (
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className={styles.emptyText}>No army data available yet.</p>
        )}
      </div>
    </div>
  );

  const renderArmies = () => {
    const radarArmies = stats.armyPerformance.slice(0, 6);
    const maxObj = Math.max(...radarArmies.map(a => a.averageObjectivePoints), 0.01);
    const maxKill = Math.max(...radarArmies.map(a => a.averageKillRatio), 0.01);
    const radarData = [
      {
        metric: 'Win Rate',
        ...Object.fromEntries(radarArmies.map(a => [a.army, Math.round(a.winRate)])),
      },
      {
        metric: 'Objective',
        ...Object.fromEntries(
          radarArmies.map(a => [
            a.army,
            Math.round((a.averageObjectivePoints / maxObj) * 100),
          ])
        ),
      },
      {
        metric: 'Kill Ratio',
        ...Object.fromEntries(
          radarArmies.map(a => [
            a.army,
            Math.round((a.averageKillRatio / maxKill) * 100),
          ])
        ),
      },
    ] as Record<string, string | number>[];

    return (
      <div>
        {stats.armyPerformance.length > 0 ? (
          <>
            {/* Win Rate Bar Chart */}
            <div className="card">
              <h3 className={styles.sectionTitle}>Win Rate by Army</h3>
              <ResponsiveContainer
                width="100%"
                height={Math.max(200, stats.armyPerformance.length * 42)}
              >
                <BarChart
                  data={stats.armyPerformance}
                  layout="vertical"
                  margin={{ top: 0, right: 24, bottom: 0, left: 0 }}
                >
                  <CartesianGrid
                    horizontal={false}
                    stroke="#1e293b"
                  />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tickFormatter={v => `${v}%`}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    axisLine={{ stroke: '#334155' }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="army"
                    width={150}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <ReferenceLine
                    x={50}
                    stroke="#475569"
                    strokeDasharray="4 4"
                    label={{ value: '50%', fill: '#64748b', fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(v: number) => [`${v.toFixed(1)}%`, 'Win Rate']}
                    {...TOOLTIP_STYLE}
                  />
                  <Bar dataKey="winRate" radius={[0, 4, 4, 0]} maxBarSize={28}>
                    {stats.armyPerformance.map((entry) => (
                      <Cell
                        key={entry.army}
                        fill={winRateColor(entry.winRate)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Radar Chart */}
            {radarArmies.length >= 2 && (
              <div className="card">
                <h3 className={styles.sectionTitle}>
                  Multi-Dimensional Comparison
                  <span className={styles.chartSubtitle}>
                    (normalised — Win Rate, Objective Points, Kill Ratio)
                  </span>
                </h3>
                <ResponsiveContainer width="100%" height={320}>
                  <RadarChart cx="50%" cy="50%" outerRadius={110} data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis
                      dataKey="metric"
                      tick={{ fill: '#94a3b8', fontSize: 13 }}
                    />
                    {radarArmies.map((army, index) => (
                      <Radar
                        key={army.army}
                        name={army.army}
                        dataKey={army.army}
                        stroke={CHART_COLORS[index % CHART_COLORS.length]}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                        fillOpacity={0.12}
                        strokeWidth={2}
                      />
                    ))}
                    <Legend
                      formatter={(value) => (
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                          {value}
                        </span>
                      )}
                    />
                    <Tooltip
                      formatter={(v: number, name: string) => [`${v}`, name]}
                      {...TOOLTIP_STYLE}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Performance Table */}
            <div className="card">
              <h3 className={styles.sectionTitle}>Army Performance Analysis</h3>
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
            </div>
          </>
        ) : (
          <div className="card">
            <p className={styles.emptyText}>
              No army performance data available yet. Complete some matches to see
              statistics.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderPlayers = () => {
    const playerBarData = stats.topPerformers.map(p => ({
      name: p.player.nickname,
      'Tournament Points': p.totalTournamentPoints,
      'Win Rate (%)': Math.round(p.winRate),
      'Avg Objective': parseFloat(p.averageObjectivePoints.toFixed(1)),
    }));

    return (
      <div>
        {/* Top Performers Bar Chart */}
        {stats.topPerformers.length > 0 && (
          <div className="card">
            <h3 className={styles.sectionTitle}>Top Performers Overview</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={playerBarData}
                margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
              >
                <CartesianGrid vertical={false} stroke="#1e293b" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'Win Rate (%)') return [`${value}%`, name];
                    if (name === 'Avg Objective') return [value.toFixed(1), name];
                    return [value, name];
                  }}
                  {...TOOLTIP_STYLE}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                      {value}
                    </span>
                  )}
                />
                <Bar
                  dataKey="Tournament Points"
                  fill={CHART_COLORS[0]}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
                <Bar
                  dataKey="Win Rate (%)"
                  fill={CHART_COLORS[1]}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
                <Bar
                  dataKey="Avg Objective"
                  fill={CHART_COLORS[2]}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Performers Table */}
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
  };

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
