import React, { useState } from 'react';
import { Pencil, Save } from 'lucide-react';
import { Select, Button, Group, Stack, Text, Paper, Badge, Alert } from '@mantine/core';
import { Team, TeamMatch } from '../types';
import Modal from './Modal';

interface PairingEditorProps {
  teams: Team[];
  currentPairings: TeamMatch[];
  onSave: (pairings: { team1Id: string; team2Id: string }[]) => void;
  onCancel: () => void;
}

const PairingEditor: React.FC<PairingEditorProps> = ({
  teams,
  currentPairings,
  onSave,
  onCancel
}) => {
  const [editablePairings, setEditablePairings] = useState(
    currentPairings.map(pairing => ({
      id: pairing.id,
      team1Id: pairing.team1Id,
      team2Id: pairing.team2Id
    }))
  );
  const [error, setError] = useState('');

  const handlePairingChange = (index: number, field: 'team1Id' | 'team2Id', value: string) => {
    const newPairings = [...editablePairings];
    newPairings[index] = { ...newPairings[index], [field]: value };
    setEditablePairings(newPairings);
    setError('');
  };

  const getAvailableTeams = (currentIndex: number, currentField: 'team1Id' | 'team2Id') => {
    const usedTeams = editablePairings
      .flatMap((pairing, index) => {
        if (index === currentIndex) {
          const otherField = currentField === 'team1Id' ? 'team2Id' : 'team1Id';
          return pairing[otherField] ? [pairing[otherField]] : [];
        }
        return [pairing.team1Id, pairing.team2Id];
      })
      .filter(Boolean);

    return teams.filter(team => !usedTeams.includes(team.id));
  };

  const isValidPairing = () => {
    if (editablePairings.some(p => !p.team1Id || !p.team2Id)) {
      return false;
    }

    const allTeamIds = editablePairings.flatMap(p => [p.team1Id, p.team2Id]);
    const uniqueTeamIds = new Set(allTeamIds);

    return allTeamIds.length === uniqueTeamIds.size;
  };

  const handleSave = () => {
    if (!isValidPairing()) {
      setError('Please ensure all pairings are complete and no team appears twice.');
      return;
    }

    onSave(editablePairings.map(p => ({ team1Id: p.team1Id, team2Id: p.team2Id })));
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title="Edit Pairings"
      titleIcon={<Pencil size={20} />}
      size="lg"
    >
      <Stack gap="md">
        {editablePairings.map((pairing, index) => (
          <Paper key={pairing.id} p="md" radius="md" withBorder>
            <Text fw={600} size="sm" mb="sm">Match {index + 1}</Text>
            <Group grow align="flex-end">
              <Select
                label="Team 1"
                placeholder="Select Team"
                data={[
                  ...getAvailableTeams(index, 'team1Id').map(t => ({ value: t.id, label: t.name })),
                  ...(pairing.team1Id && !getAvailableTeams(index, 'team1Id').some(t => t.id === pairing.team1Id)
                    ? [{ value: pairing.team1Id, label: `${teams.find(t => t.id === pairing.team1Id)?.name} (Conflict)` }]
                    : []),
                ]}
                value={pairing.team1Id || null}
                onChange={(v) => handlePairingChange(index, 'team1Id', v || '')}
              />
              <Badge variant="light" color="cyan" size="lg" style={{ alignSelf: 'center', flexGrow: 0 }}>
                VS
              </Badge>
              <Select
                label="Team 2"
                placeholder="Select Team"
                data={[
                  ...getAvailableTeams(index, 'team2Id').map(t => ({ value: t.id, label: t.name })),
                  ...(pairing.team2Id && !getAvailableTeams(index, 'team2Id').some(t => t.id === pairing.team2Id)
                    ? [{ value: pairing.team2Id, label: `${teams.find(t => t.id === pairing.team2Id)?.name} (Conflict)` }]
                    : []),
                ]}
                value={pairing.team2Id || null}
                onChange={(v) => handlePairingChange(index, 'team2Id', v || '')}
              />
            </Group>
          </Paper>
        ))}

        {(!isValidPairing() || error) && (
          <Alert color="yellow" variant="light">
            {error || 'Please ensure all pairings are complete and no team appears in multiple matches.'}
          </Alert>
        )}

        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValidPairing()} leftSection={<Save size={16} />}>
            Save Pairings
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default PairingEditor;
