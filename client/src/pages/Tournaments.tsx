import React, { useState } from 'react';
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
import {
  Container,
  Paper,
  Title,
  Group,
  Stack,
  Button,
  Alert,
  Badge,
  Text,
  TextInput,
  Box,
  ThemeIcon,
  Loader,
} from '@mantine/core';
import { useTournaments } from '../contexts/TournamentsContext';
import { useTournamentData } from '../contexts/TournamentDataContext';
import { useToast } from '../contexts/ToastContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import TournamentForm from '../components/TournamentForm';
import { TournamentSummary } from '../types';

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
      <Container size="xl" py="md">
        <Group mb="lg">
          <ThemeIcon size="lg" variant="light" color="yellow">
            <Trophy size={28} />
          </ThemeIcon>
          <Title order={2}>Tournament Management</Title>
        </Group>
        <Paper p="lg" radius="md" withBorder>
          <LoadingSkeleton variant="table-rows" count={3} columns={5} />
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="xl" py="md">
        <Group mb="lg">
          <ThemeIcon size="lg" variant="light" color="yellow">
            <Trophy size={28} />
          </ThemeIcon>
          <Title order={2}>Tournament Management</Title>
        </Group>
        <Alert icon={<AlertCircle size={18} />} color="red" title="Error">
          {error}
        </Alert>
      </Container>
    );
  }

  const renderTournamentCard = (tournament: TournamentSummary) => {
    const isCurrent = tournament.id === activeTournamentId;
    const isActive = tournament.status === 'active';
    const isCompleted = tournament.status === 'completed';

    return (
      <Paper
        key={tournament.id}
        p="md"
        radius="sm"
        withBorder
        mb="sm"
        bg={isCurrent ? 'var(--mantine-color-cyan-light)' : 'var(--mantine-color-dark-7)'}
        style={isCurrent ? { borderColor: 'var(--mantine-color-cyan-filled)' } : undefined}
      >
        <Group justify="space-between" wrap="wrap" gap="md">
          <Group gap="md" wrap="nowrap">
            <ThemeIcon
              size="xl"
              radius="xl"
              variant="light"
              color={isCompleted ? 'gray' : 'yellow'}
            >
              <Trophy size={28} />
            </ThemeIcon>

            <div>
              <Group gap="xs" mb={4}>
                <Text fw={700} size="lg">{tournament.name}</Text>
                <Badge
                  color={isActive ? 'green' : 'gray'}
                  variant="light"
                  size="sm"
                >
                  {tournament.status}
                </Badge>
                {isCurrent && (
                  <Badge color="cyan" variant="filled" size="sm">
                    Current
                  </Badge>
                )}
              </Group>
              <Group gap="md" wrap="wrap">
                <Group gap={4}>
                  <Swords size={14} />
                  <Text size="xs" c="dimmed">Round:</Text>
                  <Text size="xs">{tournament.currentRound}</Text>
                </Group>
                <Group gap={4}>
                  <Users size={14} />
                  <Text size="xs" c="dimmed">Teams:</Text>
                  <Text size="xs">{tournament.teamCount}</Text>
                </Group>
                <Group gap={4}>
                  <Swords size={14} />
                  <Text size="xs" c="dimmed">Matches:</Text>
                  <Text size="xs">{tournament.matchCount}</Text>
                </Group>
                <Group gap={4}>
                  <Calendar size={14} />
                  <Text size="xs" c="dimmed">Created:</Text>
                  <Text size="xs">{formatDate(tournament.created_at)}</Text>
                </Group>
              </Group>
            </div>
          </Group>

          <Group gap="xs">
            {!isCurrent && (
              <Button
                size="xs"
                leftSection={<Play size={14} />}
                onClick={() => handleOpen(tournament)}
              >
                Open
              </Button>
            )}
            {isActive && !isCompleted && (
              <Button
                size="xs"
                variant="outline"
                leftSection={<CheckCircle size={14} />}
                onClick={() => handleComplete(tournament)}
              >
                Complete
              </Button>
            )}
            {isCompleted && (
              <Button
                size="xs"
                variant="outline"
                leftSection={<RefreshCw size={14} />}
                onClick={() => handleActivate(tournament)}
              >
                Reactivate
              </Button>
            )}
            <Button
              size="xs"
              variant="default"
              leftSection={<Pencil size={14} />}
              onClick={() => setEditingTournament(tournament)}
            >
              Edit
            </Button>
            <Button
              size="xs"
              color="red"
              variant="outline"
              leftSection={<Trash2 size={14} />}
              onClick={() => handleDelete(tournament)}
            >
              Delete
            </Button>
          </Group>
        </Group>
      </Paper>
    );
  };

  return (
    <>
      <Container size="xl" py="md">
        <Group mb="lg">
          <ThemeIcon size="lg" variant="light" color="yellow">
            <Trophy size={28} />
          </ThemeIcon>
          <Title order={2}>Tournament Management</Title>
        </Group>

        {/* Search Bar */}
        <Paper p="lg" radius="md" withBorder mb="md">
          <Group>
            <TextInput
              leftSection={<Search size={14} />}
              placeholder="Search tournaments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.currentTarget.value)}
              style={{ flex: 1 }}
            />
            {searchTerm && (
              <Button
                variant="outline"
                leftSection={<RotateCcw size={16} />}
                onClick={() => setSearchTerm('')}
              >
                Clear
              </Button>
            )}
          </Group>
        </Paper>

        {/* Main Content */}
        <Paper p="lg" radius="md" withBorder>
          <Group justify="space-between" mb="md">
            <Group>
              <Trophy size={22} />
              <Title order={3}>Tournaments ({filteredTournaments.length})</Title>
            </Group>
            <Button
              color="green"
              leftSection={<Plus size={18} />}
              onClick={() => setShowCreateForm(true)}
            >
              New Tournament
            </Button>
          </Group>

          {filteredTournaments.length === 0 ? (
            <Stack align="center" gap="md" py="xl">
              <ThemeIcon size={64} radius="xl" variant="light" color="gray">
                {searchTerm ? <Search size={48} /> : <Trophy size={48} />}
              </ThemeIcon>
              <Text c="dimmed" size="lg" ta="center">
                {searchTerm
                  ? 'No tournaments found matching your search.'
                  : 'No tournaments yet. Create your first tournament to get started!'}
              </Text>
              {!searchTerm && (
                <Button
                  leftSection={<Plus size={18} />}
                  onClick={() => setShowCreateForm(true)}
                >
                  Create First Tournament
                </Button>
              )}
            </Stack>
          ) : (
            <>
              {activeTournaments.length > 0 && (
                <Box mb="lg">
                  <Group gap="xs" mb="sm">
                    <Play size={18} />
                    <Title order={4}>Active ({activeTournaments.length})</Title>
                  </Group>
                  {activeTournaments.map(renderTournamentCard)}
                </Box>
              )}

              {completedTournaments.length > 0 && (
                <Box mb="lg">
                  <Group gap="xs" mb="sm">
                    <CheckCircle size={18} />
                    <Title order={4}>Completed ({completedTournaments.length})</Title>
                  </Group>
                  {completedTournaments.map(renderTournamentCard)}
                </Box>
              )}
            </>
          )}
        </Paper>
      </Container>

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
