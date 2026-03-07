import React, { useState } from 'react';
import clsx from 'clsx';
import {
  Trophy,
  Search,
  Plus,
  Pencil,
  Trash2,
  Play,
  CheckCircle,
  RotateCcw,
  Users,
  Swords,
  Calendar,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useTournaments } from '../contexts/TournamentsContext';
import { useTournamentData } from '../contexts/TournamentDataContext';
import { useToast } from '../contexts/ToastContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import TournamentForm from '../components/TournamentForm';
import { TournamentSummary } from '../types';
import styles from './Tournaments.module.css';

const Tournaments: React.FC = () => {
  const {
    tournaments,
    loading,
    error,
    createTournament,
    updateTournament,
    deleteTournament,
    activateTournament,
    completeTournament,
  } = useTournaments();
  const { activeTournamentId, switchTournament } = useTournamentData();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTournament, setEditingTournament] = useState<TournamentSummary | null>(null);

  const filteredTournaments = tournaments.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeTournaments = filteredTournaments.filter(t => t.status === 'active');
  const completedTournaments = filteredTournaments.filter(t => t.status === 'completed');

  const handleCreate = async (name: string) => {
    const created = await createTournament(name);
    setShowCreateForm(false);
    toast.success(`Tournament "${created.name}" created!`);
  };

  const handleEdit = async (name: string) => {
    if (!editingTournament) return;
    await updateTournament(editingTournament.id, { name });
    setEditingTournament(null);
    toast.success('Tournament updated!');
  };

  const handleDelete = async (tournament: TournamentSummary) => {
    const isCurrent = tournament.id === activeTournamentId;
    let message = `Are you sure you want to delete "${tournament.name}"?`;

    if (tournament.teamCount > 0 || tournament.matchCount > 0) {
      message += `\n\nThis will permanently delete ${tournament.teamCount} team${tournament.teamCount !== 1 ? 's' : ''} and ${tournament.matchCount} match${tournament.matchCount !== 1 ? 'es' : ''}.`;
    }

    if (isCurrent) {
      message += '\n\nThis is your currently active tournament.';
    }

    message += '\n\nThis action cannot be undone.';

    const confirmed = await toast.confirm(message, {
      variant: 'danger',
      confirmLabel: 'Delete',
    });

    if (confirmed) {
      try {
        await deleteTournament(tournament.id);
        toast.success(`Tournament "${tournament.name}" deleted.`);
      } catch (err) {
        console.error('Error deleting tournament:', err);
        toast.error('Failed to delete tournament.');
      }
    }
  };

  const handleActivate = async (tournament: TournamentSummary) => {
    try {
      await activateTournament(tournament.id);
      toast.success(`"${tournament.name}" is now the active tournament.`);
    } catch (err) {
      console.error('Error activating tournament:', err);
      toast.error('Failed to activate tournament.');
    }
  };

  const handleComplete = async (tournament: TournamentSummary) => {
    const isCurrent = tournament.id === activeTournamentId;
    let message = `Mark "${tournament.name}" as completed?`;
    if (isCurrent) {
      message += ' This is your currently active tournament.';
    }

    const confirmed = await toast.confirm(message, {
      variant: 'warning',
      confirmLabel: 'Complete',
    });

    if (confirmed) {
      try {
        await completeTournament(tournament.id);
        toast.success(`"${tournament.name}" marked as completed.`);
      } catch (err) {
        console.error('Error completing tournament:', err);
        toast.error('Failed to complete tournament.');
      }
    }
  };

  const handleOpen = async (tournament: TournamentSummary) => {
    try {
      await switchTournament(tournament.id);
      toast.success(`Switched to "${tournament.name}".`);
    } catch (err) {
      console.error('Error switching tournament:', err);
      toast.error('Failed to switch tournament.');
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && tournaments.length === 0) {
    return (
      <div className="container">
        <h2 className={styles.pageTitle}>
          <Trophy size={28} className={styles.pageTitleIcon} />
          Tournament Management
        </h2>
        <div className="card">
          <LoadingSkeleton variant="table-rows" count={3} columns={5} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h2 className={styles.pageTitle}>
          <Trophy size={28} className={styles.pageTitleIcon} />
          Tournament Management
        </h2>
        <div className="alert alert-error">
          <AlertCircle size={18} className={styles.errorIcon} />
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  const renderTournamentCard = (tournament: TournamentSummary) => {
    const isCurrent = tournament.id === activeTournamentId;
    const isActive = tournament.status === 'active';
    const isCompleted = tournament.status === 'completed';

    return (
      <div
        key={tournament.id}
        className={clsx(
          styles.tournamentCard,
          isCurrent && styles.tournamentCardActive
        )}
      >
        <div className={styles.tournamentCardGrid}>
          <div className={clsx(
            styles.tournamentAvatar,
            isCompleted && styles.tournamentAvatarCompleted
          )}>
            <Trophy size={28} />
          </div>

          <div>
            <h4 className={styles.tournamentName}>
              {tournament.name}
              <span className={clsx(
                styles.statusBadge,
                isActive ? styles.statusActive : styles.statusCompleted
              )}>
                {tournament.status}
              </span>
              {isCurrent && (
                <span className={styles.currentBadge}>Current</span>
              )}
            </h4>
            <div className={styles.tournamentMeta}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>
                  <Swords size={14} className={styles.metaIcon} />
                  Round:
                </span>
                {tournament.currentRound}
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>
                  <Users size={14} className={styles.metaIcon} />
                  Teams:
                </span>
                {tournament.teamCount}
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>
                  <Swords size={14} className={styles.metaIcon} />
                  Matches:
                </span>
                {tournament.matchCount}
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>
                  <Calendar size={14} className={styles.metaIcon} />
                  Created:
                </span>
                {formatDate(tournament.created_at)}
              </div>
            </div>
          </div>

          <div className={styles.tournamentActions}>
            {!isCurrent && (
              <button
                className={clsx('btn btn-primary', styles.btnSm)}
                onClick={() => handleOpen(tournament)}
              >
                <Play size={14} />
                Open
              </button>
            )}
            {isActive && !isCompleted && (
              <button
                className={clsx('btn btn-outline', styles.btnSm)}
                onClick={() => handleComplete(tournament)}
              >
                <CheckCircle size={14} />
                Complete
              </button>
            )}
            {isCompleted && (
              <button
                className={clsx('btn btn-outline', styles.btnSm)}
                onClick={() => handleActivate(tournament)}
              >
                <RefreshCw size={14} />
                Reactivate
              </button>
            )}
            <button
              className={clsx('btn btn-secondary', styles.btnSm)}
              onClick={() => setEditingTournament(tournament)}
            >
              <Pencil size={14} />
              Edit
            </button>
            <button
              className={clsx('btn btn-warning', styles.btnSm)}
              onClick={() => handleDelete(tournament)}
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="container animate-fade-in">
        <h2 className={styles.pageTitle}>
          <Trophy size={28} className={styles.pageTitleIcon} />
          Tournament Management
        </h2>

        {/* Search Bar */}
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
                placeholder="Search tournaments..."
              />
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="btn btn-outline"
              >
                <RotateCcw size={16} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className={clsx('card', styles.contentCard)}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              <Trophy size={22} className={styles.sectionTitleIcon} />
              Tournaments ({filteredTournaments.length})
            </h3>
            <button
              className="btn btn-success"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus size={18} />
              New Tournament
            </button>
          </div>

          {filteredTournaments.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                {searchTerm ? <Search size={48} /> : <Trophy size={48} />}
              </div>
              <p className={styles.emptyText}>
                {searchTerm
                  ? 'No tournaments found matching your search.'
                  : 'No tournaments yet. Create your first tournament to get started!'}
              </p>
              {!searchTerm && (
                <button
                  className="btn btn-primary"
                  onClick={() => setShowCreateForm(true)}
                >
                  <Plus size={18} />
                  Create First Tournament
                </button>
              )}
            </div>
          ) : (
            <>
              {activeTournaments.length > 0 && (
                <div className={styles.statusGroup}>
                  <h4 className={styles.statusGroupTitle}>
                    <Play size={18} />
                    Active ({activeTournaments.length})
                  </h4>
                  {activeTournaments.map(renderTournamentCard)}
                </div>
              )}

              {completedTournaments.length > 0 && (
                <div className={styles.statusGroup}>
                  <h4 className={styles.statusGroupTitle}>
                    <CheckCircle size={18} />
                    Completed ({completedTournaments.length})
                  </h4>
                  {completedTournaments.map(renderTournamentCard)}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Tournament Modal */}
      {showCreateForm && (
        <TournamentForm
          onSave={handleCreate}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Edit Tournament Modal */}
      {editingTournament && (
        <TournamentForm
          tournament={editingTournament}
          onSave={handleEdit}
          onCancel={() => setEditingTournament(null)}
        />
      )}
    </>
  );
};

export default Tournaments;
