import React, { useState } from 'react';
import { Swords, Save } from 'lucide-react';
import { Select, Button, Group, Stack, Text, Paper, Badge, Alert } from '@mantine/core';
import { Team } from '../types';
import Modal from './Modal';

interface IndividualPairingsFormProps {
  teamMatch: unknown;
  team1: Team;
  team2: Team;
  onSave: (pairings: { player1Id: string; player2Id: string }[]) => void;
  onCancel: () => void;
}

const IndividualPairingsForm: React.FC<IndividualPairingsFormProps> = ({
  teamMatch,
  team1,
  team2,
  onSave,
  onCancel
}) => {
  const [pairings, setPairings] = useState<{ player1Id: string; player2Id: string }[]>([
    { player1Id: '', player2Id: '' },
    { player1Id: '', player2Id: '' },
    { player1Id: '', player2Id: '' }
  ]);
  const [error, setError] = useState('');

  const handlePairingChange = (index: number, field: 'player1Id' | 'player2Id', value: string) => {
    const newPairings = [...pairings];
    newPairings[index] = { ...newPairings[index], [field]: value };
    setPairings(newPairings);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (pairings.some(p => !p.player1Id || !p.player2Id)) {
      setError('Please select players for all three matches');
      return;
    }

    const usedTeam1Players = pairings.map(p => p.player1Id);
    const usedTeam2Players = pairings.map(p => p.player2Id);

    if (new Set(usedTeam1Players).size !== 3 || new Set(usedTeam2Players).size !== 3) {
      setError('Each player can only be assigned to one match');
      return;
    }

    onSave(pairings);
  };

  const getAvailableTeam1Players = (currentIndex: number) => {
    const usedPlayers = pairings
      .map((p, index) => index !== currentIndex ? p.player1Id : null)
      .filter(Boolean);
    return team1.players.filter(player => !usedPlayers.includes(player.id));
  };

  const getAvailableTeam2Players = (currentIndex: number) => {
    const usedPlayers = pairings
      .map((p, index) => index !== currentIndex ? p.player2Id : null)
      .filter(Boolean);
    return team2.players.filter(player => !usedPlayers.includes(player.id));
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title="Set Individual Pairings"
      titleIcon={<Swords size={20} />}
      size="lg"
    >
      <Stack gap="md">
        <Text fw={600} ta="center" size="lg">
          {team1.name} vs {team2.name}
        </Text>

        {error && (
          <Alert color="red" variant="light">{error}</Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            {pairings.map((pairing, index) => (
              <Paper key={index} p="md" radius="md" withBorder>
                <Text fw={600} size="sm" mb="sm">Match {index + 1}</Text>
                <Group grow align="flex-end">
                  <Select
                    label={`${team1.name} Player`}
                    placeholder="Select Player"
                    data={getAvailableTeam1Players(index).map(p => ({
                      value: p.id,
                      label: `${p.nickname} (${p.army})`
                    }))}
                    value={pairing.player1Id || null}
                    onChange={(v) => handlePairingChange(index, 'player1Id', v || '')}
                  />
                  <Badge variant="light" color="cyan" size="lg" style={{ alignSelf: 'center', flexGrow: 0 }}>
                    VS
                  </Badge>
                  <Select
                    label={`${team2.name} Player`}
                    placeholder="Select Player"
                    data={getAvailableTeam2Players(index).map(p => ({
                      value: p.id,
                      label: `${p.nickname} (${p.army})`
                    }))}
                    value={pairing.player2Id || null}
                    onChange={(v) => handlePairingChange(index, 'player2Id', v || '')}
                  />
                </Group>
              </Paper>
            ))}

            <Group justify="flex-end" gap="sm">
              <Button variant="default" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" leftSection={<Save size={16} />}>
                Save Pairings
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Modal>
  );
};

export default IndividualPairingsForm;
