import express from 'express';
import { TournamentModel, TeamModel, PlayerModel, MatchModel } from '../models/Tournament';

const router = express.Router();

// GET /api/tournaments - Get all tournaments
router.get('/', async (req, res) => {
  try {
    const tournaments = await TournamentModel.getAll();
    res.json(tournaments);
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

// GET /api/tournaments/:id - Get tournament by ID with all related data
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const tournament = await TournamentModel.getById(id);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    const teams = await TournamentModel.getTeams(id);
    const players = await TournamentModel.getPlayers(id);
    const teamMatches = await TournamentModel.getTeamMatches(id);
    const individualMatches = await TournamentModel.getIndividualMatches(id);

    // Group players by team
    const teamsWithPlayers = teams.map(team => ({
      ...team,
      players: players.filter(player => player.teamId === team.id)
    }));

    // Group individual matches by team match
    const teamMatchesWithIndividual = teamMatches.map(teamMatch => ({
      ...teamMatch,
      individualMatches: individualMatches.filter(indMatch => indMatch.teamMatchId === teamMatch.id)
    }));

    const fullTournament = {
      ...tournament,
      teams: teamsWithPlayers,
      teamMatches: teamMatchesWithIndividual
    };

    res.json(fullTournament);
  } catch (error) {
    console.error('Error fetching tournament:', error);
    res.status(500).json({ error: 'Failed to fetch tournament' });
  }
});

// POST /api/tournaments - Create new tournament
router.post('/', async (req, res) => {
  try {
    const { id, name, currentRound = 1 } = req.body;
    
    if (!id || !name) {
      return res.status(400).json({ error: 'Tournament ID and name are required' });
    }

    const tournament = await TournamentModel.create({
      id,
      name,
      currentRound
    });

    res.status(201).json(tournament);
  } catch (error) {
    console.error('Error creating tournament:', error);
    res.status(500).json({ error: 'Failed to create tournament' });
  }
});

// PUT /api/tournaments/:id - Update tournament
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const tournament = await TournamentModel.update(id, updates);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    res.json(tournament);
  } catch (error) {
    console.error('Error updating tournament:', error);
    res.status(500).json({ error: 'Failed to update tournament' });
  }
});

// DELETE /api/tournaments/:id - Delete tournament
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await TournamentModel.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    res.json({ message: 'Tournament deleted successfully' });
  } catch (error) {
    console.error('Error deleting tournament:', error);
    res.status(500).json({ error: 'Failed to delete tournament' });
  }
});

export default router;