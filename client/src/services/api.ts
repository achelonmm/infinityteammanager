import { Tournament, TournamentSummary, Team, Player, TeamMatch, IndividualMatch } from '../types';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const AUTH_TOKEN_KEY = 'infinityTournamentToken';

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

function getToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function hasToken(): boolean {
  return !!localStorage.getItem(AUTH_TOKEN_KEY);
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const apiService = {
  // Auth
  async login(password: string): Promise<{ token: string }> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: 'Login failed' }));
      throw new ApiError(data.error || 'Login failed', response.status);
    }
    return response.json();
  },

  // Tournament endpoints
  async getTournaments(): Promise<TournamentSummary[]> {
    const response = await fetch(`${API_BASE}/tournaments`);
    if (!response.ok) throw new Error('Failed to fetch tournaments');
    return response.json();
  },

  async getActiveTournament(): Promise<TournamentSummary> {
    const response = await fetch(`${API_BASE}/tournaments/active`);
    if (!response.ok) throw new ApiError('No active tournament found', response.status);
    return response.json();
  },

  async getTournament(id: string): Promise<Tournament> {
    const response = await fetch(`${API_BASE}/tournaments/${id}`);
    if (!response.ok) throw new ApiError('Failed to fetch tournament', response.status);
    return response.json();
  },

  async createTournament(data: { id: string; name: string }): Promise<Tournament> {
    const response = await fetch(`${API_BASE}/tournaments`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (response.status === 409) {
      const err = await response.json().catch(() => ({ error: 'Tournament name already exists' }));
      throw new ApiError(err.error || 'Tournament name already exists', 409);
    }
    if (!response.ok) throw new Error('Failed to create tournament');
    return response.json();
  },

  async updateTournament(id: string, updates: Partial<Tournament>): Promise<Tournament> {
    const response = await fetch(`${API_BASE}/tournaments/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(updates),
    });
    if (response.status === 409) {
      const err = await response.json().catch(() => ({ error: 'Tournament name already exists' }));
      throw new ApiError(err.error || 'Tournament name already exists', 409);
    }
    if (!response.ok) throw new Error('Failed to update tournament');
    return response.json();
  },

  async activateTournament(id: string): Promise<Tournament> {
    const response = await fetch(`${API_BASE}/tournaments/${id}/activate`, {
      method: 'POST',
      headers: authHeaders(),
    });
    if (!response.ok) throw new ApiError('Failed to activate tournament', response.status);
    return response.json();
  },

  async completeTournament(id: string): Promise<Tournament> {
    const response = await fetch(`${API_BASE}/tournaments/${id}/complete`, {
      method: 'POST',
      headers: authHeaders(),
    });
    if (!response.ok) throw new ApiError('Failed to complete tournament', response.status);
    return response.json();
  },

  async deleteTournament(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/tournaments/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete tournament');
  },

  // Team endpoints
  async createTeam(data: { team: Omit<Team, 'players'>; players: Omit<Player, 'created_at' | 'updated_at'>[] }): Promise<Team> {
    const response = await fetch(`${API_BASE}/teams`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create team');
    return response.json();
  },

  async updateTeam(id: string, data: { team: Partial<Team>; players: Player[] }): Promise<Team> {
    const response = await fetch(`${API_BASE}/teams/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update team');
    return response.json();
  },

  async deleteTeam(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/teams/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete team');
  },

  // Player endpoints
  async updatePlayer(id: string, updates: Partial<Player>): Promise<Player> {
    const response = await fetch(`${API_BASE}/players/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update player');
    return response.json();
  },

  async deletePlayer(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/players/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete player');
  },

  // Match endpoints
  async createTeamMatch(teamMatch: Omit<TeamMatch, 'created_at' | 'updated_at' | 'individualMatches'>): Promise<TeamMatch> {
    const response = await fetch(`${API_BASE}/matches/team`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(teamMatch),
    });
    if (!response.ok) throw new Error('Failed to create team match');
    return response.json();
  },

  async updateTeamMatch(id: string, updates: Partial<TeamMatch>): Promise<TeamMatch> {
    const response = await fetch(`${API_BASE}/matches/team/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update team match');
    return response.json();
  },

  async createIndividualMatches(teamMatchId: string, pairings: { player1Id: string; player2Id: string }[]): Promise<IndividualMatch[]> {
    const response = await fetch(`${API_BASE}/matches/individual/batch`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ teamMatchId, pairings }),
    });
    if (!response.ok) throw new Error('Failed to create individual matches');
    return response.json();
  },

  async batchCreateTeamMatches(matches: Omit<TeamMatch, 'created_at' | 'updated_at' | 'individualMatches'>[]): Promise<TeamMatch[]> {
    const response = await fetch(`${API_BASE}/matches/team/batch`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ matches }),
    });
    if (!response.ok) throw new Error('Failed to batch create team matches');
    return response.json();
  },

  async batchDeleteRoundMatches(tournamentId: string, round: number): Promise<{ deleted: number }> {
    const response = await fetch(`${API_BASE}/matches/team/batch/${tournamentId}/${round}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!response.ok) throw new ApiError('Failed to batch delete round matches', response.status);
    return response.json();
  },

  async deleteTeamMatch(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/matches/team/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!response.ok) throw new ApiError('Failed to delete team match', response.status);
  },

  async updateIndividualMatch(id: string, updates: Partial<IndividualMatch>): Promise<IndividualMatch> {
    const response = await fetch(`${API_BASE}/matches/individual/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update individual match');
    return response.json();
  },
};
