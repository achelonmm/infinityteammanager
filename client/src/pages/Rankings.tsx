import React, { useState } from 'react';
import {
  Trophy,
  Building2,
  Gamepad2,
  Crown,
  Palette,
  BarChart3,
  Medal,
  AlertCircle,
} from 'lucide-react';
import {
  Container,
  Paper,
  Table,
  Badge,
  Text,
  Title,
  Group,
  Stack,
  Button,
  Alert,
} from '@mantine/core';
import { useTournament } from '../contexts/TournamentContext';
import {
  calculatePlayerRankings,
  calculateTeamRankings,
  sortPlayerRankings,
  sortTeamRankings,
} from '../utils/rankingUtils';
import { Team, Player } from '../types';
import LoadingSkeleton from '../components/LoadingSkeleton';
import MatchHistoryModal from '../components/MatchHistoryModal';
import type { MatchHistoryEntry } from '../components/MatchHistoryModal';

const Rankings: React.FC = () => {
  const { getTeams, tournament, loading, error } = useTournament();
  const [selectedTeamHistory, setSelectedTeamHistory] = useState<Team | null>(
    null
  );
  const [selectedPlayerHistory, setSelectedPlayerHistory] = useState<{
    player: Player;
    team: Team;
  } | null>(null);

  if (loading) {
    return (
      <Container size="xl" py="md">
        <Title order={2} mb="lg">Tournament Rankings</Title>
        <Paper p="lg" radius="md" withBorder>
          <LoadingSkeleton variant="table-rows" count={5} columns={13} />
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="xl" py="md">
        <Title order={2} mb="lg">Tournament Rankings</Title>
        <Alert
          color="red"
          variant="light"
          icon={<AlertCircle size={18} />}
          title="Error"
        >
          {error}
        </Alert>
      </Container>
    );
  }

  const teams = getTeams();
  const teamMatches = tournament?.teamMatches || [];

  // Calculate rankings
  const playerRankings = sortPlayerRankings(
    calculatePlayerRankings(teams, teamMatches)
  );

  const teamRankings = sortTeamRankings(
    calculateTeamRankings(teams, teamMatches)
  );

  // Get team match history (showing individual games)
  const getTeamMatchHistory = (team: Team): MatchHistoryEntry[] => {
    const matches: MatchHistoryEntry[] = [];

    teamMatches.forEach((teamMatch) => {
      if (!teamMatch.isCompleted || !teamMatch.individualMatches) return;

      const isTeam1 = teamMatch.team1Id === team.id;
      const isTeam2 = teamMatch.team2Id === team.id;

      if (!isTeam1 && !isTeam2) return;

      const opponentTeam = teams.find(
        (t) => t.id === (isTeam1 ? teamMatch.team2Id : teamMatch.team1Id)
      );

      teamMatch.individualMatches.forEach((match) => {
        if (!match.isCompleted) return;

        const player = team.players.find(
          (p) => p.id === (isTeam1 ? match.player1Id : match.player2Id)
        );
        const opponentPlayer = opponentTeam?.players.find(
          (p) => p.id === (isTeam1 ? match.player2Id : match.player1Id)
        );

        if (!player || !opponentPlayer) return;

        const objectivePoints = isTeam1
          ? match.objectivePoints1
          : match.objectivePoints2;
        const objectivePointsOpponent = isTeam1
          ? match.objectivePoints2
          : match.objectivePoints1;
        const tournamentPoints = isTeam1
          ? match.tournamentPoints1
          : match.tournamentPoints2;
        const victoryPoints = isTeam1
          ? match.victoryPointsFor1
          : match.victoryPointsFor2;

        const result =
          objectivePoints > objectivePointsOpponent
            ? 'Win'
            : objectivePoints < objectivePointsOpponent
              ? 'Loss'
              : 'Draw';

        matches.push({
          round: teamMatch.round,
          opponent: opponentTeam?.name || 'Unknown',
          result,
          tournamentPoints,
          objectivePoints,
          victoryPoints,
          tableNumber: teamMatch.tableNumber,
          player: player.nickname,
          opponentPlayer: opponentPlayer.nickname,
        });
      });
    });

    return matches.sort((a, b) => {
      if (a.round !== b.round) return a.round - b.round;
      return (a.player ?? '').localeCompare(b.player ?? '');
    });
  };

  // Get player match history
  const getPlayerMatchHistory = (player: Player): MatchHistoryEntry[] => {
    const matches: MatchHistoryEntry[] = [];

    teamMatches.forEach((teamMatch) => {
      if (!teamMatch.isCompleted || !teamMatch.individualMatches) return;

      teamMatch.individualMatches.forEach((match) => {
        if (!match.isCompleted) return;

        const isPlayer1 = match.player1Id === player.id;
        const isPlayer2 = match.player2Id === player.id;

        if (!isPlayer1 && !isPlayer2) return;

        const opponentId = isPlayer1 ? match.player2Id : match.player1Id;
        let opponentName = 'Unknown';

        teams.forEach((team) => {
          const foundPlayer = team.players.find((p) => p.id === opponentId);
          if (foundPlayer) {
            opponentName = `${foundPlayer.nickname} (${team.name})`;
          }
        });

        const objectivePoints = isPlayer1
          ? match.objectivePoints1
          : match.objectivePoints2;
        const objectivePointsOpponent = isPlayer1
          ? match.objectivePoints2
          : match.objectivePoints1;
        const result =
          objectivePoints > objectivePointsOpponent
            ? 'Win'
            : objectivePoints < objectivePointsOpponent
              ? 'Loss'
              : 'Draw';

        matches.push({
          round: teamMatch.round,
          opponent: opponentName,
          result,
          tournamentPoints: isPlayer1
            ? match.tournamentPoints1
            : match.tournamentPoints2,
          objectivePoints,
          victoryPoints: isPlayer1
            ? match.victoryPointsFor1
            : match.victoryPointsFor2,
        });
      });
    });

    return matches.sort((a, b) => a.round - b.round);
  };

  const renderRankBadge = (position: number) => {
    if (position === 1) {
      return (
        <Badge color="#f59e0b" variant="filled" size="lg" circle>
          <Medal size={16} />
        </Badge>
      );
    }
    if (position === 2) {
      return (
        <Badge color="#94a3b8" variant="filled" size="lg" circle>
          <Medal size={16} />
        </Badge>
      );
    }
    if (position === 3) {
      return (
        <Badge color="#b45309" variant="filled" size="lg" circle>
          <Medal size={16} />
        </Badge>
      );
    }
    return (
      <Badge variant="default" size="lg" circle>
        {position}
      </Badge>
    );
  };

  const renderDiff = (value: number) => (
    <Text span c={value >= 0 ? 'teal' : 'red'} size="sm">
      {value >= 0 ? '+' : ''}
      {value}
    </Text>
  );

  const renderWDL = (wins: number, draws: number, losses: number) => (
    <Group gap={4} wrap="nowrap">
      <Text span c="teal" fw={700} size="sm">{wins}</Text>
      <Text span c="dimmed" size="sm">-</Text>
      <Text span c="yellow" fw={700} size="sm">{draws}</Text>
      <Text span c="dimmed" size="sm">-</Text>
      <Text span c="red" fw={700} size="sm">{losses}</Text>
    </Group>
  );

  return (
    <Container size="xl" py="md">
      <Group gap="xs" mb="lg">
        <Trophy size={28} />
        <Title order={2}>Tournament Rankings</Title>
      </Group>

      {teams.length === 0 ? (
        <Paper p="lg" radius="md" withBorder>
          <Stack align="center" py="xl">
            <Trophy size={48} />
            <Title order={3}>No Rankings Yet</Title>
            <Text c="dimmed">
              Rankings will appear once teams are registered and matches are
              played.
            </Text>
          </Stack>
        </Paper>
      ) : (
        <>
          {/* Team Rankings */}
          <Paper p="lg" radius="md" withBorder mb="lg">
            <Group gap="xs" mb="md">
              <Building2 size={22} />
              <Title order={3}>Team Rankings</Title>
              <Text c="dimmed" size="sm">(includes painted army bonuses)</Text>
            </Group>

            {teamRankings.length === 0 ? (
              <Text c="dimmed">
                No matches completed yet. Rankings will appear after matches are
                played.
              </Text>
            ) : (
              <Table.ScrollContainer minWidth={800}>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Rank</Table.Th>
                      <Table.Th>Team</Table.Th>
                      <Table.Th>Tournament Pts</Table.Th>
                      <Table.Th>Obj Pts</Table.Th>
                      <Table.Th>Obj Against</Table.Th>
                      <Table.Th>Obj Diff</Table.Th>
                      <Table.Th>Own VP</Table.Th>
                      <Table.Th>Enemy VP</Table.Th>
                      <Table.Th>VP Diff</Table.Th>
                      <Table.Th>Matches</Table.Th>
                      <Table.Th>W-D-L</Table.Th>
                      <Table.Th>Paint Bonus</Table.Th>
                      <Table.Th>History</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {teamRankings.map((ranking, index) => (
                      <Table.Tr key={ranking.team.id}>
                        <Table.Td>{renderRankBadge(index + 1)}</Table.Td>
                        <Table.Td>
                          <Text fw={700}>{ranking.team.name}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text fw={700} c="cyan">
                            {ranking.tournamentPoints}
                          </Text>
                        </Table.Td>
                        <Table.Td>{ranking.objectivePoints}</Table.Td>
                        <Table.Td>
                          <Text span c="red">
                            {ranking.objectivePointsAgainst}
                          </Text>
                        </Table.Td>
                        <Table.Td>{renderDiff(ranking.objectivePointsDifference)}</Table.Td>
                        <Table.Td>
                          <Text span c="teal">
                            {ranking.victoryPointsFor}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text span c="red">
                            {ranking.victoryPointsAgainst}
                          </Text>
                        </Table.Td>
                        <Table.Td>{renderDiff(ranking.victoryPointsDifference)}</Table.Td>
                        <Table.Td>{ranking.matchesPlayed}</Table.Td>
                        <Table.Td>
                          {renderWDL(ranking.wins, ranking.draws, ranking.losses)}
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            color={ranking.paintedBonus > 0 ? 'teal' : 'gray'}
                            variant="light"
                          >
                            +{ranking.paintedBonus}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Button
                            variant="light"
                            size="xs"
                            leftSection={<BarChart3 size={14} />}
                            onClick={() =>
                              setSelectedTeamHistory(ranking.team)
                            }
                          >
                            View
                          </Button>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </Paper>

          {/* Player Rankings */}
          <Paper p="lg" radius="md" withBorder>
            <Group gap="xs" mb="md">
              <Gamepad2 size={22} />
              <Title order={3}>Individual Player Rankings</Title>
              <Text c="dimmed" size="sm">(excludes painted army bonuses)</Text>
            </Group>

            {playerRankings.length === 0 ? (
              <Text c="dimmed">
                No matches completed yet. Rankings will appear after matches are
                played.
              </Text>
            ) : (
              <Table.ScrollContainer minWidth={800}>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Rank</Table.Th>
                      <Table.Th>Player</Table.Th>
                      <Table.Th>Team</Table.Th>
                      <Table.Th>Army</Table.Th>
                      <Table.Th>Tournament Pts</Table.Th>
                      <Table.Th>Obj Pts</Table.Th>
                      <Table.Th>Obj Against</Table.Th>
                      <Table.Th>Obj Diff</Table.Th>
                      <Table.Th>Own VP</Table.Th>
                      <Table.Th>Enemy VP</Table.Th>
                      <Table.Th>VP Diff</Table.Th>
                      <Table.Th>Matches</Table.Th>
                      <Table.Th>W-D-L</Table.Th>
                      <Table.Th>History</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {playerRankings.map((ranking, index) => (
                      <Table.Tr key={ranking.player.id}>
                        <Table.Td>{renderRankBadge(index + 1)}</Table.Td>
                        <Table.Td>
                          <Group gap={4} wrap="nowrap">
                            {ranking.player.isCaptain && (
                              <Crown size={14} color="#f59e0b" />
                            )}
                            <Text fw={700}>{ranking.player.nickname}</Text>
                            {ranking.player.isPainted && (
                              <Palette size={14} color="#12b886" />
                            )}
                          </Group>
                        </Table.Td>
                        <Table.Td>{ranking.team.name}</Table.Td>
                        <Table.Td>
                          <Badge variant="light" color="cyan" size="xs">
                            {ranking.player.army}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text fw={700} c="cyan">
                            {ranking.tournamentPoints}
                          </Text>
                        </Table.Td>
                        <Table.Td>{ranking.objectivePoints}</Table.Td>
                        <Table.Td>
                          <Text span c="red">
                            {ranking.objectivePointsAgainst}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          {renderDiff(ranking.objectivePointsDifference)}
                        </Table.Td>
                        <Table.Td>
                          <Text span c="teal">
                            {ranking.victoryPointsFor}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text span c="red">
                            {ranking.victoryPointsAgainst}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          {renderDiff(ranking.victoryPointsDifference)}
                        </Table.Td>
                        <Table.Td>{ranking.matchesPlayed}</Table.Td>
                        <Table.Td>
                          {renderWDL(ranking.wins, ranking.draws, ranking.losses)}
                        </Table.Td>
                        <Table.Td>
                          <Button
                            variant="light"
                            size="xs"
                            leftSection={<BarChart3 size={14} />}
                            onClick={() =>
                              setSelectedPlayerHistory({
                                player: ranking.player,
                                team: ranking.team,
                              })
                            }
                          >
                            View
                          </Button>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </Paper>
        </>
      )}

      {/* Team Match History Modal */}
      {selectedTeamHistory && (
        <MatchHistoryModal
          isOpen={true}
          onClose={() => setSelectedTeamHistory(null)}
          title={`${selectedTeamHistory.name} - Match History`}
          matches={getTeamMatchHistory(selectedTeamHistory)}
          isTeamHistory={true}
        />
      )}

      {/* Player Match History Modal */}
      {selectedPlayerHistory && (
        <MatchHistoryModal
          isOpen={true}
          onClose={() => setSelectedPlayerHistory(null)}
          title={`${selectedPlayerHistory.player.nickname} (${selectedPlayerHistory.team.name}) - Match History`}
          matches={getPlayerMatchHistory(selectedPlayerHistory.player)}
          isTeamHistory={false}
        />
      )}
    </Container>
  );
};

export default Rankings;
