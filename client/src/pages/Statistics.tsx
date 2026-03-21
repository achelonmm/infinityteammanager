import React, { useState } from 'react';
import { Trophy, Target, Crown } from 'lucide-react';
import {
  Container,
  Paper,
  Table,
  Badge,
  Text,
  Title,
  Group,
  Stack,
  Tabs,
  Progress,
  SimpleGrid,
} from '@mantine/core';
import { DonutChart } from '@mantine/charts';
import { useTournament } from '../contexts/TournamentContext';
import { calculateTournamentStats } from '../utils/statisticsUtils';

const ARMY_COLORS = [
  'cyan',
  'teal',
  'blue',
  'violet',
  'grape',
  'pink',
  'red',
  'orange',
  'yellow',
  'lime',
  'green',
];

const ARMY_HEX_COLORS = [
  '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#6366f1',
  '#0891b2', '#f97316', '#a855f7', '#ec4899', '#84cc16', '#14b8a6',
];

const Statistics: React.FC = () => {
  const { getTeams, getPlayers, tournament } = useTournament();
  const [activeTab, setActiveTab] = useState<string | null>('overview');

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

  const winRateBadgeColor = (rate: number) => {
    if (rate >= 60) return 'green';
    if (rate >= 40) return 'yellow';
    return 'red';
  };

  const renderOverview = () => (
    <Stack>
      {/* Key Stats Grid */}
      <SimpleGrid cols={4}>
        <Paper p="md" radius="md" withBorder>
          <Text size="sm" c="dimmed">Total Teams</Text>
          <Text size="xl" fw={700} c="green">{stats.totalTeams}</Text>
        </Paper>

        <Paper p="md" radius="md" withBorder>
          <Text size="sm" c="dimmed">Total Players</Text>
          <Text size="xl" fw={700} c="cyan">{stats.totalPlayers}</Text>
        </Paper>

        <Paper p="md" radius="md" withBorder>
          <Text size="sm" c="dimmed">Current Round</Text>
          <Text size="xl" fw={700} c="yellow">{stats.currentRound}</Text>
        </Paper>

        <Paper p="md" radius="md" withBorder>
          <Text size="sm" c="dimmed">Match Completion</Text>
          <Text size="xl" fw={700} c="red">
            {stats.totalMatches > 0
              ? Math.round(
                  (stats.completedMatches / stats.totalMatches) * 100
                )
              : 0}
            %
          </Text>
          <Text size="xs" c="dimmed">
            {stats.completedMatches} / {stats.totalMatches}
          </Text>
        </Paper>
      </SimpleGrid>

      {/* Tournament Progress */}
      <Paper p="lg" radius="md" withBorder>
        <Title order={4} mb="md">Tournament Progress</Title>

        <Stack gap="md">
          <div>
            <Group justify="space-between" mb={4}>
              <Text size="sm">Matches Completed</Text>
              <Text size="sm">
                {stats.completedMatches} / {stats.totalMatches}
              </Text>
            </Group>
            <Progress
              value={
                stats.totalMatches > 0
                  ? (stats.completedMatches / stats.totalMatches) * 100
                  : 0
              }
              color="green"
              size="lg"
              radius="md"
            />
          </div>

          {stats.totalRounds > 0 && (
            <div>
              <Group justify="space-between" mb={4}>
                <Text size="sm">Round Progress</Text>
                <Text size="sm">
                  Round {stats.currentRound}{' '}
                  {stats.totalRounds > 1 ? `of ${stats.totalRounds}` : ''}
                </Text>
              </Group>
              <Progress
                value={
                  stats.totalRounds > 0
                    ? ((stats.currentRound - 1) /
                        Math.max(stats.totalRounds, stats.currentRound)) *
                      100
                    : 0
                }
                color="cyan"
                size="lg"
                radius="md"
              />
            </div>
          )}
        </Stack>
      </Paper>

      {/* Army Distribution — 3D Donut */}
      <Paper p="lg" radius="md" withBorder>
        <Title order={4} mb="md">Army Distribution</Title>
        {stats.armyDistribution.length > 0 ? (
          <Group align="flex-start" gap="xl" wrap="wrap">
            {/* 3D-tilted donut chart */}
            <Stack align="center" gap={4} style={{ flexShrink: 0 }}>
              <div style={{ perspective: '700px', perspectiveOrigin: '50% 0%' }}>
                <div
                  style={{
                    transform: 'rotateX(28deg)',
                    transformOrigin: 'center bottom',
                    filter: 'drop-shadow(0 22px 30px rgba(0,0,0,0.6))',
                  }}
                >
                  <DonutChart
                    data={stats.armyDistribution.map((army, index) => ({
                      name: army.army,
                      value: army.count,
                      color: ARMY_HEX_COLORS[index % ARMY_HEX_COLORS.length],
                    }))}
                    size={260}
                    thickness={42}
                    paddingAngle={2}
                    withTooltip
                    tooltipDataSource="segment"
                    chartLabel={String(stats.totalPlayers)}
                  />
                </div>
              </div>
              <Text size="xs" c="dimmed" style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                total players
              </Text>
            </Stack>

            {/* Colour-coded legend */}
            <Stack gap={8} style={{ flex: 1, minWidth: 200, justifyContent: 'center' }}>
              {stats.armyDistribution.map((army, index) => (
                <Group key={army.army} gap="sm" wrap="nowrap">
                  <div
                    style={{
                      width: 11,
                      height: 11,
                      borderRadius: '50%',
                      background: ARMY_HEX_COLORS[index % ARMY_HEX_COLORS.length],
                      flexShrink: 0,
                      boxShadow: `0 0 6px ${ARMY_HEX_COLORS[index % ARMY_HEX_COLORS.length]}88`,
                    }}
                  />
                  <Text size="sm" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {army.army}
                  </Text>
                  <Text size="sm" fw={600} style={{ flexShrink: 0 }}>{army.count}</Text>
                  <Text size="xs" c="dimmed" style={{ flexShrink: 0, minWidth: 48, textAlign: 'right' }}>
                    {army.percentage.toFixed(1)}%
                  </Text>
                </Group>
              ))}
            </Stack>
          </Group>
        ) : (
          <Text c="dimmed">No army data available yet.</Text>
        )}
      </Paper>
    </Stack>
  );

  const renderArmies = () => (
    <Paper p="lg" radius="md" withBorder>
      <Title order={4} mb="md">Army Performance Analysis</Title>
      {stats.armyPerformance.length > 0 ? (
        <Table.ScrollContainer minWidth={600}>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Army</Table.Th>
                <Table.Th>Players</Table.Th>
                <Table.Th>Games</Table.Th>
                <Table.Th>Win Rate</Table.Th>
                <Table.Th>Avg Objective</Table.Th>
                <Table.Th>Avg Kill Ratio</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {stats.armyPerformance.map((army) => (
                <Table.Tr key={army.army}>
                  <Table.Td>
                    <Text fw={700}>{army.army}</Text>
                  </Table.Td>
                  <Table.Td>{army.players.length}</Table.Td>
                  <Table.Td>{army.gamesPlayed}</Table.Td>
                  <Table.Td>
                    <Badge color={winRateBadgeColor(army.winRate)}>
                      {army.winRate.toFixed(1)}%
                    </Badge>
                  </Table.Td>
                  <Table.Td>{army.averageObjectivePoints.toFixed(1)}</Table.Td>
                  <Table.Td>{army.averageKillRatio.toFixed(2)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      ) : (
        <Text c="dimmed">
          No army performance data available yet. Complete some matches to see
          statistics.
        </Text>
      )}
    </Paper>
  );

  const renderPlayers = () => (
    <Stack>
      {/* Top Performers */}
      <Paper p="lg" radius="md" withBorder>
        <Title order={4} mb="md">Top Performers (by Win Rate)</Title>
        {stats.topPerformers.length > 0 ? (
          <Table.ScrollContainer minWidth={600}>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Player</Table.Th>
                  <Table.Th>Army</Table.Th>
                  <Table.Th>Games</Table.Th>
                  <Table.Th>Win Rate</Table.Th>
                  <Table.Th>Avg Obj</Table.Th>
                  <Table.Th>Kill Ratio</Table.Th>
                  <Table.Th>Total Pts</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {stats.topPerformers.map((performance, index) => (
                  <Table.Tr
                    key={performance.player.id}
                    bg={
                      index === 0
                        ? 'yellow.0'
                        : index === 1
                          ? 'gray.1'
                          : index === 2
                            ? 'orange.0'
                            : undefined
                    }
                  >
                    <Table.Td>
                      <Group gap="xs">
                        {index < 3 && (
                          <Text fw={700} c="dimmed">#{index + 1}</Text>
                        )}
                        <Text fw={700}>{performance.player.nickname}</Text>
                        {performance.player.isCaptain && (
                          <Badge size="xs" variant="light">C</Badge>
                        )}
                      </Group>
                    </Table.Td>
                    <Table.Td>{performance.player.army}</Table.Td>
                    <Table.Td>{performance.gamesPlayed}</Table.Td>
                    <Table.Td>
                      <Badge color={winRateBadgeColor(performance.winRate)}>
                        {performance.winRate.toFixed(1)}%
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      {performance.averageObjectivePoints.toFixed(1)}
                    </Table.Td>
                    <Table.Td>{performance.killRatio.toFixed(2)}</Table.Td>
                    <Table.Td>
                      <Text fw={700}>{performance.totalTournamentPoints}</Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        ) : (
          <Text c="dimmed">
            No player performance data available yet. Complete some matches to
            see statistics.
          </Text>
        )}
      </Paper>
    </Stack>
  );

  const renderAchievements = () => (
    <Stack>
      {/* Special Achievements */}
      <SimpleGrid cols={3}>
        {stats.mostKills && (
          <Paper p="lg" radius="md" withBorder style={{ borderColor: 'var(--mantine-color-red-4)' }}>
            <Group gap="xs" mb="sm">
              <Trophy size={20} />
              <Text fw={700}>Highest Kill Ratio</Text>
            </Group>
            <Stack gap={4}>
              <Text fw={600}>{stats.mostKills.player.nickname}</Text>
              <Text size="sm" c="dimmed">{stats.mostKills.player.army}</Text>
              <Text size="xl" fw={700} c="red">
                {stats.mostKills.killRatio.toFixed(2)}
              </Text>
              <Text size="xs" c="dimmed">
                {stats.mostKills.gamesPlayed} games played
              </Text>
            </Stack>
          </Paper>
        )}

        {stats.highestObjectiveAverage && (
          <Paper p="lg" radius="md" withBorder style={{ borderColor: 'var(--mantine-color-blue-4)' }}>
            <Group gap="xs" mb="sm">
              <Target size={20} />
              <Text fw={700}>Best Objective Player</Text>
            </Group>
            <Stack gap={4}>
              <Text fw={600}>{stats.highestObjectiveAverage.player.nickname}</Text>
              <Text size="sm" c="dimmed">{stats.highestObjectiveAverage.player.army}</Text>
              <Text size="xl" fw={700} c="blue">
                {stats.highestObjectiveAverage.averageObjectivePoints.toFixed(1)}
              </Text>
              <Text size="xs" c="dimmed">
                average objective points
              </Text>
            </Stack>
          </Paper>
        )}

        {stats.topPerformers.length > 0 && (
          <Paper p="lg" radius="md" withBorder style={{ borderColor: 'var(--mantine-color-yellow-4)' }}>
            <Group gap="xs" mb="sm">
              <Crown size={20} />
              <Text fw={700}>Tournament Leader</Text>
            </Group>
            <Stack gap={4}>
              <Text fw={600}>{stats.topPerformers[0].player.nickname}</Text>
              <Text size="sm" c="dimmed">{stats.topPerformers[0].player.army}</Text>
              <Text size="xl" fw={700} c="yellow.6">
                {stats.topPerformers[0].totalTournamentPoints}
              </Text>
              <Text size="xs" c="dimmed">
                tournament points (
                {stats.topPerformers[0].winRate.toFixed(1)}% win rate)
              </Text>
            </Stack>
          </Paper>
        )}
      </SimpleGrid>

      {/* Additional Stats */}
      <Paper p="lg" radius="md" withBorder>
        <Title order={4} mb="md">Tournament Insights</Title>
        <SimpleGrid cols={3}>
          <Paper p="md" radius="md" withBorder>
            <Text size="sm" fw={500} mb={4}>Most Popular Army</Text>
            <Text fw={700}>
              {stats.armyDistribution.length > 0
                ? stats.armyDistribution[0].army
                : 'N/A'}
            </Text>
            <Text size="xs" c="dimmed">
              {stats.armyDistribution.length > 0
                ? `${stats.armyDistribution[0].count} players (${stats.armyDistribution[0].percentage.toFixed(1)}%)`
                : 'No data'}
            </Text>
          </Paper>

          <Paper p="md" radius="md" withBorder>
            <Text size="sm" fw={500} mb={4}>Best Performing Army</Text>
            <Text fw={700}>
              {stats.armyPerformance.length > 0
                ? stats.armyPerformance[0].army
                : 'N/A'}
            </Text>
            <Text size="xs" c="dimmed">
              {stats.armyPerformance.length > 0
                ? `${stats.armyPerformance[0].winRate.toFixed(1)}% win rate`
                : 'No data'}
            </Text>
          </Paper>

          <Paper p="md" radius="md" withBorder>
            <Text size="sm" fw={500} mb={4}>Average Match Completion</Text>
            <Text fw={700}>
              {stats.totalMatches > 0
                ? (
                    (stats.completedMatches / stats.totalMatches) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </Text>
            <Text size="xs" c="dimmed">
              {stats.completedMatches} of {stats.totalMatches} matches
            </Text>
          </Paper>
        </SimpleGrid>
      </Paper>
    </Stack>
  );

  return (
    <Container size="xl" py="md">
      <Group gap="xs" mb="lg">
        <Trophy size={28} />
        <Title order={2}>Tournament Statistics</Title>
      </Group>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List mb="md">
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
          <Tabs.Tab value="armies">Army Analysis</Tabs.Tab>
          <Tabs.Tab value="players">Player Performance</Tabs.Tab>
          <Tabs.Tab value="achievements">Achievements</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview">{renderOverview()}</Tabs.Panel>
        <Tabs.Panel value="armies">{renderArmies()}</Tabs.Panel>
        <Tabs.Panel value="players">{renderPlayers()}</Tabs.Panel>
        <Tabs.Panel value="achievements">{renderAchievements()}</Tabs.Panel>
      </Tabs>
    </Container>
  );
};

export default Statistics;
