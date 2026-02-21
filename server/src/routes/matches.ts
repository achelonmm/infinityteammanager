import { Router, Request, Response } from 'express';
import db, { TeamMatchModel, IndividualMatchModel } from '../models/Tournament';

const router = Router();

// Create team match
router.post('/team', async (req: Request, res: Response) => {
  try {
    const teamMatch = req.body;
    
    // Convert camelCase to snake_case for database
    const createdMatch = TeamMatchModel.create({
      id: teamMatch.id,
      tournament_id: teamMatch.tournamentId,
      round: teamMatch.round,
      team1_id: teamMatch.team1Id,
      team2_id: teamMatch.team2Id,
      table_number: teamMatch.tableNumber,
      is_completed: teamMatch.isCompleted ? 1 : 0
    });
    
    // Convert back to camelCase for response
    res.status(201).json({
      id: createdMatch.id,
      tournamentId: createdMatch.tournament_id,
      round: createdMatch.round,
      team1Id: createdMatch.team1_id,
      team2Id: createdMatch.team2_id,
      tableNumber: createdMatch.table_number,
      isCompleted: Boolean(createdMatch.is_completed),
      createdAt: createdMatch.created_at,
      updatedAt: createdMatch.updated_at
    });
  } catch (error) {
    console.error('Error creating team match:', error);
    res.status(500).json({ error: 'Failed to create team match' });
  }
});

// Update team match
router.put('/team/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Convert camelCase to snake_case for database
    const dbUpdates: any = {};
    if (updates.isCompleted !== undefined) dbUpdates.is_completed = updates.isCompleted ? 1 : 0;
    if (updates.tableNumber !== undefined) dbUpdates.table_number = updates.tableNumber;
    
    const teamMatch = TeamMatchModel.update(id, dbUpdates);
    
    if (!teamMatch) {
      return res.status(404).json({ error: 'Team match not found' });
    }
    
    // Convert back to camelCase for response
    res.json({
      id: teamMatch.id,
      tournamentId: teamMatch.tournament_id,
      round: teamMatch.round,
      team1Id: teamMatch.team1_id,
      team2Id: teamMatch.team2_id,
      tableNumber: teamMatch.table_number,
      isCompleted: Boolean(teamMatch.is_completed),
      createdAt: teamMatch.created_at,
      updatedAt: teamMatch.updated_at
    });
  } catch (error) {
    console.error('Error updating team match:', error);
    res.status(500).json({ error: 'Failed to update team match' });
  }
});

// Create individual match
router.post('/individual', async (req: Request, res: Response) => {
  try {
    const individualMatch = req.body;
    const createdMatch = IndividualMatchModel.create(individualMatch);
    res.status(201).json(createdMatch);
  } catch (error) {
    console.error('Error creating individual match:', error);
    res.status(500).json({ error: 'Failed to create individual match' });
  }
});

// Update individual match
router.put('/individual/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Convert camelCase to snake_case for database
    const dbUpdates: any = {};
    if (updates.tournamentPoints1 !== undefined) dbUpdates.tournament_points1 = updates.tournamentPoints1;
    if (updates.tournamentPoints2 !== undefined) dbUpdates.tournament_points2 = updates.tournamentPoints2;
    if (updates.objectivePoints1 !== undefined) dbUpdates.objective_points1 = updates.objectivePoints1;
    if (updates.objectivePoints2 !== undefined) dbUpdates.objective_points2 = updates.objectivePoints2;
    if (updates.victoryPointsFor1 !== undefined) dbUpdates.victory_points_for1 = updates.victoryPointsFor1;
    if (updates.victoryPointsAgainst1 !== undefined) dbUpdates.victory_points_against1 = updates.victoryPointsAgainst1;
    if (updates.victoryPointsFor2 !== undefined) dbUpdates.victory_points_for2 = updates.victoryPointsFor2;
    if (updates.victoryPointsAgainst2 !== undefined) dbUpdates.victory_points_against2 = updates.victoryPointsAgainst2;
    if (updates.paintedBonus1 !== undefined) dbUpdates.painted_bonus1 = updates.paintedBonus1 ? 1 : 0;
    if (updates.paintedBonus2 !== undefined) dbUpdates.painted_bonus2 = updates.paintedBonus2 ? 1 : 0;
    if (updates.isCompleted !== undefined) dbUpdates.is_completed = updates.isCompleted ? 1 : 0;
    
    const match = IndividualMatchModel.update(id, dbUpdates);
    
    if (!match) {
      return res.status(404).json({ error: 'Individual match not found' });
    }
    
    // Convert back to camelCase for response
    res.json({
      id: match.id,
      teamMatchId: match.team_match_id,
      player1Id: match.player1_id,
      player2Id: match.player2_id,
      tournamentPoints1: match.tournament_points1,
      tournamentPoints2: match.tournament_points2,
      objectivePoints1: match.objective_points1,
      objectivePoints2: match.objective_points2,
      victoryPointsFor1: match.victory_points_for1,
      victoryPointsAgainst1: match.victory_points_against1,
      victoryPointsFor2: match.victory_points_for2,
      victoryPointsAgainst2: match.victory_points_against2,
      paintedBonus1: Boolean(match.painted_bonus1),
      paintedBonus2: Boolean(match.painted_bonus2),
      isCompleted: Boolean(match.is_completed),
      createdAt: match.created_at,
      updatedAt: match.updated_at
    });
  } catch (error) {
    console.error('Error updating individual match:', error);
    res.status(500).json({ error: 'Failed to update individual match' });
  }
});

// Batch create individual matches for a team match
router.post('/individual/batch', async (req: Request, res: Response) => {
  try {
    const { teamMatchId, pairings } = req.body;

    if (!Array.isArray(pairings)) {
      return res.status(400).json({ error: 'pairings must be an array' });
    }

    // Wrap batch creation in a transaction
    const createdMatches = db.transaction(() => {
      return pairings.map((pairing: any) => {
        const individualMatch = IndividualMatchModel.create({
          id: pairing.id || crypto.randomUUID(),
          team_match_id: teamMatchId,
          player1_id: pairing.player1Id,
          player2_id: pairing.player2Id,
          tournament_points1: 0,
          tournament_points2: 0,
          objective_points1: 0,
          objective_points2: 0,
          victory_points_for1: 0,
          victory_points_against1: 0,
          victory_points_for2: 0,
          victory_points_against2: 0,
          painted_bonus1: 0,
          painted_bonus2: 0,
          is_completed: 0
        });

        return {
          id: individualMatch.id,
          teamMatchId: individualMatch.team_match_id,
          player1Id: individualMatch.player1_id,
          player2Id: individualMatch.player2_id,
          tournamentPoints1: individualMatch.tournament_points1,
          tournamentPoints2: individualMatch.tournament_points2,
          objectivePoints1: individualMatch.objective_points1,
          objectivePoints2: individualMatch.objective_points2,
          victoryPointsFor1: individualMatch.victory_points_for1,
          victoryPointsAgainst1: individualMatch.victory_points_against1,
          victoryPointsFor2: individualMatch.victory_points_for2,
          victoryPointsAgainst2: individualMatch.victory_points_against2,
          paintedBonus1: Boolean(individualMatch.painted_bonus1),
          paintedBonus2: Boolean(individualMatch.painted_bonus2),
          isCompleted: Boolean(individualMatch.is_completed),
          createdAt: individualMatch.created_at,
          updatedAt: individualMatch.updated_at
        };
      });
    })();

    res.status(201).json(createdMatches);
  } catch (error) {
    console.error('Error creating individual matches:', error);
    res.status(500).json({ error: 'Failed to create individual matches' });
  }
});

// Delete team match
router.delete('/team/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = TeamMatchModel.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Team match not found' });
    }

    res.json({ message: 'Team match deleted successfully' });
  } catch (error) {
    console.error('Error deleting team match:', error);
    res.status(500).json({ error: 'Failed to delete team match' });
  }
});

export default router;