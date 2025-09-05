import express, { Router } from 'express';
import { MatchModel } from '../models/Tournament';

const router: Router = express.Router();

// POST /api/matches/team - Create team match
router.post('/team', async (req, res) => {
  try {
    console.log('Creating team match with data:', req.body);
    
    const teamMatch = req.body;
    
    if (!teamMatch.id || !teamMatch.tournamentId || !teamMatch.team1Id || !teamMatch.team2Id) {
      console.error('Missing required fields:', {
        id: !!teamMatch.id,
        tournamentId: !!teamMatch.tournamentId,
        team1Id: !!teamMatch.team1Id,
        team2Id: !!teamMatch.team2Id
      });
      return res.status(400).json({ error: 'Missing required team match fields' });
    }

    const createdMatch = await MatchModel.createTeamMatch(teamMatch);
    console.log('Successfully created team match:', createdMatch);
    res.status(201).json(createdMatch);
  } catch (error) {
    console.error('Error creating team match:', error);
    res.status(500).json({ error: 'Failed to create team match' });
  }
});

// PUT /api/matches/team/:id - Update team match
router.put('/team/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const match = await MatchModel.updateTeamMatch(id, updates);
    if (!match) {
      return res.status(404).json({ error: 'Team match not found' });
    }

    res.json(match);
  } catch (error) {
    console.error('Error updating team match:', error);
    res.status(500).json({ error: 'Failed to update team match' });
  }
});

// POST /api/matches/individual - Create individual match
router.post('/individual', async (req, res) => {
  try {
    const individualMatch = req.body;
    
    if (!individualMatch.id || !individualMatch.teamMatchId || !individualMatch.player1Id || !individualMatch.player2Id) {
      return res.status(400).json({ error: 'Missing required individual match fields' });
    }

    const createdMatch = await MatchModel.createIndividualMatch(individualMatch);
    res.status(201).json(createdMatch);
  } catch (error) {
    console.error('Error creating individual match:', error);
    res.status(500).json({ error: 'Failed to create individual match' });
  }
});

// PUT /api/matches/individual/:id - Update individual match
router.put('/individual/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const match = await MatchModel.updateIndividualMatch(id, updates);
    if (!match) {
      return res.status(404).json({ error: 'Individual match not found' });
    }

    res.json(match);
  } catch (error) {
    console.error('Error updating individual match:', error);
    res.status(500).json({ error: 'Failed to update individual match' });
  }
});

// POST /api/matches/individual/batch - Create multiple individual matches
router.post('/individual/batch', async (req, res) => {
  try {
    const { teamMatchId, pairings } = req.body;
    
    if (!teamMatchId || !pairings || !Array.isArray(pairings)) {
      return res.status(400).json({ error: 'Team match ID and pairings array are required' });
    }

    const createdMatches = [];
    for (let i = 0; i < pairings.length; i++) {
      const pairing = pairings[i];
      const individualMatch = {
        id: `individual_${teamMatchId}_${i}`,
        teamMatchId,
        player1Id: pairing.player1Id,
        player2Id: pairing.player2Id,
        tournamentPoints1: 0,
        tournamentPoints2: 0,
        objectivePoints1: 0,
        objectivePoints2: 0,
        victoryPointsFor1: 0,
        victoryPointsAgainst1: 0,
        victoryPointsFor2: 0,
        victoryPointsAgainst2: 0,
        paintedBonus1: false,
        paintedBonus2: false,
        isCompleted: false
      };

      const createdMatch = await MatchModel.createIndividualMatch(individualMatch);
      createdMatches.push(createdMatch);
    }

    res.status(201).json(createdMatches);
  } catch (error) {
    console.error('Error creating individual matches:', error);
    res.status(500).json({ error: 'Failed to create individual matches' });
  }
});

export default router;