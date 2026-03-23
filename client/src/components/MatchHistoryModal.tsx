import React from 'react';
import { BarChart3, Target } from 'lucide-react';
import { Table, Badge, Text, Group, Stack } from '@mantine/core';
import Modal from './Modal';

export interface MatchHistoryEntry {
  round: number;
  opponent: string;
  result: string;
  tournamentPoints: number;
  objectivePoints: number;
  victoryPoints: number;
  tableNumber?: number;
  player?: string;
  opponentPlayer?: string;
}

interface MatchHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  matches: MatchHistoryEntry[];
  isTeamHistory?: boolean;
}

const resultColor = (result: string) =>
  result === 'Win' ? 'teal' : result === 'Loss' ? 'red' : 'yellow';

const MatchHistoryModal: React.FC<MatchHistoryModalProps> = ({
  isOpen,
  onClose,
  title,
  matches,
  isTeamHistory = false,
}) => {
  const groupedMatches = isTeamHistory
    ? matches.reduce((acc, match) => {
        if (!acc[match.round]) {
          acc[match.round] = [];
        }
        acc[match.round].push(match);
        return acc;
      }, {} as Record<number, MatchHistoryEntry[]>)
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      titleIcon={<BarChart3 size={20} />}
      size="xl"
    >
      {matches.length === 0 ? (
        <Text c="dimmed">No matches played yet.</Text>
      ) : isTeamHistory && groupedMatches ? (
        <Stack gap="lg">
          {Object.entries(groupedMatches).map(([round, roundMatches]) => (
            <div key={round}>
              <Group gap="xs" mb="xs">
                <Target size={18} />
                <Text fw={600}>
                  Round {round} - vs {roundMatches[0].opponent} - Table{' '}
                  {roundMatches[0].tableNumber ? String.fromCharCode(64 + roundMatches[0].tableNumber) : '?'}
                </Text>
              </Group>

              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Player</Table.Th>
                    <Table.Th>Opponent</Table.Th>
                    <Table.Th>Result</Table.Th>
                    <Table.Th>Tourney Pts</Table.Th>
                    <Table.Th>Obj Pts</Table.Th>
                    <Table.Th>VP</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {roundMatches.map((match, index) => (
                    <Table.Tr key={index}>
                      <Table.Td fw={600}>{match.player}</Table.Td>
                      <Table.Td>{match.opponentPlayer}</Table.Td>
                      <Table.Td>
                        <Badge color={resultColor(match.result)} variant="light" size="sm">
                          {match.result}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text fw={700} c="cyan">{match.tournamentPoints}</Text>
                      </Table.Td>
                      <Table.Td>{match.objectivePoints}</Table.Td>
                      <Table.Td>{match.victoryPoints}</Table.Td>
                    </Table.Tr>
                  ))}
                  <Table.Tr style={{ borderTop: '2px solid var(--mantine-color-dark-4)' }}>
                    <Table.Td colSpan={3}><Text fw={700}>Round Total:</Text></Table.Td>
                    <Table.Td>
                      <Text fw={700} c="cyan">
                        {roundMatches.reduce((sum, m) => sum + m.tournamentPoints, 0)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      {roundMatches.reduce((sum, m) => sum + m.objectivePoints, 0)}
                    </Table.Td>
                    <Table.Td>
                      {roundMatches.reduce((sum, m) => sum + m.victoryPoints, 0)}
                    </Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
            </div>
          ))}
        </Stack>
      ) : (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Round</Table.Th>
              <Table.Th>Opponent</Table.Th>
              <Table.Th>Result</Table.Th>
              <Table.Th>Tourney Pts</Table.Th>
              <Table.Th>Obj Pts</Table.Th>
              <Table.Th>VP</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {matches.map((match, index) => (
              <Table.Tr key={index}>
                <Table.Td fw={600}>Round {match.round}</Table.Td>
                <Table.Td>{match.opponent}</Table.Td>
                <Table.Td>
                  <Badge color={resultColor(match.result)} variant="light" size="sm">
                    {match.result}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text fw={700} c="cyan">{match.tournamentPoints}</Text>
                </Table.Td>
                <Table.Td>{match.objectivePoints}</Table.Td>
                <Table.Td>{match.victoryPoints}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Modal>
  );
};

export default MatchHistoryModal;
