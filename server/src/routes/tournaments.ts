import { Router, Request, Response } from 'express';
import { TournamentModel, TeamModel, PlayerModel, TeamMatchModel, IndividualMatchModel } from '../models/Tournament';

const router = Router();

// Get all tournaments
router.get('/', async (req: Request, res: Response) => {
  try {
    const tournaments = TournamentModel.findAll();
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
    const tournament = TournamentModel.findById(id);
    
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    const teams = TeamModel.findByTournamentId(id);
    const teamMatches = TeamMatchModel.findByTournamentId(id);
    
    // Get all players for this tournament
    const allPlayers = teams.flatMap(team => PlayerModel.findByTeamId(team.id));

    // Convert snake_case to camelCase for frontend
    const camelCasePlayers = allPlayers.map(player => ({
      id: player.id,
      teamId: player.team_id,
      nickname: player.nickname,
      itsPin: player.its_pin,
      army: player.army,
      isCaptain: Boolean(player.is_captain),  // Changed: camelCase + boolean
      isPainted: Boolean(player.is_painted),  // Changed: camelCase + boolean
      createdAt: player.created_at,
      updatedAt: player.updated_at
    }));

    // Build teams with their players
    const teamsWithPlayers = teams.map(team => ({
      id: team.id,
      tournamentId: team.tournament_id,
      name: team.name,
      captainId: team.captain_id,
      createdAt: team.created_at,
      updatedAt: team.updated_at,
      players: camelCasePlayers.filter(player => player.teamId === team.id)
    }));

    // Get all individual matches
    const allIndividualMatches = teamMatches.flatMap(tm => IndividualMatchModel.findByTeamMatchId(tm.id));

    const teamMatchesWithIndividual = teamMatches.map(teamMatch => {
      const individualMatches = allIndividualMatches
        .filter((indMatch: any) => indMatch.team_match_id === teamMatch.id)
        .map((indMatch: any) => ({
          id: indMatch.id,
          teamMatchId: indMatch.team_match_id,
          player1Id: indMatch.player1_id,
          player2Id: indMatch.player2_id,
          tournamentPoints1: indMatch.tournament_points1,
          tournamentPoints2: indMatch.tournament_points2,
          objectivePoints1: indMatch.objective_points1,
          objectivePoints2: indMatch.objective_points2,
          victoryPointsFor1: indMatch.victory_points_for1,
          victoryPointsAgainst1: indMatch.victory_points_against1,
          victoryPointsFor2: indMatch.victory_points_for2,
          victoryPointsAgainst2: indMatch.victory_points_against2,
          paintedBonus1: Boolean(indMatch.painted_bonus1),
          paintedBonus2: Boolean(indMatch.painted_bonus2),
          isCompleted: Boolean(indMatch.is_completed),
          createdAt: indMatch.created_at,
          updatedAt: indMatch.updated_at
        }));

      return {
        id: teamMatch.id,
        tournamentId: teamMatch.tournament_id,
        round: teamMatch.round,
        team1Id: teamMatch.team1_id,
        team2Id: teamMatch.team2_id,
        tableNumber: teamMatch.table_number,
        isCompleted: Boolean(teamMatch.is_completed),
        createdAt: teamMatch.created_at,
        updatedAt: teamMatch.updated_at,
        individualMatches
      };
    });

    res.json({
      id: tournament.id,
      name: tournament.name,
      currentRound: tournament.current_round,
      createdAt: tournament.created_at,
      updatedAt: tournament.updated_at,
      teams: teamsWithPlayers,
      teamMatches: teamMatchesWithIndividual
    });
  } catch (error) {
    console.error('Error fetching tournament:', error);
    res.status(500).json({ error: 'Failed to fetch tournament' });
  }
});

// Create a new tournament
router.post('/', async (req: Request, res: Response) => {
  try {
    const { id, name } = req.body;
    
    // Check if tournament already exists
    const existing = TournamentModel.findById(id);
    if (existing) {
      return res.status(200).json(existing); // Return existing tournament instead of error
    }
    
    const tournament = TournamentModel.create({
      id,
      name,
      current_round: 1
    });

    res.status(201).json(tournament);
  } catch (error) {
    console.error('Error creating tournament:', error);
    res.status(500).json({ error: 'Failed to create tournament' });
  }
});

// Update tournament
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Convert camelCase to snake_case for database
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.currentRound !== undefined) dbUpdates.current_round = updates.currentRound;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    
    const tournament = TournamentModel.update(id, dbUpdates);
    
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    
    // Convert back to camelCase for response
    res.json({
      id: tournament.id,
      name: tournament.name,
      currentRound: tournament.current_round,
      createdAt: tournament.created_at,
      updatedAt: tournament.updated_at
    });
  } catch (error) {
    console.error('Error updating tournament:', error);
    res.status(500).json({ error: 'Failed to update tournament' });
  }
});

// Delete tournament
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = TournamentModel.delete(id);
    
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