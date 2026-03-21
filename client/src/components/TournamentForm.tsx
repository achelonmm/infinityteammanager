import React, { useState } from 'react';
import { Trophy, Save } from 'lucide-react';
import { TextInput, Button, Group, Stack, Alert } from '@mantine/core';
import { TournamentSummary } from '../types';
import Modal from './Modal';

interface TournamentFormProps {
  tournament?: TournamentSummary;
  onSave: (name: string) => Promise<void>;
  onCancel: () => void;
}

const TournamentForm: React.FC<TournamentFormProps> = ({ tournament, onSave, onCancel }) => {
  const [name, setName] = useState(tournament?.name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!tournament;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please enter a tournament name');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSave(name.trim());
    } catch (err) {
      if (err instanceof Error && err.message.includes('already exists')) {
        setError('A tournament with this name already exists');
      } else {
        setError(isEditing ? 'Error updating tournament. Please try again.' : 'Error creating tournament. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title={isEditing ? 'Edit Tournament' : 'New Tournament'}
      titleIcon={<Trophy size={20} />}
      size="sm"
    >
      <Stack gap="md">
        {error && (
          <Alert color="red" variant="light">{error}</Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="Tournament Name"
              placeholder="Enter tournament name..."
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              disabled={isSubmitting}
              autoFocus
              maxLength={200}
            />

            <Group justify="flex-end" gap="sm">
              <Button variant="default" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={!name.trim()}
                leftSection={<Save size={16} />}
              >
                {isEditing ? 'Save Changes' : 'Create Tournament'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Modal>
  );
};

export default TournamentForm;
