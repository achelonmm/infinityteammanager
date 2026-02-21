import { Router, Request, Response } from 'express';
import { teamService } from '../services/teamService';
import { validate, createTeamSchema, updateTeamSchema } from '../validation/schemas';

const router = Router();

// Create team
router.post('/', validate(createTeamSchema), async (req: Request, res: Response) => {
  try {
    const { team, players } = req.body;

    if (!team.tournamentId) {
      return res.status(400).json({ error: 'tournamentId is required' });
    }

    const result = teamService.create({ team, players });
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// Update team
router.put('/:id', validate(updateTeamSchema), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    let teamData, playersData;
    if (req.body.team) {
      teamData = req.body.team;
      playersData = req.body.players;
    } else {
      teamData = {
        name: req.body.name,
        captainId: req.body.captainId
      };
      playersData = req.body.players;
    }

    const result = teamService.update(id, { teamData, playersData });

    if (!result) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ error: 'Failed to update team' });
  }
});

// Delete team
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = teamService.delete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

export default router;
