import { Router, Request, Response } from 'express';
import { tournamentService } from '../services/tournamentService';
import { requireAuth } from '../middleware/auth';
import { validate, createTournamentSchema, updateTournamentSchema } from '../validation/schemas';

const router = Router();

// Get all tournaments (with team/match counts)
router.get('/', (req: Request, res: Response) => {
  try {
    const tournaments = tournamentService.findAll();
    res.json(tournaments);
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

// Get the currently active tournament
router.get('/active', (req: Request, res: Response) => {
  try {
    const tournament = tournamentService.findActive();
    if (!tournament) {
      return res.status(404).json({ error: 'No active tournament found' });
    }
    res.json(tournament);
  } catch (error) {
    console.error('Error fetching active tournament:', error);
    res.status(500).json({ error: 'Failed to fetch active tournament' });
  }
});

// Get a specific tournament with all related data
router.get('/:id', (req: Request, res: Response) => {
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
router.post('/', requireAuth, validate(createTournamentSchema), (req: Request, res: Response) => {
  try {
    const { id, name } = req.body;
    const { tournament, created, conflict } = tournamentService.create({ id, name });

    if (conflict) {
      return res.status(409).json({ error: 'A tournament with this name or ID already exists' });
    }

    res.status(created ? 201 : 200).json(tournament);
  } catch (error) {
    console.error('Error creating tournament:', error);
    res.status(500).json({ error: 'Failed to create tournament' });
  }
});

// Update tournament
router.put('/:id', requireAuth, validate(updateTournamentSchema), (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tournament, conflict } = tournamentService.update(id, req.body);

    if (conflict) {
      return res.status(409).json({ error: 'A tournament with this name already exists' });
    }

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    res.json(tournament);
  } catch (error) {
    console.error('Error updating tournament:', error);
    res.status(500).json({ error: 'Failed to update tournament' });
  }
});

// Activate a tournament (deactivates all others)
router.post('/:id/activate', requireAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tournament = tournamentService.activate(id);

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    res.json(tournament);
  } catch (error) {
    console.error('Error activating tournament:', error);
    res.status(500).json({ error: 'Failed to activate tournament' });
  }
});

// Mark a tournament as completed
router.post('/:id/complete', requireAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tournament = tournamentService.complete(id);

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    res.json(tournament);
  } catch (error) {
    console.error('Error completing tournament:', error);
    res.status(500).json({ error: 'Failed to complete tournament' });
  }
});

// Delete tournament
router.delete('/:id', requireAuth, (req: Request, res: Response) => {
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
