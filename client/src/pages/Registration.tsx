import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Users,
  Crown,
  Gamepad2,
  Rocket,
  CheckCircle2,
} from 'lucide-react';
import {
  Container, Paper, Title, Group, Stack, Text, Button, Alert,
  TextInput, Select, Stepper, Radio, Badge, Loader,
} from '@mantine/core';
import { useTournament } from '../contexts/TournamentContext';
import { useToast } from '../contexts/ToastContext';
import { ARMIES } from '../utils/armies';

interface PlayerForm {
  nickname: string;
  itsPin: string;
  army: string;
  isCaptain: boolean;
}

const Registration: React.FC = () => {
  const navigate = useNavigate();
  const { addTeam, loading, error } = useTournament();
  const toast = useToast();
  const [teamName, setTeamName] = useState('');
  const [players, setPlayers] = useState<PlayerForm[]>([
    { nickname: '', itsPin: '', army: '', isCaptain: false },
    { nickname: '', itsPin: '', army: '', isCaptain: false },
    { nickname: '', itsPin: '', army: '', isCaptain: false }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const handlePlayerChange = (index: number, field: keyof PlayerForm, value: string | boolean) => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], [field]: value };

    if (field === 'isCaptain' && value === true) {
      newPlayers.forEach((player, i) => {
        if (i !== index) player.isCaptain = false;
      });
    }

    setPlayers(newPlayers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamName.trim()) {
      toast.warning('Please enter a team name');
      return;
    }

    const captainCount = players.filter(p => p.isCaptain).length;
    if (captainCount !== 1) {
      toast.warning('Please select exactly one captain');
      return;
    }

    if (players.some(p => !p.nickname.trim() || !p.itsPin.trim() || !p.army)) {
      toast.warning('Please fill in all player information');
      return;
    }

    setSubmitting(true);

    try {
      const teamData = {
        name: teamName,
        tournamentId: '',
        captainId: '',
        players: players.map((player) => ({
          id: '',
          nickname: player.nickname,
          itsPin: player.itsPin,
          army: player.army,
          isCaptain: player.isCaptain,
          teamId: '',
          isPainted: false,
          armyListLate: false
        }))
      };

      await addTeam(teamData);

      toast.success('Team registered successfully!');

      setTeamName('');
      setPlayers([
        { nickname: '', itsPin: '', army: '', isCaptain: false },
        { nickname: '', itsPin: '', army: '', isCaptain: false },
        { nickname: '', itsPin: '', army: '', isCaptain: false }
      ]);
      setCurrentStep(0);

      navigate('/teams');
    } catch (err) {
      console.error('Error registering team:', err);
      toast.error('Error registering team. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = () => {
    return teamName.trim() &&
           players.filter(p => p.isCaptain).length === 1 &&
           players.every(p => p.nickname.trim() && p.itsPin.trim() && p.army);
  };

  const armyOptions = ARMIES.map(a => ({ value: a, label: a }));

  return (
    <Container size="xl" py="md">
      <Group gap="xs" mb="lg">
        <UserPlus size={28} />
        <Title order={2}>Team Registration</Title>
      </Group>

      {error && (
        <Alert color="red" variant="light" title="Error" mb="md">{error}</Alert>
      )}

      <Stepper active={currentStep} onStepClick={setCurrentStep} mb="lg">
        <Stepper.Step label="Team Name" description="Name your team" />
        <Stepper.Step label="Player 1" description={players[0].nickname || 'Set up player'} />
        <Stepper.Step label="Player 2" description={players[1].nickname || 'Set up player'} />
        <Stepper.Step label="Player 3" description={players[2].nickname || 'Set up player'} />
      </Stepper>

      <form onSubmit={handleSubmit}>
        <Paper p="lg" radius="md" withBorder pos="relative">
          {(loading || submitting) && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.5)', borderRadius: 'inherit', zIndex: 10,
            }}>
              <Loader color="cyan" />
            </div>
          )}

          <Group gap="xs" mb="lg">
            <Rocket size={24} />
            <Title order={3}>Register Your Team</Title>
          </Group>

          {/* Team Name Step */}
          {currentStep === 0 && (
            <Stack gap="md">
              <TextInput
                label="Team Name"
                placeholder="Enter your team name (e.g., 'Steel Wolves')"
                value={teamName}
                onChange={(e) => setTeamName(e.currentTarget.value)}
                disabled={loading || submitting}
                size="md"
                autoFocus
              />
              <Group justify="flex-end">
                <Button
                  onClick={() => setCurrentStep(1)}
                  disabled={!teamName.trim()}
                  leftSection={<Rocket size={18} />}
                >
                  Continue to Players
                </Button>
              </Group>
            </Stack>
          )}

          {/* Player Steps */}
          {currentStep >= 1 && currentStep <= 3 && (
            <Stack gap="md">
              <Group gap="xs" mb="xs">
                <Users size={22} />
                <Title order={4}>Players</Title>
              </Group>

              {players.map((player, index) => {
                const stepIndex = index + 1;
                const isActive = currentStep === stepIndex;

                return (
                  <Paper
                    key={index}
                    p="md"
                    radius="md"
                    withBorder
                    style={{
                      borderColor: isActive ? 'var(--mantine-color-cyan-5)' : undefined,
                      cursor: 'pointer',
                    }}
                    onClick={() => setCurrentStep(stepIndex)}
                  >
                    <Group gap="xs" mb={isActive ? 'md' : 0}>
                      {player.isCaptain ? (
                        <Crown size={24} color="var(--mantine-color-yellow-5)" />
                      ) : (
                        <Gamepad2 size={24} />
                      )}
                      <Text fw={600}>
                        Player {index + 1}
                        {player.isCaptain && (
                          <Badge ml="xs" color="yellow" variant="light" size="sm">Captain</Badge>
                        )}
                      </Text>
                    </Group>

                    {isActive && (
                      <Stack gap="md">
                        <Group grow>
                          <TextInput
                            label="Nickname"
                            placeholder="Player nickname"
                            value={player.nickname}
                            onChange={(e) => handlePlayerChange(index, 'nickname', e.currentTarget.value)}
                            disabled={loading || submitting}
                          />
                          <TextInput
                            label="ITS Pin"
                            placeholder="ITS Pin number"
                            value={player.itsPin}
                            onChange={(e) => handlePlayerChange(index, 'itsPin', e.currentTarget.value)}
                            disabled={loading || submitting}
                          />
                        </Group>

                        <Select
                          label="Army/Sectorial"
                          placeholder="Select Army"
                          data={armyOptions}
                          value={player.army || null}
                          onChange={(v) => handlePlayerChange(index, 'army', v || '')}
                          disabled={loading || submitting}
                          searchable
                        />

                        <Radio
                          label="Team Captain"
                          description="Select this player as the team captain"
                          checked={player.isCaptain}
                          onChange={(e) => handlePlayerChange(index, 'isCaptain', e.currentTarget.checked)}
                          disabled={loading || submitting}
                        />
                      </Stack>
                    )}

                    {!isActive && (
                      <Group gap="lg" mt="xs">
                        <Text size="sm" c="dimmed">
                          <strong>Nickname:</strong> {player.nickname || 'Not set'}
                        </Text>
                        <Text size="sm" c="dimmed">
                          <strong>Army:</strong> {player.army || 'Not selected'}
                        </Text>
                      </Group>
                    )}
                  </Paper>
                );
              })}

              {/* Navigation */}
              <Group justify="space-between" mt="md">
                <Button
                  variant="default"
                  onClick={() => setCurrentStep(currentStep > 1 ? currentStep - 1 : 0)}
                  disabled={loading || submitting}
                >
                  Back
                </Button>

                <Text size="sm" c="dimmed">Step {currentStep + 1} of 4</Text>

                {currentStep < 3 ? (
                  <Button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={loading || submitting}
                  >
                    Next Player
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    color="teal"
                    loading={submitting}
                    disabled={loading || !isFormValid()}
                    leftSection={<CheckCircle2 size={18} />}
                  >
                    Register Team
                  </Button>
                )}
              </Group>
            </Stack>
          )}
        </Paper>
      </form>
    </Container>
  );
};

export default Registration;
