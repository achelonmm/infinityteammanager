import { Router, Request, Response } from 'express';
import { tournamentService } from '../services/tournamentService';
import { requireAuth } from '../middleware/auth';
import { validate, createTournamentSchema, updateTournamentSchema } from '../validation/schemas';

const router = Router();

// Get all tournaments
router.get('/', async (req: Request, res: Response) => {
  try {
    const tournaments = tournamentService.findAll();
    res.json(tournaments);
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

// Get a specific tournament with all related data
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = tournamentService.getFullTournament(id);

    if (!result) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching tournament:', error);
    res.status(500).json({ error: 'Failed to fetch tournament' });
  }
});

// Create a new tournament
router.post('/', requireAuth, validate(createTournamentSchema), async (req: Request, res: Response) => {
  try {
    const { id, name } = req.body;
    const { tournament, created } = tournamentService.create({ id, name });
    res.status(created ? 201 : 200).json(tournament);
  } catch (error) {
    console.error('Error creating tournament:', error);
    res.status(500).json({ error: 'Failed to create tournament' });
  }
});

// Update tournament
router.put('/:id', requireAuth, validate(updateTournamentSchema), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = tournamentService.update(id, req.body);

    if (!result) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error updating tournament:', error);
    res.status(500).json({ error: 'Failed to update tournament' });
  }
});

// Delete tournament
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = tournamentService.delete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting tournament:', error);
    res.status(500).json({ error: 'Failed to delete tournament' });
  }
});

export default router;
