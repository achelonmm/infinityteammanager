import express from 'express';
import { TeamModel, PlayerModel } from '../models/Tournament';

const router = express.Router();

// POST /api/teams - Create new team with players
router.post('/', async (req, res) => {
  try {
    const { team, players } = req.body;
    
    if (!team || !players || !Array.isArray(players)) {
      return res.status(400).json({ error: 'Team data and players array are required' });
    }

    // Create team
    const createdTeam = await TeamModel.create(team);

    // Create players
    const createdPlayers = [];
    for (const player of players) {
      const createdPlayer = await PlayerModel.create({
        ...player,
        teamId: team.id
      });
      createdPlayers.push(createdPlayer);
    }

    // Update team with captain ID
    const captain = createdPlayers.find(p => p.isCaptain);
    if (captain) {
      await TeamModel.update(team.id, { captainId: captain.id });
    }

    const teamWithPlayers = {
      ...createdTeam,
      captainId: captain?.id || null,
      players: createdPlayers
    };

    res.status(201).json(teamWithPlayers);
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// PUT /api/teams/:id - Update team
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const team = await TeamModel.update(id, updates);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const players = await TeamModel.getPlayers(id);
    const teamWithPlayers = {
      ...team,
      players
    };

    res.json(teamWithPlayers);
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ error: 'Failed to update team' });
  }
});

// DELETE /api/teams/:id - Delete team
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await TeamModel.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

export default router;