import React, { useState } from 'react';
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
  Clock,
  Rocket,
} from 'lucide-react';
import {
  Container, Paper, Title, Group, Stack, Text, Button, Alert,
  Badge, Table, Tabs, TextInput, Select, Avatar, ThemeIcon,
} from '@mantine/core';
import { useTournament } from '../contexts/TournamentContext';
import { useToast } from '../contexts/ToastContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EditTeamForm from '../components/EditTeamForm';
import EditPlayerForm from '../components/EditPlayerForm';
import { Team, Player } from '../types';

const TeamsPlayers: React.FC = () => {
  const { getTeams, getPlayers, deleteTeam, updateTeam, updatePlayer, loading, error } = useTournament();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<string | null>('teams');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArmy, setFilterArmy] = useState('');

  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  const teams = getTeams();
  const players = getPlayers();

  const uniqueArmies = Array.from(new Set(players.map(p => p.army))).sort();

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teams.find(t => t.id === player.teamId)?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArmy = !filterArmy || player.army === filterArmy;
    return matchesSearch && matchesArmy;
  });

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

  const handleSaveTeam = async (teamId: string, updates: Partial<Team>) => {
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
      <Container size="xl" py="md">
        <Group gap="xs" mb="lg">
          <Users size={28} />
          <Title order={2}>Teams &amp; Players Management</Title>
        </Group>
        <Paper p="lg" radius="md" withBorder>
          <LoadingSkeleton variant="table-rows" count={5} columns={7} />
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="xl" py="md">
        <Group gap="xs" mb="lg">
          <Users size={28} />
          <Title order={2}>Teams &amp; Players Management</Title>
        </Group>
        <Alert color="red" variant="light" title="Error">{error}</Alert>
      </Container>
    );
  }

  return (
    <>
      <Container size="xl" py="md">
        <Group gap="xs" mb="lg">
          <Users size={28} />
          <Title order={2}>Teams &amp; Players Management</Title>
        </Group>

        {/* Search and Filter Bar */}
        <Paper p="md" radius="md" withBorder mb="md">
          <Group>
            <TextInput
              placeholder="Search teams or players..."
              leftSection={<Search size={14} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.currentTarget.value)}
              style={{ flex: 1 }}
            />
            {activeTab === 'players' && (
              <Select
                placeholder="All Armies"
                leftSection={<Swords size={14} />}
                data={uniqueArmies.map(a => ({ value: a, label: a }))}
                value={filterArmy || null}
                onChange={(v) => setFilterArmy(v || '')}
                clearable
                w={200}
              />
            )}
            <Button
              variant="default"
              leftSection={<RotateCcw size={16} />}
              onClick={() => { setSearchTerm(''); setFilterArmy(''); }}
            >
              Clear
            </Button>
          </Group>
        </Paper>

        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List mb="md">
            <Tabs.Tab value="teams" leftSection={<Building2 size={16} />}>
              Teams ({filteredTeams.length})
            </Tabs.Tab>
            <Tabs.Tab value="players" leftSection={<Gamepad2 size={16} />}>
              Players ({filteredPlayers.length})
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="teams">
            <Paper p="lg" radius="md" withBorder>
              <Group justify="space-between" mb="md">
                <Group gap="xs">
                  <Building2 size={22} />
                  <Title order={3}>Teams Management</Title>
                </Group>
                <Button component="a" href="/registration" color="teal" leftSection={<UserPlus size={18} />}>
                  Add New Team
                </Button>
              </Group>

              {filteredTeams.length === 0 ? (
                <Stack align="center" gap="md" py="xl">
                  <ThemeIcon size={64} variant="light" color="cyan" radius="xl">
                    {searchTerm ? <Search size={32} /> : <Rocket size={32} />}
                  </ThemeIcon>
                  <Text c="dimmed">
                    {searchTerm ? 'No teams found matching your search.' : 'No teams registered yet.'}
                  </Text>
                  {!searchTerm && (
                    <Button component="a" href="/registration" leftSection={<Rocket size={18} />}>
                      Register the first team
                    </Button>
                  )}
                </Stack>
              ) : (
                <Stack gap="sm">
                  {filteredTeams.map((team) => {
                    const captain = team.players.find(p => p.isCaptain);
                    return (
                      <Paper key={team.id} p="md" radius="md" withBorder>
                        <Group justify="space-between" wrap="nowrap">
                          <Group gap="md" wrap="nowrap">
                            <Avatar color="cyan" radius="xl" size="md">
                              {team.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <div>
                              <Text fw={700}>{team.name}</Text>
                              <Group gap="xs">
                                <Group gap={4}>
                                  <Crown size={14} color="var(--mantine-color-yellow-5)" />
                                  <Text size="sm" c="dimmed">
                                    {captain?.nickname || 'No captain'}
                                  </Text>
                                </Group>
                                <Text size="sm" c="dimmed">
                                  | {team.players.map(p => p.nickname).join(', ')}
                                </Text>
                              </Group>
                            </div>
                          </Group>
                          <Group gap="xs">
                            <Button variant="light" size="xs" leftSection={<Pencil size={14} />} onClick={() => handleEditTeam(team)}>
                              Edit
                            </Button>
                            <Button variant="light" color="red" size="xs" leftSection={<Trash2 size={14} />} onClick={() => handleDeleteTeam(team.id, team.name)}>
                              Delete
                            </Button>
                          </Group>
                        </Group>
                      </Paper>
                    );
                  })}
                </Stack>
              )}
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="players">
            <Paper p="lg" radius="md" withBorder>
              <Group justify="space-between" mb="md">
                <Group gap="xs">
                  <Gamepad2 size={22} />
                  <Title order={3}>Players Management</Title>
                </Group>
                <Button color="teal" leftSection={<UserPlus size={18} />} onClick={() => toast.info('Add individual player functionality coming soon!')}>
                  Add New Player
                </Button>
              </Group>

              {filteredPlayers.length === 0 ? (
                <Stack align="center" gap="md" py="xl">
                  <ThemeIcon size={64} variant="light" color="cyan" radius="xl">
                    {searchTerm || filterArmy ? <Search size={32} /> : <Gamepad2 size={32} />}
                  </ThemeIcon>
                  <Text c="dimmed">
                    {searchTerm || filterArmy ? 'No players found matching your filters.' : 'No players registered yet.'}
                  </Text>
                </Stack>
              ) : (
                <Table.ScrollContainer minWidth={800}>
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Player</Table.Th>
                        <Table.Th>Team</Table.Th>
                        <Table.Th>Army</Table.Th>
                        <Table.Th>ITS Pin</Table.Th>
                        <Table.Th>Role</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Actions</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {filteredPlayers.map((player) => {
                        const team = teams.find(t => t.id === player.teamId);
                        return (
                          <Table.Tr key={player.id}>
                            <Table.Td>
                              <Group gap="xs" wrap="nowrap">
                                <Avatar
                                  size="sm"
                                  radius="xl"
                                  color={player.isCaptain ? 'yellow' : 'cyan'}
                                >
                                  {player.isCaptain ? <Crown size={14} /> : player.nickname.charAt(0).toUpperCase()}
                                </Avatar>
                                <Text fw={600}>{player.nickname}</Text>
                              </Group>
                            </Table.Td>
                            <Table.Td>{team?.name || 'Unknown'}</Table.Td>
                            <Table.Td>
                              <Badge variant="light" color="cyan" size="sm">{player.army}</Badge>
                            </Table.Td>
                            <Table.Td>
                              <Text size="sm" ff="monospace">{player.itsPin}</Text>
                            </Table.Td>
                            <Table.Td>
                              {player.isCaptain ? (
                                <Badge color="yellow" variant="light" size="sm" leftSection={<Crown size={12} />}>
                                  Captain
                                </Badge>
                              ) : (
                                <Text size="sm" c="dimmed">Player</Text>
                              )}
                            </Table.Td>
                            <Table.Td>
                              <Group gap={4}>
                                {player.isPainted ? (
                                  <Badge color="teal" variant="light" size="sm" leftSection={<Palette size={12} />}>
                                    Painted
                                  </Badge>
                                ) : (
                                  <Text size="sm" c="dimmed">Unpainted</Text>
                                )}
                                {player.armyListLate && (
                                  <Badge color="red" variant="light" size="sm" leftSection={<Clock size={12} />}>
                                    Late
                                  </Badge>
                                )}
                              </Group>
                            </Table.Td>
                            <Table.Td>
                              <Button variant="light" size="xs" leftSection={<Pencil size={14} />} onClick={() => handleEditPlayer(player)}>
                                Edit
                              </Button>
                            </Table.Td>
                          </Table.Tr>
                        );
                      })}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              )}
            </Paper>
          </Tabs.Panel>
        </Tabs>
      </Container>

      {editingTeam && (
        <EditTeamForm
          team={editingTeam}
          onSave={handleSaveTeam}
          onCancel={() => setEditingTeam(null)}
        />
      )}

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
