import { Router, Request, Response } from 'express';
import db, { TeamModel, PlayerModel } from '../models/Tournament';

const router = Router();

// Create team
router.post('/', async (req: Request, res: Response) => {
  try {
    const { team, players } = req.body;

    // Validate required fields
    if (!team.tournamentId) {
      return res.status(400).json({ error: 'tournamentId is required' });
    }

    // Find the captain from the players array
    const captainPlayer = players?.find((p: any) => Boolean(p.isCaptain));

    // Wrap team + player creation in a transaction
    const result = db.transaction(() => {
      const createdTeam = TeamModel.create({
        id: team.id,
        tournament_id: team.tournamentId,
        name: team.name,
        captain_id: captainPlayer?.id || null
      });

      const createdPlayers = [];
      if (players && Array.isArray(players)) {
        for (const player of players) {
          const createdPlayer = PlayerModel.create({
            id: player.id,
            team_id: createdTeam.id,
            nickname: player.nickname,
            its_pin: player.itsPin,
            army: player.army,
            is_captain: player.isCaptain ? 1 : 0,
            is_painted: player.isPainted ? 1 : 0
          });

          createdPlayers.push({
            id: createdPlayer.id,
            teamId: createdPlayer.team_id,
            nickname: createdPlayer.nickname,
            itsPin: createdPlayer.its_pin,
            army: createdPlayer.army,
            isCaptain: createdPlayer.is_captain,
            isPainted: createdPlayer.is_painted,
            createdAt: createdPlayer.created_at,
            updatedAt: createdPlayer.updated_at
          });
        }
      }

      return { createdTeam, createdPlayers };
    })();

    res.status(201).json({
      id: result.createdTeam.id,
      tournamentId: result.createdTeam.tournament_id,
      name: result.createdTeam.name,
      captainId: result.createdTeam.captain_id,
      createdAt: result.createdTeam.created_at,
      updatedAt: result.createdTeam.updated_at,
      players: result.createdPlayers
    });
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// Update team
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Handle both flat and nested data structures
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

    // Find the captain from the players array
    const captainPlayer = playersData?.find((p: any) => p.isCaptain);
    const captainId = captainPlayer?.id || teamData.captainId || null;

    // Wrap team update + player delete/recreate in a transaction
    const result = db.transaction(() => {
      const updatedTeam = TeamModel.update(id, {
        name: teamData.name,
        captain_id: captainId
      });

      if (!updatedTeam) return null;

      const updatedPlayers = [];
      if (playersData && Array.isArray(playersData)) {
        // Delete existing players
        const existingPlayers = PlayerModel.findByTeamId(id);
        existingPlayers.forEach(p => PlayerModel.delete(p.id));

        // Create new players with correct captain flag
        for (const player of playersData) {
          const createdPlayer = PlayerModel.create({
            id: player.id,
            team_id: id,
            nickname: player.nickname,
            its_pin: player.itsPin,
            army: player.army,
            is_captain: player.isCaptain ? 1 : 0,
            is_painted: player.isPainted ? 1 : 0
          });

          updatedPlayers.push({
            id: createdPlayer.id,
            teamId: createdPlayer.team_id,
            nickname: createdPlayer.nickname,
            itsPin: createdPlayer.its_pin,
            army: createdPlayer.army,
            isCaptain: createdPlayer.is_captain,
            isPainted: createdPlayer.is_painted,
            createdAt: createdPlayer.created_at,
            updatedAt: createdPlayer.updated_at
          });
        }
      }

      return { updatedTeam, updatedPlayers };
    })();

    if (!result) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json({
      id: result.updatedTeam.id,
      tournamentId: result.updatedTeam.tournament_id,
      name: result.updatedTeam.name,
      captainId: result.updatedTeam.captain_id,
      createdAt: result.updatedTeam.created_at,
      updatedAt: result.updatedTeam.updated_at,
      players: result.updatedPlayers
    });
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ error: 'Failed to update team' });
  }
});

// Delete team
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = TeamModel.delete(id);
    
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