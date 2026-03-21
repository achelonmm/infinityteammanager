import React from 'react';
import { Trophy, Users, Gamepad2, Target, Rocket, Tent, CheckCircle2, Swords, Plus } from 'lucide-react';
import { Container, Paper, Title, Group, Stack, Text, SimpleGrid, Badge, Alert, Button, ThemeIcon } from '@mantine/core';
import { useTournament } from '../contexts/TournamentContext';
import LoadingSkeleton from '../components/LoadingSkeleton';

const Dashboard: React.FC = () => {
  const { getTeams, getPlayers, tournament, loading, error } = useTournament();

  if (loading) {
    return (
      <Container size="xl" py="md">
        <Group gap="xs" mb="lg">
          <Trophy size={28} />
          <Title order={2}>Tournament Dashboard</Title>
        </Group>
        <LoadingSkeleton variant="stat-card" count={3} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="xl" py="md">
        <Group gap="xs" mb="lg">
          <Trophy size={28} />
          <Title order={2}>Tournament Dashboard</Title>
        </Group>
        <Alert color="red" variant="light" title="Error">{error}</Alert>
      </Container>
    );
  }

  const teams = getTeams();
  const players = getPlayers();

  const armyDistribution = players.reduce((acc, player) => {
    acc[player.army] = (acc[player.army] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Container size="xl" py="md">
      <Group gap="xs" mb="lg">
        <Trophy size={28} />
        <Title order={2}>Tournament Dashboard</Title>
      </Group>

      <SimpleGrid cols={3} mb="lg">
        <Paper p="lg" radius="md" withBorder>
          <Stack align="center" gap="xs">
            <ThemeIcon size="lg" variant="light" color="teal"><Users size={20} /></ThemeIcon>
            <Text size="sm" c="dimmed">Total Teams</Text>
            <Text size="xl" fw={700} c="teal">{teams.length}</Text>
          </Stack>
        </Paper>
        <Paper p="lg" radius="md" withBorder>
          <Stack align="center" gap="xs">
            <ThemeIcon size="lg" variant="light" color="cyan"><Gamepad2 size={20} /></ThemeIcon>
            <Text size="sm" c="dimmed">Total Players</Text>
            <Text size="xl" fw={700} c="cyan">{players.length}</Text>
          </Stack>
        </Paper>
        <Paper p="lg" radius="md" withBorder>
          <Stack align="center" gap="xs">
            <ThemeIcon size="lg" variant="light" color="yellow"><Target size={20} /></ThemeIcon>
            <Text size="sm" c="dimmed">Current Round</Text>
            <Text size="xl" fw={700} c="yellow">{tournament?.currentRound || 1}</Text>
          </Stack>
        </Paper>
      </SimpleGrid>

      <Paper p="lg" radius="md" withBorder>
        <Group gap="xs" mb="md">
          <Rocket size={24} />
          <Title order={3}>Tournament Status</Title>
        </Group>

        {teams.length === 0 ? (
          <Stack align="center" gap="md" py="xl">
            <ThemeIcon size={64} variant="light" color="cyan" radius="xl">
              <Tent size={32} />
            </ThemeIcon>
            <Text c="dimmed" ta="center">
              No teams registered yet. Start by registering teams for the tournament.
            </Text>
            <Button component="a" href="/registration" leftSection={<Plus size={18} />}>
              Register First Team
            </Button>
          </Stack>
        ) : (
          <Stack gap="md">
            <Alert color="teal" variant="light" icon={<CheckCircle2 size={18} />}>
              <strong>Tournament Progress:</strong> {teams.length} teams registered, ready for pairings.
            </Alert>

            {Object.keys(armyDistribution).length > 0 && (
              <div>
                <Group gap="xs" mb="sm">
                  <Swords size={22} />
                  <Title order={4}>Army Distribution</Title>
                </Group>
                <Group gap="xs">
                  {Object.entries(armyDistribution).map(([army, count]) => (
                    <Badge key={army} variant="light" color="cyan" size="lg">
                      {army}: {count}
                    </Badge>
                  ))}
                </Group>
              </div>
            )}
          </Stack>
        )}
      </Paper>
    </Container>
  );
};

export default Dashboard;
