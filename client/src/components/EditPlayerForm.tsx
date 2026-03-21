import React, { useState } from 'react';
import { Pencil, Crown, Palette, Clock, Save } from 'lucide-react';
import { TextInput, Select, Checkbox, Button, Group, Stack, Text, Alert, SimpleGrid } from '@mantine/core';
import { Player, Team } from '../types';
import { ARMIES } from '../utils/armies';
import Modal from './Modal';

interface EditPlayerFormProps {
  player: Player;
  team: Team;
  allTeams: Team[];
  onSave: (playerId: string, updates: Partial<Player>) => void;
  onCancel: () => void;
}

const EditPlayerForm: React.FC<EditPlayerFormProps> = ({
  player,
  team,
  allTeams,
  onSave,
  onCancel
}) => {
  const [nickname, setNickname] = useState(player.nickname);
  const [itsPin, setItsPin] = useState(player.itsPin);
  const [army, setArmy] = useState(player.army);
  const [isCaptain, setIsCaptain] = useState(player.isCaptain);
  const [isPainted, setIsPainted] = useState(player.isPainted);
  const [armyListLate, setArmyListLate] = useState(player.armyListLate ?? false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const getAvailableArmies = () => {
    const usedArmies = team.players
      .filter(p => p.id !== player.id)
      .map(p => p.army);

    return ARMIES.filter(armyName => !usedArmies.includes(armyName));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nickname.trim()) {
      setError('Please enter a nickname');
      return;
    }

    if (!itsPin.trim()) {
      setError('Please enter an ITS Pin');
      return;
    }

    if (!army) {
      setError('Please select an army');
      return;
    }

    const availableArmies = getAvailableArmies();
    if (!availableArmies.includes(army) && army !== player.army) {
      setError('This army is already being used by another teammate. Please select a different army.');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave(player.id, {
        nickname: nickname.trim(),
        itsPin: itsPin.trim(),
        army,
        isCaptain,
        isPainted,
        armyListLate
      });
    } catch (err) {
      console.error('Error updating player:', err);
      setError('Error updating player. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableArmies = getAvailableArmies();

  const armyOptions = [
    ...availableArmies.map(a => ({ value: a, label: a })),
    ...(army && !availableArmies.includes(army) && army === player.army
      ? [{ value: army, label: `${army} (Current)` }]
      : []),
    ...(army && !availableArmies.includes(army) && army !== player.army
      ? [{ value: army, label: `${army} (Already selected by teammate)` }]
      : []),
  ];

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title="Edit Player"
      titleIcon={<Pencil size={20} />}
      size="md"
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          <strong>Team:</strong> {team.name}
        </Text>

        {error && (
          <Alert color="red" variant="light">{error}</Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <SimpleGrid cols={2}>
              <TextInput
                label="Nickname"
                placeholder="Player nickname"
                value={nickname}
                onChange={(e) => setNickname(e.currentTarget.value)}
                disabled={isSubmitting}
                autoFocus
              />
              <TextInput
                label="ITS Pin"
                placeholder="ITS Pin number"
                value={itsPin}
                onChange={(e) => setItsPin(e.currentTarget.value)}
                disabled={isSubmitting}
              />
            </SimpleGrid>

            <Select
              label="Army/Sectorial"
              description={availableArmies.length < ARMIES.length ? 'Some armies already selected by teammates' : undefined}
              placeholder="Select Army"
              data={armyOptions}
              value={army}
              onChange={(v) => setArmy(v || '')}
              disabled={isSubmitting}
              searchable
              error={army && !availableArmies.includes(army) && army !== player.army ? 'Army conflict with teammate' : undefined}
            />

            <SimpleGrid cols={3}>
              <Checkbox
                label="Team Captain"
                description={<Crown size={14} />}
                checked={isCaptain}
                onChange={(e) => setIsCaptain(e.currentTarget.checked)}
                disabled={isSubmitting}
              />
              <Checkbox
                label="Painted Army"
                description={<Palette size={14} />}
                checked={isPainted}
                onChange={(e) => setIsPainted(e.currentTarget.checked)}
                disabled={isSubmitting}
              />
              <Checkbox
                label="Late List"
                description={<Clock size={14} />}
                checked={armyListLate}
                onChange={(e) => setArmyListLate(e.currentTarget.checked)}
                disabled={isSubmitting}
              />
            </SimpleGrid>

            {army && !availableArmies.includes(army) && army !== player.army && (
              <Alert color="yellow" variant="light" title="Army Conflict">
                This army is already being used by another teammate.
                Please select a different army to avoid conflicts.
              </Alert>
            )}

            <Group justify="flex-end" gap="sm">
              <Button variant="default" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={!nickname.trim() || !itsPin.trim() || !army}
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

export default EditPlayerForm;
