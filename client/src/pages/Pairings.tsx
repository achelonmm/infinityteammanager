import React, { useState, useEffect } from 'react';
import {
  Swords,
  Shuffle,
  Eye,
  Info,
  Save,
  X,
  Target,
  CheckCircle2,
  ClipboardEdit,
  Pencil,
  Trash2,
  Gamepad2,
  SkipForward,
} from 'lucide-react';
import {
  Container,
  Paper,
  Title,
  Group,
  Stack,
  Button,
  Alert,
  Select,
  Badge,
  Text,
  Box,
  Divider,
  SimpleGrid,
  ThemeIcon,
} from '@mantine/core';
import { useTournament } from '../contexts/TournamentContext';
import { useToast } from '../contexts/ToastContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import IndividualMatchResultForm from '../components/IndividualMatchResultForm';
import { IndividualMatch, Player, Team, TeamMatch } from '../types';

const Pairings: React.FC = () => {
  const {
    getTeams,
    generatePairings,
    savePairings,
    clearPairings,
    updatePairings,
    deleteRoundMatches,
    getCurrentRoundMatches,
    setIndividualPairings,
    updateIndividualMatch,
    canAdvanceToNextRound,
    advanceToNextRound,
    getCurrentRound,
    getAllRounds,
    getRoundMatches,
    loading,
    pairings
  } = useTournament();

  const toast = useToast();

  const [selectedMatch, setSelectedMatch] = useState<{
    individualMatch: IndividualMatch;
    player1: Player;
    player2: Player;
  } | null>(null);

  const [, setLocalIndividualPairings] = useState<{ [key: string]: { player1Id: string; player2Id: string }[] }>({});
  const [selectedRound, setSelectedRound] = useState<number | null>(null);

  const teams = getTeams();
  const currentRoundMatches = getCurrentRoundMatches();
  const currentRound = getCurrentRound();
  const allRounds = getAllRounds();

  useEffect(() => {
    if (selectedRound === null && currentRound > 0) {
      setSelectedRound(currentRound);
    }
  }, [currentRound, selectedRound]);

  const handleGeneratePairings = async () => {
    try {
      await generatePairings();
    } catch (error) {
      console.error('Error generating pairings:', error);
      toast.error('Error generating pairings: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleSavePairings = async () => {
    try {
      await savePairings(pairings);
      setLocalIndividualPairings({});
    } catch (error) {
      console.error('Error saving pairings:', error);
    }
  };

  const handleSetIndividualPairings = async (teamMatchId: string, pairingsData: { player1Id: string; player2Id: string }[]) => {
    try {
      await setIndividualPairings(teamMatchId, pairingsData);
      setLocalIndividualPairings(prev => ({ ...prev, [teamMatchId]: pairingsData }));
    } catch (error) {
      console.error('Error setting individual pairings:', error);
    }
  };

  const handleSaveMatchResult = async (matchId: string, results: Partial<IndividualMatch>) => {
    try {
      await updateIndividualMatch(matchId, results);
      setSelectedMatch(null);
      setSelectedRound(selectedRound); // This will trigger a re-render
    } catch (error) {
      console.error('Error saving match result:', error);
      toast.error('Error saving match result. Please try again.');
    }
  };

  const handleAdvanceRound = async () => {
    const confirmed = await toast.confirm(
      'Are you sure you want to advance to the next round?',
      { confirmLabel: 'Advance' }
    );
    if (confirmed) {
      try {
        await advanceToNextRound();
        setSelectedRound(currentRound + 1);
      } catch (error) {
        console.error('Error advancing round:', error);
      }
    }
  };

  const handleDeleteRound = async () => {
    const confirmed = await toast.confirm(
      'Are you sure you want to delete all matches for this round?',
      { variant: 'danger', confirmLabel: 'Delete' }
    );
    if (confirmed) {
      try {
        await deleteRoundMatches(currentRound);
      } catch (error) {
        console.error('Error deleting round:', error);
        toast.error('Failed to delete round matches');
      }
    }
  };

  const displayedMatches = selectedRound !== null ? getRoundMatches(selectedRound) : currentRoundMatches;
  const isViewingCurrentRound = selectedRound === currentRound;

  if (loading) {
    return (
      <Container size="xl" py="md">
        <Group mb="lg">
          <ThemeIcon size="lg" variant="light" color="cyan">
            <Swords size={28} />
          </ThemeIcon>
          <Title order={2}>Pairings &amp; Results</Title>
        </Group>
        <Paper p="lg" radius="md" withBorder>
          <LoadingSkeleton variant="card" count={3} />
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="xl" py="md">
      <Group mb="lg">
        <ThemeIcon size="lg" variant="light" color="cyan">
          <Swords size={28} />
        </ThemeIcon>
        <Title order={2}>Pairings &amp; Results</Title>
      </Group>

      {/* Round Selector */}
      {allRounds.length > 0 && (
        <Paper p="lg" radius="md" withBorder mb="md">
          <Group>
            <Text fw={600} size="sm">View Round:</Text>
            {allRounds.map(round => (
              <Button
                key={round}
                onClick={() => setSelectedRound(round)}
                variant={selectedRound === round ? 'filled' : 'outline'}
                size="xs"
              >
                Round {round}
              </Button>
            ))}
          </Group>
        </Paper>
      )}

      {/* Generate Pairings Section (only show for current round) */}
      {isViewingCurrentRound && currentRoundMatches.length === 0 && pairings.length === 0 && (
        <Paper p="lg" radius="md" withBorder mb="md">
          <Title order={3} mb="md">
            Round {currentRound} - Generate Pairings
          </Title>

          <Stack align="center" gap="md">
            <Text c="dimmed" ta="center">
              Generate pairings for round {currentRound}. Teams will be paired based on their current standings.
            </Text>
            <Button
              onClick={handleGeneratePairings}
              leftSection={<Shuffle size={20} />}
              size="lg"
            >
              Generate Round {currentRound} Pairings
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Preview Generated Pairings */}
      {pairings.length > 0 && (
        <Paper p="lg" radius="md" withBorder mb="md">
          <Group mb="md">
            <Eye size={22} />
            <Title order={3}>Preview Round {currentRound} Pairings</Title>
          </Group>

          <Alert icon={<Info size={16} />} color="blue" mb="md">
            <strong>Review the pairings below.</strong> You can adjust table group assignments before saving.
            Teams are paired to avoid previous opponents and table groups when possible.
          </Alert>

          {pairings.map((pairing, index) => {
            const team1 = teams.find(t => t.id === pairing.team1Id);
            const team2 = teams.find(t => t.id === pairing.team2Id);

            return (
              <Paper key={index} p="md" radius="sm" withBorder mb="sm" bg="var(--mantine-color-dark-7)">
                <SimpleGrid cols={{ base: 1, sm: 4 }} spacing="md" verticalSpacing="md">
                  {/* Table selector */}
                  <div>
                    <Select
                      label="Table Group:"
                      value={String(pairing.tableNumber)}
                      onChange={(value) => {
                        const newPairings = [...pairings];
                        newPairings[index] = { ...newPairings[index], tableNumber: parseInt(value || '1') };
                        updatePairings(newPairings);
                      }}
                      data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => ({
                        value: String(num),
                        label: `Table ${String.fromCharCode(64 + num)}`,
                      }))}
                    />
                  </div>

                  {/* Team 1 selector */}
                  <div>
                    <Select
                      label="Team 1:"
                      value={pairing.team1Id}
                      onChange={(value) => {
                        const newPairings = [...pairings];
                        newPairings[index] = { ...newPairings[index], team1Id: value || '' };
                        updatePairings(newPairings);
                      }}
                      data={teams.map(team => ({
                        value: team.id,
                        label: team.name,
                      }))}
                    />
                    <Text size="xs" c="dimmed" mt={4}>
                      {team1?.players.map(p => p.nickname).join(', ')}
                    </Text>
                  </div>

                  {/* VS */}
                  <Stack align="center" justify="center">
                    <ThemeIcon variant="light" color="gray" size="lg" radius="xl">
                      <Swords size={24} />
                    </ThemeIcon>
                  </Stack>

                  {/* Team 2 selector */}
                  <div>
                    <Select
                      label="Team 2:"
                      value={pairing.team2Id}
                      onChange={(value) => {
                        const newPairings = [...pairings];
                        newPairings[index] = { ...newPairings[index], team2Id: value || '' };
                        updatePairings(newPairings);
                      }}
                      data={teams.map(team => ({
                        value: team.id,
                        label: team.name,
                      }))}
                    />
                    <Text size="xs" c="dimmed" mt={4}>
                      {team2?.players.map(p => p.nickname).join(', ')}
                    </Text>
                  </div>
                </SimpleGrid>
              </Paper>
            );
          })}

          <Group justify="flex-end" mt="md">
            <Button
              onClick={clearPairings}
              variant="outline"
              leftSection={<X size={18} />}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePairings}
              color="green"
              leftSection={<Save size={20} />}
            >
              Save Pairings
            </Button>
          </Group>
        </Paper>
      )}

      {/* Display Current/Selected Round Matches */}
      {displayedMatches.length > 0 && (
        <Paper p="lg" radius="md" withBorder mb="md">
          <Group justify="space-between" mb="md">
            <Group>
              <Target size={22} />
              <Title order={3}>Round {selectedRound} Matches</Title>
            </Group>

            <Group>
              {/* Advance to Next Round Button */}
              {isViewingCurrentRound && canAdvanceToNextRound && (
                <Button
                  onClick={handleAdvanceRound}
                  color="green"
                  leftSection={<SkipForward size={18} />}
                >
                  Advance to Round {currentRound + 1}
                </Button>
              )}

              {isViewingCurrentRound && currentRoundMatches.length > 0 && !currentRoundMatches.some(m => m.isCompleted) && (
                <Button
                  onClick={handleDeleteRound}
                  color="yellow"
                  variant="outline"
                  leftSection={<Trash2 size={18} />}
                >
                  Delete Round {currentRound} Matches
                </Button>
              )}
            </Group>
          </Group>

          {displayedMatches.map((teamMatch) => {
            const team1 = teams.find(t => t.id === teamMatch.team1Id);
            const team2 = teams.find(t => t.id === teamMatch.team2Id);
            const hasIndividualMatches = teamMatch.individualMatches && teamMatch.individualMatches.length > 0;

            return (
              <Paper key={teamMatch.id} p="md" radius="sm" withBorder mb="sm" bg="var(--mantine-color-dark-7)">
                {/* Team Match Header */}
                <SimpleGrid
                  cols={{ base: 1, sm: 4 }}
                  spacing="md"
                  verticalSpacing="md"
                  mb={hasIndividualMatches ? 'md' : undefined}
                >
                  <div>
                    <Badge size="lg" variant="light" color="cyan">
                      Table {String.fromCharCode(64 + teamMatch.tableNumber)}
                    </Badge>
                  </div>

                  <div>
                    <Text fw={700} size="lg" c="cyan">
                      {team1?.name || 'Unknown Team'}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {team1?.players.map(p => p.nickname).join(', ')}
                    </Text>
                  </div>

                  <Stack align="center" justify="center">
                    <ThemeIcon variant="light" color="gray" size="lg" radius="xl">
                      <Swords size={24} />
                    </ThemeIcon>
                  </Stack>

                  <div>
                    <Text fw={700} size="lg" c="orange">
                      {team2?.name || 'Unknown Team'}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {team2?.players.map(p => p.nickname).join(', ')}
                    </Text>
                  </div>

                  {teamMatch.isCompleted && (
                    <div>
                      <Badge color="green" leftSection={<CheckCircle2 size={14} />}>
                        Completed
                      </Badge>
                    </div>
                  )}
                </SimpleGrid>

                {/* Individual Matches */}
                {hasIndividualMatches ? (
                  <Box>
                    <Divider mb="sm" />
                    <Text fw={600} size="sm" mb="sm">Individual Matches:</Text>
                    {teamMatch.individualMatches.map((indMatch) => {
                      const player1 = team1?.players.find(p => p.id === indMatch.player1Id);
                      const player2 = team2?.players.find(p => p.id === indMatch.player2Id);

                      return (
                        <Paper
                          key={indMatch.id}
                          p="sm"
                          radius="sm"
                          mb="xs"
                          withBorder
                          bg={indMatch.isCompleted ? 'var(--mantine-color-dark-6)' : undefined}
                        >
                          <SimpleGrid cols={{ base: 1, sm: 4 }} spacing="sm" verticalSpacing="sm">
                            <div>
                              <Text fw={600} size="sm">{player1?.nickname || 'Unknown'}</Text>
                              <Text size="xs" c="dimmed">{player1?.army}</Text>
                              {indMatch.isCompleted && (
                                <Group gap={4} mt={4}>
                                  <Text size="xs" fw={700} c="cyan">{indMatch.tournamentPoints1} pts</Text>
                                  <Text size="xs" c="dimmed">|</Text>
                                  <Text size="xs">{indMatch.objectivePoints1} obj</Text>
                                  <Text size="xs" c="dimmed">|</Text>
                                  <Text size="xs">{indMatch.victoryPointsFor1} VP</Text>
                                </Group>
                              )}
                            </div>

                            <Stack align="center" justify="center">
                              <Swords size={18} />
                            </Stack>

                            <div>
                              <Text fw={600} size="sm">{player2?.nickname || 'Unknown'}</Text>
                              <Text size="xs" c="dimmed">{player2?.army}</Text>
                              {indMatch.isCompleted && (
                                <Group gap={4} mt={4}>
                                  <Text size="xs" fw={700} c="orange">{indMatch.tournamentPoints2} pts</Text>
                                  <Text size="xs" c="dimmed">|</Text>
                                  <Text size="xs">{indMatch.objectivePoints2} obj</Text>
                                  <Text size="xs" c="dimmed">|</Text>
                                  <Text size="xs">{indMatch.victoryPointsFor2} VP</Text>
                                </Group>
                              )}
                            </div>

                            <Stack align="flex-end" justify="center">
                              {player1 && player2 && (
                                !indMatch.isCompleted ? (
                                  <Button
                                    onClick={() => setSelectedMatch({ individualMatch: indMatch, player1, player2 })}
                                    size="xs"
                                    leftSection={<ClipboardEdit size={14} />}
                                  >
                                    Enter Results
                                  </Button>
                                ) : (
                                  <Button
                                    onClick={() => setSelectedMatch({ individualMatch: indMatch, player1, player2 })}
                                    size="xs"
                                    variant="default"
                                    leftSection={<Pencil size={14} />}
                                  >
                                    Edit Results
                                  </Button>
                                )
                              )}

                              {indMatch.isCompleted && (
                                <Badge color="green" size="sm" leftSection={<CheckCircle2 size={12} />}>
                                  Complete
                                </Badge>
                              )}
                            </Stack>
                          </SimpleGrid>
                        </Paper>
                      );
                    })}
                  </Box>
                ) : (
                  team1 && team2 && !teamMatch.isCompleted && (
                    <PairingSetup
                      teamMatch={teamMatch}
                      team1={team1}
                      team2={team2}
                      onSave={handleSetIndividualPairings}
                    />
                  )
                )}
              </Paper>
            );
          })}
        </Paper>
      )}

      {/* No matches state */}
      {displayedMatches.length === 0 && pairings.length === 0 && !isViewingCurrentRound && (
        <Paper p="lg" radius="md" withBorder>
          <Stack align="center" gap="md" py="xl">
            <ThemeIcon size={64} radius="xl" variant="light" color="gray">
              <Gamepad2 size={48} />
            </ThemeIcon>
            <Text c="dimmed" size="lg">
              No matches found for Round {selectedRound}.
            </Text>
          </Stack>
        </Paper>
      )}

      {/* Match Result Form Modal */}
      {selectedMatch && (
        <IndividualMatchResultForm
          individualMatch={selectedMatch.individualMatch}
          player1={selectedMatch.player1}
          player2={selectedMatch.player2}
          onSave={handleSaveMatchResult}
          onCancel={() => setSelectedMatch(null)}
        />
      )}
    </Container>
  );
};

// Pairing Setup Component
interface PairingSetupProps {
  teamMatch: TeamMatch;
  team1: Team;
  team2: Team;
  onSave: (teamMatchId: string, pairings: { player1Id: string; player2Id: string }[]) => void;
}

const PairingSetup: React.FC<PairingSetupProps> = ({ teamMatch, team1, team2, onSave }) => {
  const toast = useToast();
  const [pairings, setPairings] = useState<{ player1Id: string; player2Id: string }[]>([
    { player1Id: '', player2Id: '' },
    { player1Id: '', player2Id: '' },
    { player1Id: '', player2Id: '' }
  ]);

  const handlePairingChange = (index: number, field: 'player1Id' | 'player2Id', value: string) => {
    const newPairings = [...pairings];
    newPairings[index] = { ...newPairings[index], [field]: value };
    setPairings(newPairings);
  };

  // Get available players for team 1 (exclude already selected)
  const getAvailableTeam1Players = (currentIndex: number) => {
    const selectedPlayerIds = pairings
      .map((p, idx) => idx !== currentIndex ? p.player1Id : null)
      .filter(Boolean);
    return team1.players.filter((player: Player) => !selectedPlayerIds.includes(player.id));
  };

  // Get available players for team 2 (exclude already selected)
  const getAvailableTeam2Players = (currentIndex: number) => {
    const selectedPlayerIds = pairings
      .map((p, idx) => idx !== currentIndex ? p.player2Id : null)
      .filter(Boolean);
    return team2.players.filter((player: Player) => !selectedPlayerIds.includes(player.id));
  };

  const handleSubmit = () => {
    // Validate all pairings are filled
    if (!pairings.every(p => p.player1Id && p.player2Id)) {
      toast.warning('Please select all players for all matches');
      return;
    }

    // Check for duplicates
    const team1Players = pairings.map(p => p.player1Id);
    const team2Players = pairings.map(p => p.player2Id);

    if (new Set(team1Players).size !== 3 || new Set(team2Players).size !== 3) {
      toast.warning('Each player can only be in one match');
      return;
    }

    onSave(teamMatch.id, pairings);
  };

  const isValid = pairings.every(p => p.player1Id && p.player2Id);

  return (
    <Box mt="md">
      <Divider mb="sm" />
      <Group mb="sm">
        <Target size={18} />
        <Text fw={600} size="sm">Set Individual Player Pairings</Text>
      </Group>

      {pairings.map((pairing, index) => (
        <SimpleGrid key={index} cols={{ base: 1, sm: 3 }} spacing="sm" mb="sm">
          <Select
            value={pairing.player1Id || null}
            onChange={(value) => handlePairingChange(index, 'player1Id', value || '')}
            placeholder={`Select ${team1.name} Player`}
            data={getAvailableTeam1Players(index).map((player: Player) => ({
              value: player.id,
              label: `${player.nickname} (${player.army})`,
            }))}
          />

          <Stack align="center" justify="center">
            <Swords size={18} />
          </Stack>

          <Select
            value={pairing.player2Id || null}
            onChange={(value) => handlePairingChange(index, 'player2Id', value || '')}
            placeholder={`Select ${team2.name} Player`}
            data={getAvailableTeam2Players(index).map((player: Player) => ({
              value: player.id,
              label: `${player.nickname} (${player.army})`,
            }))}
          />
        </SimpleGrid>
      ))}

      <Group justify="flex-end" mt="md">
        <Button
          onClick={handleSubmit}
          disabled={!isValid}
          leftSection={<Save size={18} />}
        >
          Save Individual Pairings
        </Button>
      </Group>
    </Box>
  );
};

export default Pairings;
