import { Tournament, Team, Player, TeamMatch, IndividualMatch } from '../types';

const API_BASE = 'http://localhost:3001/api';

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiService = {
  // Tournament endpoints
  async getTournaments(): Promise<Tournament[]> {
    const response = await fetch(`${API_BASE}/tournaments`);
    if (!response.ok) throw new Error('Failed to fetch tournaments');
    return response.json();
  },

  async getTournament(id: string): Promise<Tournament> {
    const response = await fetch(`${API_BASE}/tournaments/${id}`);
    if (!response.ok) throw new ApiError('Failed to fetch tournament', response.status);
    return response.json();
  },

  async createTournament(tournament: Omit<Tournament, 'teams' | 'teamMatches'>): Promise<Tournament> {
    const response = await fetch(`${API_BASE}/tournaments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tournament),
    });
    if (!response.ok) throw new Error('Failed to create tournament');
    return response.json();
  },

  async updateTournament(id: string, updates: Partial<Tournament>): Promise<Tournament> {
    const response = await fetch(`${API_BASE}/tournaments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update tournament');
    return response.json();
  },

  async deleteTournament(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/tournaments/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete tournament');
  },

  // Team endpoints
async createTeam(data: { team: Omit<Team, 'players'>; players: Omit<Player, 'created_at' | 'updated_at'>[] }): Promise<Team> {
  const response = await fetch(`${API_BASE}/teams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create team');
  return response.json();
},

  // Change this method:
async updateTeam(id: string, data: { team: Partial<Team>; players: Player[] }): Promise<Team> {
  const response = await fetch(`${API_BASE}/teams/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),  // Now sending { team: {...}, players: [...] }
  });
  if (!response.ok) throw new Error('Failed to update team');
  return response.json();
},

  async deleteTeam(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/teams/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete team');
  },

  // Player endpoints
  async updatePlayer(id: string, updates: Partial<Player>): Promise<Player> {
    const response = await fetch(`${API_BASE}/players/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update player');
    return response.json();
  },

  async deletePlayer(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/players/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete player');
  },

  // Match endpoints
  async createTeamMatch(teamMatch: Omit<TeamMatch, 'created_at' | 'updated_at' | 'individualMatches'>): Promise<TeamMatch> {
    const response = await fetch(`${API_BASE}/matches/team`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teamMatch),
    });
    if (!response.ok) throw new Error('Failed to create team match');
    return response.json();
  },

  async updateTeamMatch(id: string, updates: Partial<TeamMatch>): Promise<TeamMatch> {
    const response = await fetch(`${API_BASE}/matches/team/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update team match');
    return response.json();
  },

  async createIndividualMatches(teamMatchId: string, pairings: { player1Id: string; player2Id: string }[]): Promise<IndividualMatch[]> {
    const response = await fetch(`${API_BASE}/matches/individual/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamMatchId, pairings }),
    });
    if (!response.ok) throw new Error('Failed to create individual matches');
    return response.json();
  },

  async deleteTeamMatch(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/matches/team/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new ApiError('Failed to delete team match', response.status);
  },

  async updateIndividualMatch(id: string, updates: Partial<IndividualMatch>): Promise<IndividualMatch> {
    const response = await fetch(`${API_BASE}/matches/individual/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update individual match');
    return response.json();
  },
};