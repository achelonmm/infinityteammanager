import React, { useState } from 'react';
import clsx from 'clsx';
import {
  Users,
  Search,
  Swords,
  RotateCcw,
  Building2,
  Gamepad2,
  UserPlus,
  Trash2,
  Pencil,
  Crown,
  Palette,
  Rocket,
  AlertCircle,
} from 'lucide-react';
import { useTournament } from '../contexts/TournamentContext';
import { useToast } from '../contexts/ToastContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EditTeamForm from '../components/EditTeamForm';
import EditPlayerForm from '../components/EditPlayerForm';
import { Team, Player } from '../types';
import styles from './TeamsPlayers.module.css';

const TeamsPlayers: React.FC = () => {
  const { getTeams, getPlayers, deleteTeam, updateTeam, updatePlayer, loading, error } = useTournament();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'teams' | 'players'>('teams');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArmy, setFilterArmy] = useState('');

  // Edit modal states
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  // Get fresh data - this will re-run whenever tournament context updates
  const teams = getTeams();
  const players = getPlayers();

  // Get unique armies for filter
  const uniqueArmies = Array.from(new Set(players.map(p => p.army))).sort();

  // Filter players based on search and army filter
  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teams.find(t => t.id === player.teamId)?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArmy = !filterArmy || player.army === filterArmy;
    return matchesSearch && matchesArmy;
  });

  // Filter teams based on search
  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.players.some(player => player.nickname.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    const confirmed = await toast.confirm(
      `Are you sure you want to delete team "${teamName}"? This action cannot be undone.`,
      { variant: 'danger', confirmLabel: 'Delete' }
    );
    if (confirmed) {
      try {
        await deleteTeam(teamId);
        toast.success('Team removed successfully!');
      } catch (err) {
        console.error('Error deleting team:', err);
        toast.error('Error deleting team. Please try again.');
      }
    }
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
  };

  const handleSaveTeam = async (teamId: string, updates: { name: string; captainId: string; players?: any[] }) => {
    try {
      await updateTeam(teamId, updates);
      setEditingTeam(null);
      toast.success('Team updated successfully!');
    } catch (err) {
      console.error('Error updating team:', err);
      throw err;
    }
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
  };

  const handleSavePlayer = async (playerId: string, updates: Partial<Player>) => {
    try {
      await updatePlayer(playerId, updates);
      setEditingPlayer(null);
      toast.success('Player updated successfully!');
    } catch (err) {
      console.error('Error updating player:', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="container">
        <h2 className={styles.pageTitle}>
          <Users size={28} className={styles.pageTitleIcon} />
          Teams &amp; Players Management
        </h2>
        <div className="card">
          <LoadingSkeleton variant="table-rows" count={5} columns={7} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h2 className={styles.pageTitle}>
          <Users size={28} className={styles.pageTitleIcon} />
          Teams &amp; Players Management
        </h2>
        <div className="alert alert-error">
          <AlertCircle size={18} className={styles.errorIcon} />
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container animate-fade-in">
        <h2 className={styles.pageTitle}>
          <Users size={28} className={styles.pageTitleIcon} />
          Teams &amp; Players Management
        </h2>

        {/* Search and Filter Bar */}
        <div className={clsx('card', styles.filterBar)}>
          <div className={styles.filterGrid}>
            <div className={clsx('form-group', styles.formGroupCompact)}>
              <label className={clsx('form-label', styles.labelWithIcon)}>
                <Search size={14} className={styles.labelIcon} />
                Search:
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                placeholder="Search teams or players..."
              />
            </div>

            {activeTab === 'players' && (
              <div className={clsx('form-group', styles.formGroupCompact)}>
                <label className={clsx('form-label', styles.labelWithIcon)}>
                  <Swords size={14} className={styles.labelIcon} />
                  Filter by Army:
                </label>
                <select
                  value={filterArmy}
                  onChange={(e) => setFilterArmy(e.target.value)}
                  className="form-input"
                >
                  <option value="">All Armies</option>
                  {uniqueArmies.map(army => (
                    <option key={army} value={army}>{army}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => {
                setSearchTerm('');
                setFilterArmy('');
              }}
              className={clsx('btn btn-outline', styles.clearBtn)}
            >
              <RotateCcw size={16} />
              Clear Filters
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabBar} role="tablist">
          <button
            className={clsx(styles.tab, activeTab === 'teams' && styles.tabActive)}
            onClick={() => setActiveTab('teams')}
            role="tab"
            aria-selected={activeTab === 'teams'}
          >
            <Building2 size={18} />
            Teams ({filteredTeams.length})
          </button>
          <button
            className={clsx(styles.tab, activeTab === 'players' && styles.tabActive)}
            onClick={() => setActiveTab('players')}
            role="tab"
            aria-selected={activeTab === 'players'}
          >
            <Gamepad2 size={18} />
            Players ({filteredPlayers.length})
          </button>
        </div>

        <div className={clsx('card', styles.contentCard)}>
          {loading && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
            </div>
          )}

          {activeTab === 'teams' ? (
            <div className="animate-fade-in">
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>
                  <Building2 size={22} className={styles.sectionTitleIcon} />
                  Teams Management
                </h3>
                <a
                  href="/registration"
                  className="btn btn-success"
                >
                  <UserPlus size={18} />
                  Add New Team
                </a>
              </div>

              {filteredTeams.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    {searchTerm ? <Search size={48} /> : <Rocket size={48} />}
                  </div>
                  <p className={styles.emptyText}>
                    {searchTerm ? 'No teams found matching your search.' : 'No teams registered yet.'}
                  </p>
                  {!searchTerm && (
                    <a href="/registration" className="btn btn-primary">
                      <Rocket size={18} />
                      Register the first team
                    </a>
                  )}
                </div>
              ) : (
                <div>
                  {filteredTeams.map((team) => {
                    const captain = team.players.find(p => p.isCaptain);
                    return (
                      <div
                        key={team.id}
                        className={styles.teamCard}
                      >
                        <div className={styles.teamCardGrid}>
                          <div className={styles.teamAvatar}>
                            {team.name.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <h4 className={styles.teamName}>
                              {team.name}
                            </h4>
                            <div className={styles.teamMeta}>
                              <div>
                                <span className={styles.metaLabel}>
                                  <Crown size={14} className={styles.metaIcon} />
                                  Captain:
                                </span>{' '}
                                {captain?.nickname || 'No captain assigned'}
                              </div>
                              <div>
                                <span className={styles.metaLabel}>
                                  <Users size={14} className={styles.metaIcon} />
                                  Players:
                                </span>{' '}
                                {team.players.map(p => p.nickname).join(', ')}
                              </div>
                            </div>
                          </div>

                          <div className={styles.teamActions}>
                            <button
                              className={clsx('btn btn-secondary', styles.btnSm)}
                              onClick={() => handleEditTeam(team)}
                            >
                              <Pencil size={14} />
                              Edit
                            </button>
                            <button
                              className={clsx('btn btn-warning', styles.btnSm)}
                              onClick={() => handleDeleteTeam(team.id, team.name)}
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="animate-fade-in">
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>
                  <Gamepad2 size={22} className={styles.sectionTitleIcon} />
                  Players Management
                </h3>
                <button
                  className="btn btn-success"
                  onClick={() => toast.info('Add individual player functionality coming soon!')}
                >
                  <UserPlus size={18} />
                  Add New Player
                </button>
              </div>

              {filteredPlayers.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    {searchTerm || filterArmy ? <Search size={48} /> : <Gamepad2 size={48} />}
                  </div>
                  <p className={styles.emptyText}>
                    {searchTerm || filterArmy ? 'No players found matching your filters.' : 'No players registered yet. Register teams first to see players here.'}
                  </p>
                </div>
              ) : (
                <div className={styles.tableWrap}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Player</th>
                        <th>Team</th>
                        <th>Army</th>
                        <th>ITS Pin</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPlayers.map((player) => {
                        const team = teams.find(t => t.id === player.teamId);
                        return (
                          <tr key={player.id}>
                            <td>
                              <div className={styles.playerCell}>
                                <div className={clsx(
                                  styles.playerAvatar,
                                  player.isCaptain ? styles.playerAvatarCaptain : styles.playerAvatarDefault
                                )}>
                                  {player.isCaptain
                                    ? <Crown size={16} />
                                    : player.nickname.charAt(0).toUpperCase()}
                                </div>
                                <strong>{player.nickname}</strong>
                              </div>
                            </td>
                            <td>{team?.name || 'Unknown'}</td>
                            <td>
                              <span className={styles.armyBadge}>
                                {player.army}
                              </span>
                            </td>
                            <td className={styles.itsPin}>{player.itsPin}</td>
                            <td>
                              {player.isCaptain ? (
                                <span className={styles.captainBadge}>
                                  <Crown size={14} />
                                  Captain
                                </span>
                              ) : (
                                <span className={styles.rolePlayer}>Player</span>
                              )}
                            </td>
                            <td>
                              {player.isPainted ? (
                                <span className={styles.paintedBadge}>
                                  <Palette size={14} />
                                  Painted
                                </span>
                              ) : (
                                <span className={styles.unpaintedText}>
                                  Unpainted
                                </span>
                              )}
                            </td>
                            <td>
                              <button
                                className={clsx('btn btn-secondary', styles.btnSm)}
                                onClick={() => handleEditPlayer(player)}
                              >
                                <Pencil size={14} />
                                Edit
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
          )}
        </div>
      </div>

      {/* Edit Team Modal */}
      {editingTeam && (
        <EditTeamForm
          team={editingTeam}
          onSave={handleSaveTeam}
          onCancel={() => setEditingTeam(null)}
        />
      )}

      {/* Edit Player Modal */}
      {editingPlayer && (
        <EditPlayerForm
          player={editingPlayer}
          team={teams.find(t => t.id === editingPlayer.teamId)!}
          allTeams={teams}
          onSave={handleSavePlayer}
          onCancel={() => setEditingPlayer(null)}
        />
      )}
    </>
  );
};

export default TeamsPlayers;
