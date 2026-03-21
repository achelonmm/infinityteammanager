import React, { useState, useEffect } from 'react';
import {
  ClipboardList, FileText, Trophy, Zap, Target,
  Gamepad2, Palette, Clock, Flag, Swords, Save
} from 'lucide-react';
import {
  NumberInput, Checkbox, Button, Group, Stack, Text, Paper,
  Alert, SimpleGrid, Badge, List, Box,
} from '@mantine/core';
import { Player, IndividualMatch } from '../types';
import { calculateTeamTournamentPoints } from '../utils/rankingUtils';
import Modal from './Modal';

interface IndividualMatchResultFormProps {
  individualMatch: IndividualMatch;
  player1: Player;
  player2: Player;
  onSave: (matchId: string, results: Partial<IndividualMatch>) => void;
  onCancel: () => void;
}

const IndividualMatchResultForm: React.FC<IndividualMatchResultFormProps> = ({
  individualMatch,
  player1,
  player2,
  onSave,
  onCancel
}) => {
  const [results, setResults] = useState({
    objectivePoints1: individualMatch.objectivePoints1 || 0,
    objectivePoints2: individualMatch.objectivePoints2 || 0,
    victoryPointsFor1: individualMatch.victoryPointsFor1 || 0,
    victoryPointsFor2: individualMatch.victoryPointsFor2 || 0,
    paintedBonus1: individualMatch.paintedBonus1 || player1.isPainted,
    paintedBonus2: individualMatch.paintedBonus2 || player2.isPainted,
    lateListPenalty1: individualMatch.lateListPenalty1 || player1.armyListLate,
    lateListPenalty2: individualMatch.lateListPenalty2 || player2.armyListLate,
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const calculatedPoints = {
    points1: calculateTeamTournamentPoints(
      results.objectivePoints1, results.objectivePoints2,
      results.paintedBonus1, results.paintedBonus2,
      results.lateListPenalty1, results.lateListPenalty2, true
    ),
    points2: calculateTeamTournamentPoints(
      results.objectivePoints1, results.objectivePoints2,
      results.paintedBonus1, results.paintedBonus2,
      results.lateListPenalty1, results.lateListPenalty2, false
    ),
  };

  useEffect(() => {
    setResults(prev => ({
      ...prev,
      paintedBonus1: individualMatch.paintedBonus1 || player1.isPainted,
      paintedBonus2: individualMatch.paintedBonus2 || player2.isPainted,
      lateListPenalty1: individualMatch.lateListPenalty1 || player1.armyListLate,
      lateListPenalty2: individualMatch.lateListPenalty2 || player2.armyListLate,
    }));
  }, [
    player1.isPainted, player2.isPainted,
    player1.armyListLate, player2.armyListLate,
    individualMatch.paintedBonus1, individualMatch.paintedBonus2,
    individualMatch.lateListPenalty1, individualMatch.lateListPenalty2,
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (results.objectivePoints1 < 0 || results.objectivePoints1 > 10) {
      errors.push(`${player1.nickname}'s Objective Points must be between 0 and 10`);
    }
    if (results.objectivePoints2 < 0 || results.objectivePoints2 > 10) {
      errors.push(`${player2.nickname}'s Objective Points must be between 0 and 10`);
    }

    if (results.victoryPointsFor1 < 0 || results.victoryPointsFor1 > 300) {
      errors.push(`${player1.nickname}'s Victory Points must be between 0 and 300`);
    }
    if (results.victoryPointsFor2 < 0 || results.victoryPointsFor2 > 300) {
      errors.push(`${player2.nickname}'s Victory Points must be between 0 and 300`);
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const finalResults = {
        ...results,
        tournamentPoints1: calculatedPoints.points1,
        tournamentPoints2: calculatedPoints.points2,
        isCompleted: true
      };
      onSave(individualMatch.id, finalResults);
    } catch (error) {
      console.error('Error saving results:', error);
      setValidationErrors(['Error saving results. Please try again.']);
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: number | boolean) => {
    setResults(prev => ({
      ...prev,
      [field]: value
    }));
    setValidationErrors([]);
  };

  const getMatchOutcome = () => {
    const obj1 = results.objectivePoints1;
    const obj2 = results.objectivePoints2;

    if (obj1 > obj2) return `${player1.nickname} Victory (${obj1} vs ${obj2})`;
    if (obj2 > obj1) return `${player2.nickname} Victory (${obj2} vs ${obj1})`;
    if (obj1 === obj2 && obj1 > 0) return `Tie (${obj1} vs ${obj2})`;
    return 'Enter objective points to see result';
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title="Match Results"
      titleIcon={<ClipboardList size={20} />}
      size="xl"
    >
      <Stack gap="md">
        {validationErrors.length > 0 && (
          <Alert color="red" variant="light" title="Please fix the following errors:">
            <List size="sm">
              {validationErrors.map((err, index) => (
                <List.Item key={index}>{err}</List.Item>
              ))}
            </List>
          </Alert>
        )}

        {/* Scoring Guide */}
        <Paper p="sm" radius="md" withBorder>
          <Group gap="xs" mb="xs">
            <FileText size={18} />
            <Text fw={600} size="sm">Infinity Tournament Scoring</Text>
          </Group>
          <SimpleGrid cols={3} spacing="xs">
            <Box>
              <Group gap={4} mb={4}><Trophy size={14} /><Text fw={600} size="xs">Base Points:</Text></Group>
              <Text size="xs" c="dimmed">Victory: 4 pts | Tie: 2 pts | Defeat: 0 pts</Text>
            </Box>
            <Box>
              <Group gap={4} mb={4}><Zap size={14} /><Text fw={600} size="xs">Bonus/Penalty:</Text></Group>
              <Text size="xs" c="dimmed">Offensive: +1 | Defensive: +1 | Painted: +1 | Late: -1</Text>
            </Box>
            <Box>
              <Group gap={4} mb={4}><Target size={14} /><Text fw={600} size="xs">Tiebreakers:</Text></Group>
              <Text size="xs" c="dimmed">1st: Obj Pts | 2nd: VP Diff | 3rd: VP For</Text>
            </Box>
          </SimpleGrid>
        </Paper>

        {/* Player Cards */}
        <SimpleGrid cols={2}>
          <Paper p="md" radius="md" withBorder style={{ borderColor: 'var(--mantine-color-cyan-8)' }}>
            <Group gap="xs" mb="xs">
              <Gamepad2 size={18} />
              <Text fw={700}>{player1.nickname}</Text>
            </Group>
            <Group gap="xs" mb="xs">
              <Text size="sm" c="dimmed">{player1.army}</Text>
              {player1.isPainted && <Badge size="xs" color="teal" variant="light">Painted</Badge>}
            </Group>
            <Badge size="lg" color="cyan" variant="filled">
              {calculatedPoints.points1} Tournament Points
            </Badge>
          </Paper>

          <Paper p="md" radius="md" withBorder style={{ borderColor: 'var(--mantine-color-red-8)' }}>
            <Group gap="xs" mb="xs">
              <Gamepad2 size={18} />
              <Text fw={700}>{player2.nickname}</Text>
            </Group>
            <Group gap="xs" mb="xs">
              <Text size="sm" c="dimmed">{player2.army}</Text>
              {player2.isPainted && <Badge size="xs" color="teal" variant="light">Painted</Badge>}
            </Group>
            <Badge size="lg" color="cyan" variant="filled">
              {calculatedPoints.points2} Tournament Points
            </Badge>
          </Paper>
        </SimpleGrid>

        {/* Match Outcome */}
        <Paper p="sm" radius="md" bg="dark.7" ta="center">
          <Group gap="xs" justify="center">
            <Flag size={18} />
            <Text fw={600}>{getMatchOutcome()}</Text>
          </Group>
        </Paper>

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            {/* Objective Points */}
            <Box>
              <Group gap="xs" mb="xs">
                <Target size={18} />
                <Text fw={600} size="sm">Objective Points (determines winner) - Range: 0-10</Text>
              </Group>
              <SimpleGrid cols={2}>
                <NumberInput
                  label={player1.nickname}
                  min={0}
                  max={10}
                  value={results.objectivePoints1}
                  onChange={(v) => handleChange('objectivePoints1', typeof v === 'number' ? v : 0)}
                  disabled={isSubmitting}
                  description="Must be between 0 and 10"
                  autoFocus
                />
                <NumberInput
                  label={player2.nickname}
                  min={0}
                  max={10}
                  value={results.objectivePoints2}
                  onChange={(v) => handleChange('objectivePoints2', typeof v === 'number' ? v : 0)}
                  disabled={isSubmitting}
                  description="Must be between 0 and 10"
                />
              </SimpleGrid>
            </Box>

            {/* Victory Points */}
            <Box>
              <Group gap="xs" mb="xs">
                <Swords size={18} />
                <Text fw={600} size="sm">Victory Points For (tiebreaker) - Range: 0-300</Text>
              </Group>
              <SimpleGrid cols={2}>
                <NumberInput
                  label={player1.nickname}
                  min={0}
                  max={300}
                  value={results.victoryPointsFor1}
                  onChange={(v) => handleChange('victoryPointsFor1', typeof v === 'number' ? v : 0)}
                  disabled={isSubmitting}
                  description="Must be between 0 and 300"
                />
                <NumberInput
                  label={player2.nickname}
                  min={0}
                  max={300}
                  value={results.victoryPointsFor2}
                  onChange={(v) => handleChange('victoryPointsFor2', typeof v === 'number' ? v : 0)}
                  disabled={isSubmitting}
                  description="Must be between 0 and 300"
                />
              </SimpleGrid>
            </Box>

            {/* Painted Army Bonus */}
            <Box>
              <Group gap="xs" mb="xs">
                <Palette size={18} />
                <Text fw={600} size="sm">Painted Army Bonus (+1 Tournament Point)</Text>
              </Group>
              <SimpleGrid cols={2}>
                <Checkbox
                  label={player1.nickname}
                  description={player1.isPainted ? 'Army marked as painted in profile' : undefined}
                  checked={results.paintedBonus1}
                  onChange={(e) => handleChange('paintedBonus1', e.currentTarget.checked)}
                  disabled={isSubmitting}
                />
                <Checkbox
                  label={player2.nickname}
                  description={player2.isPainted ? 'Army marked as painted in profile' : undefined}
                  checked={results.paintedBonus2}
                  onChange={(e) => handleChange('paintedBonus2', e.currentTarget.checked)}
                  disabled={isSubmitting}
                />
              </SimpleGrid>
            </Box>

            {/* Late Army List Penalty */}
            <Box>
              <Group gap="xs" mb="xs">
                <Clock size={18} />
                <Text fw={600} size="sm">Late Army List Penalty (-1 Tournament Point)</Text>
              </Group>
              <SimpleGrid cols={2}>
                <Checkbox
                  label={player1.nickname}
                  description={player1.armyListLate ? 'Army list marked as late in profile' : undefined}
                  checked={results.lateListPenalty1}
                  onChange={(e) => handleChange('lateListPenalty1', e.currentTarget.checked)}
                  disabled={isSubmitting}
                  color="red"
                />
                <Checkbox
                  label={player2.nickname}
                  description={player2.armyListLate ? 'Army list marked as late in profile' : undefined}
                  checked={results.lateListPenalty2}
                  onChange={(e) => handleChange('lateListPenalty2', e.currentTarget.checked)}
                  disabled={isSubmitting}
                  color="red"
                />
              </SimpleGrid>
            </Box>

            <Group justify="flex-end" gap="sm">
              <Button variant="default" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting} leftSection={<Save size={16} />}>
                Save Results
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Modal>
  );
};

export default IndividualMatchResultForm;
