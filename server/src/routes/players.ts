import { Router, Request, Response } from 'express';
import { playerService } from '../services/playerService';
import { validate, updatePlayerSchema } from '../validation/schemas';

const router = Router();

// Update player
router.put('/:id', validate(updatePlayerSchema), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = playerService.update(id, req.body);

    if (!result) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error updating player:', error);
    res.status(500).json({ error: 'Failed to update player' });
  }
});

// Delete player
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = playerService.delete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json({ message: 'Player deleted successfully' });
  } catch (error) {
    console.error('Error deleting player:', error);
    res.status(500).json({ error: 'Failed to delete player' });
  }
});

export default router;
