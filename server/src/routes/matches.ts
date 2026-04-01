import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { matchService } from '../services/matchService';
import { validate, createTeamMatchSchema, updateTeamMatchSchema, updateIndividualMatchSchema, batchCreateIndividualMatchSchema, batchCreateTeamMatchSchema, playerSubmitResultSchema } from '../validation/schemas';

const router = Router();

// Create team match
router.post('/team', requireAuth, validate(createTeamMatchSchema), async (req: Request, res: Response) => {
  try {
    const result = matchService.createTeamMatch(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating team match:', error);
    res.status(500).json({ error: 'Failed to create team match' });
  }
});

// Update team match
router.put('/team/:id', requireAuth, validate(updateTeamMatchSchema), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = matchService.updateTeamMatch(id, req.body);

    if (!result) {
      return res.status(404).json({ error: 'Team match not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error updating team match:', error);
    res.status(500).json({ error: 'Failed to update team match' });
  }
});

// Create individual match
router.post('/individual', requireAuth, async (req: Request, res: Response) => {
  try {
    const result = matchService.createIndividualMatch(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating individual match:', error);
    res.status(500).json({ error: 'Failed to create individual match' });
  }
});

// Update individual match
router.put('/individual/:id', requireAuth, validate(updateIndividualMatchSchema), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = matchService.updateIndividualMatch(id, req.body);

    if (!result) {
      return res.status(404).json({ error: 'Individual match not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error updating individual match:', error);
    res.status(500).json({ error: 'Failed to update individual match' });
  }
});

// Batch create individual matches for a team match
router.post('/individual/batch', requireAuth, validate(batchCreateIndividualMatchSchema), async (req: Request, res: Response) => {
  try {
    const { teamMatchId, pairings } = req.body;
    const result = matchService.batchCreateIndividualMatches(teamMatchId, pairings);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating individual matches:', error);
    res.status(500).json({ error: 'Failed to create individual matches' });
  }
});

// Batch create team matches
router.post('/team/batch', requireAuth, validate(batchCreateTeamMatchSchema), async (req: Request, res: Response) => {
  try {
    const { matches } = req.body;
    const result = matchService.batchCreateTeamMatches(matches);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error batch creating team matches:', error);
    res.status(500).json({ error: 'Failed to batch create team matches' });
  }
});

// Batch delete team matches by round
router.delete('/team/batch/:tournamentId/:round', requireAuth, async (req: Request, res: Response) => {
  try {
    const { tournamentId, round } = req.params;
    const roundNumber = parseInt(round, 10);

    if (isNaN(roundNumber)) {
      return res.status(400).json({ error: 'Invalid round number' });
    }

    const deletedCount = matchService.batchDeleteTeamMatchesByRound(tournamentId, roundNumber);
    res.json({ deleted: deletedCount });
  } catch (error) {
    console.error('Error batch deleting team matches:', error);
    res.status(500).json({ error: 'Failed to batch delete team matches' });
  }
});

// Delete team match
router.delete('/team/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = matchService.deleteTeamMatch(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Team match not found' });
    }

    res.json({ message: 'Team match deleted successfully' });
  } catch (error) {
    console.error('Error deleting team match:', error);
    res.status(500).json({ error: 'Failed to delete team match' });
  }
});

// Public: Player submits their own match result (PIN-verified)
router.put('/individual/:id/player-result', validate(playerSubmitResultSchema), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { itsPin, ...results } = req.body;
    const result = matchService.submitPlayerResult(id, itsPin, results);

    if (!result) {
      return res.status(404).json({ error: 'Individual match not found' });
    }

    res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'MATCH_ALREADY_COMPLETED') {
        return res.status(409).json({ error: 'Match results have already been submitted' });
      }
      if (error.message === 'INVALID_PIN') {
        return res.status(403).json({ error: 'Invalid ITS PIN. You can only submit results for your own match.' });
      }
    }
    console.error('Error submitting player result:', error);
    res.status(500).json({ error: 'Failed to submit match result' });
  }
});

export default router;
