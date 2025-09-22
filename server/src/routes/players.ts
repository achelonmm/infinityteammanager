import { Router, Request, Response } from 'express';
import { PlayerModel } from '../models/Tournament';

const router = Router();

// Update player
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Convert camelCase to snake_case for database
    const dbUpdates: any = {};
    if (updates.nickname !== undefined) dbUpdates.nickname = updates.nickname;
    if (updates.itsPin !== undefined) dbUpdates.its_pin = updates.itsPin;
    if (updates.army !== undefined) dbUpdates.army = updates.army;
    if (updates.isCaptain !== undefined) dbUpdates.is_captain = updates.isCaptain ? 1 : 0;
    if (updates.isPainted !== undefined) dbUpdates.is_painted = updates.isPainted ? 1 : 0;
    
    const player = PlayerModel.update(id, dbUpdates);
    
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    // Convert back to camelCase for response
    res.json({
      id: player.id,
      teamId: player.team_id,
      nickname: player.nickname,
      itsPin: player.its_pin,
      army: player.army,
      isCaptain: Boolean(player.is_captain),
      isPainted: Boolean(player.is_painted),
      createdAt: player.created_at,
      updatedAt: player.updated_at
    });
  } catch (error) {
    console.error('Error updating player:', error);
    res.status(500).json({ error: 'Failed to update player' });
  }
});

// Delete player
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = PlayerModel.delete(id);
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