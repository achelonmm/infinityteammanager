import React from 'react';
import { Trophy, Users, Gamepad2, Target, Rocket, Tent, CheckCircle2, Swords, Plus } from 'lucide-react';
import { useTournament } from '../contexts/TournamentContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import styles from './Dashboard.module.css';

const Dashboard: React.FC = () => {
  const { getTeams, getPlayers, tournament, loading, error } = useTournament();

  if (loading) {
    return (
      <div className="container">
        <h2 className={styles.pageTitle}>
          <Trophy className={styles.pageTitleIcon} size={28} />
          Tournament Dashboard
        </h2>
        <LoadingSkeleton variant="stat-card" count={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h2 className={styles.pageTitle}>
          <Trophy className={styles.pageTitleIcon} size={28} />
          Tournament Dashboard
        </h2>
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  const teams = getTeams();
  const players = getPlayers();

  // Calculate army distribution
  const armyDistribution = players.reduce((acc, player) => {
    acc[player.army] = (acc[player.army] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="container animate-fade-in">
      <h2 className={styles.pageTitle}>
        <Trophy className={styles.pageTitleIcon} size={28} />
        Tournament Dashboard
      </h2>

      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>
            <Users />
          </span>
          <h3 className={styles.statLabel}>Total Teams</h3>
          <p className={styles.statValue}>{teams.length}</p>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statIcon}>
            <Gamepad2 />
          </span>
          <h3 className={styles.statLabel}>Total Players</h3>
          <p className={styles.statValue}>{players.length}</p>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statIconAccent}>
            <Target />
          </span>
          <h3 className={styles.statLabel}>Current Round</h3>
          <p className={styles.statValue}>{tournament?.currentRound || 1}</p>
        </div>
      </div>

      <div className={`card animate-slide-in ${styles.statusCard}`}>
        <h3 className={styles.sectionTitle}>
          <Rocket className={styles.sectionTitleIcon} size={24} />
          Tournament Status
        </h3>

        {teams.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>
              <Tent size={48} />
            </div>
            <p className={styles.emptyStateText}>
              No teams registered yet. Start by registering teams for the tournament.
            </p>
            <a
              href="/registration"
              className={`btn btn-primary ${styles.emptyStateCta}`}
            >
              <Plus size={20} />
              Register First Team
            </a>
          </div>
        ) : (
          <div>
            <div className={styles.progressBanner}>
              <span className={styles.progressBannerIcon}>
                <CheckCircle2 />
              </span>
              <div>
                <strong>Tournament Progress:</strong> {teams.length} teams registered, ready for pairings.
              </div>
            </div>

            {Object.keys(armyDistribution).length > 0 && (
              <div className={styles.armySection}>
                <h4 className={styles.armySectionTitle}>
                  <Swords className={styles.armySectionTitleIcon} size={22} />
                  Army Distribution
                </h4>
                <div className={styles.armyGrid}>
                  {Object.entries(armyDistribution).map(([army, count]) => (
                    <div key={army} className={styles.armyBadge}>
                      <span className={styles.armyName}>{army}</span>
                      <strong className={styles.armyCount}>
                        {count}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
