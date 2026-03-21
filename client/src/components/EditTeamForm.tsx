import React, { useState } from 'react';
import { Pencil, Save } from 'lucide-react';
import { TextInput, Select, Button, Group, Stack, Alert } from '@mantine/core';
import { Team } from '../types';
import Modal from './Modal';

interface EditTeamFormProps {
  team: Team;
  onSave: (teamId: string, updates: Partial<Team>) => void;
  onCancel: () => void;
}

const EditTeamForm: React.FC<EditTeamFormProps> = ({ team, onSave, onCancel }) => {
  const [teamName, setTeamName] = useState(team.name);
  const [captainId, setCaptainId] = useState(team.captainId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamName.trim()) {
      setError('Please enter a team name');
      return;
    }

    if (!captainId) {
      setError('Please select a captain');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const updatedPlayers = team.players.map(player => ({
        ...player,
        isCaptain: player.id === captainId
      }));

      await onSave(team.id, {
        name: teamName.trim(),
        captainId: captainId,
        players: updatedPlayers
      });
    } catch (err) {
      console.error('Error updating team:', err);
      setError('Error updating team. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title="Edit Team"
      titleIcon={<Pencil size={20} />}
      size="sm"
    >
      <Stack gap="md">
        {error && (
          <Alert color="red" variant="light">{error}</Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="Team Name"
              placeholder="Enter team name"
              value={teamName}
              onChange={(e) => setTeamName(e.currentTarget.value)}
              disabled={isSubmitting}
              autoFocus
            />

            <Select
              label="Team Captain"
              placeholder="Select Captain"
              data={team.players.map(p => ({
                value: p.id,
                label: `${p.nickname} (${p.army})`
              }))}
              value={captainId}
              onChange={(v) => setCaptainId(v || '')}
              disabled={isSubmitting}
            />

            <Group justify="flex-end" gap="sm">
              <Button variant="default" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={!teamName.trim() || !captainId}
                leftSection={<Save size={16} />}
              >
                Save Changes
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Modal>
  );
};

export default EditTeamForm;
