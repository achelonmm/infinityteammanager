import { Router, Request, Response } from 'express';
import { TeamModel, PlayerModel } from '../models/Tournament';

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
    
    const createdTeam = TeamModel.create({
      id: team.id,
      tournament_id: team.tournamentId,
      name: team.name,
      captain_id: captainPlayer?.id || null
    });

    // Create players if provided
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
        
        // Convert to camelCase for response
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

    // Return team with players in camelCase
    res.status(201).json({
      id: createdTeam.id,
      tournamentId: createdTeam.tournament_id,
      name: createdTeam.name,
      captainId: createdTeam.captain_id,
      createdAt: createdTeam.created_at,
      updatedAt: createdTeam.updated_at,
      players: createdPlayers
    });
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// Update team
router.put('/:id', async (req: Request, res: Response) => {
  console.log('PUT /teams/:id CALLED WITH ID:', req.params.id);
  console.log('REQUEST BODY:', JSON.stringify(req.body, null, 2));
  try {
    const { id } = req.params;
    
    console.log('UPDATE TEAM REQUEST:', JSON.stringify(req.body, null, 2));
    
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
    
    console.log('CAPTAIN ID TO SET:', captainId);
    console.log('CAPTAIN PLAYER:', captainPlayer);
    
    const updatedTeam = TeamModel.update(id, {
      name: teamData.name,
      captain_id: captainId
    });
    
    if (!updatedTeam) {
      return res.status(404).json({ error: 'Team not found' });
    }

    console.log('UPDATED TEAM:', updatedTeam);

    // Update players if provided
    const updatedPlayers = [];
if (playersData && Array.isArray(playersData)) {
  console.log('PLAYERS DATA TO UPDATE:', JSON.stringify(playersData, null, 2));
  
  // Delete existing players
  const existingPlayers = PlayerModel.findByTeamId(id);
  existingPlayers.forEach(p => PlayerModel.delete(p.id));
  
  // Create new players with correct captain flag
  for (const player of playersData) {
    console.log('CREATING PLAYER:', player.nickname, 'isCaptain:', player.isCaptain, 'will save as:', player.isCaptain ? 1 : 0);
    
    const createdPlayer = PlayerModel.create({
      id: player.id,
      team_id: id,
      nickname: player.nickname,
      its_pin: player.itsPin,
      army: player.army,
      is_captain: player.isCaptain ? 1 : 0,
      is_painted: player.isPainted ? 1 : 0
    });
    
    console.log('PLAYER CREATED IN DB:', createdPlayer);
        
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

    const response = {
      id: updatedTeam.id,
      tournamentId: updatedTeam.tournament_id,
      name: updatedTeam.name,
      captainId: updatedTeam.captain_id,
      createdAt: updatedTeam.created_at,
      updatedAt: updatedTeam.updated_at,
      players: updatedPlayers
    };
    
    console.log('RESPONSE:', JSON.stringify(response, null, 2));

    res.json(response);
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