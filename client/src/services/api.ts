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

export function isTokenValid(): boolean {
  const token = getToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

async function handleResponse<T>(response: Response, errorMessage: string): Promise<T> {
  if (response.status === 401) {
    clearToken();
    const data = await response.json().catch(() => ({ error: errorMessage }));
    throw new ApiError(data.error || 'Session expired. Please log in again.', 401);
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: errorMessage }));
    throw new ApiError(data.error || errorMessage, response.status);
  }
  return response.json();
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
    return handleResponse<Tournament>(response, 'Failed to create tournament');
  },

  async updateTournament(id: string, updates: Partial<Tournament>): Promise<Tournament> {
    const response = await fetch(`${API_BASE}/tournaments/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse<Tournament>(response, 'Failed to update tournament');
  },

  async activateTournament(id: string): Promise<Tournament> {
    const response = await fetch(`${API_BASE}/tournaments/${id}/activate`, {
      method: 'POST',
      headers: authHeaders(),
    });
    return handleResponse<Tournament>(response, 'Failed to activate tournament');
  },

  async completeTournament(id: string): Promise<Tournament> {
    const response = await fetch(`${API_BASE}/tournaments/${id}/complete`, {
      method: 'POST',
      headers: authHeaders(),
    });
    return handleResponse<Tournament>(response, 'Failed to complete tournament');
  },

  async deleteTournament(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/tournaments/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    await handleResponse<void>(response, 'Failed to delete tournament');
  },

  // Team endpoints
  async createTeam(data: { team: Omit<Team, 'players'>; players: Omit<Player, 'created_at' | 'updated_at'>[] }): Promise<Team> {
    const response = await fetch(`${API_BASE}/teams`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Team>(response, 'Failed to create team');
  },

  async updateTeam(id: string, data: { team: Partial<Team>; players: Player[] }): Promise<Team> {
    const response = await fetch(`${API_BASE}/teams/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Team>(response, 'Failed to update team');
  },

  async deleteTeam(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/teams/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    await handleResponse<void>(response, 'Failed to delete team');
  },

  // Player endpoints
  async updatePlayer(id: string, updates: Partial<Player>): Promise<Player> {
    const response = await fetch(`${API_BASE}/players/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse<Player>(response, 'Failed to update player');
  },

  async deletePlayer(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/players/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    await handleResponse<void>(response, 'Failed to delete player');
  },

  // Match endpoints
  async createTeamMatch(teamMatch: Omit<TeamMatch, 'created_at' | 'updated_at' | 'individualMatches'>): Promise<TeamMatch> {
    const response = await fetch(`${API_BASE}/matches/team`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(teamMatch),
    });
    return handleResponse<TeamMatch>(response, 'Failed to create team match');
  },

  async updateTeamMatch(id: string, updates: Partial<TeamMatch>): Promise<TeamMatch> {
    const response = await fetch(`${API_BASE}/matches/team/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse<TeamMatch>(response, 'Failed to update team match');
  },

  async createIndividualMatches(teamMatchId: string, pairings: { player1Id: string; player2Id: string }[]): Promise<IndividualMatch[]> {
    const response = await fetch(`${API_BASE}/matches/individual/batch`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ teamMatchId, pairings }),
    });
    return handleResponse<IndividualMatch[]>(response, 'Failed to create individual matches');
  },

  async batchCreateTeamMatches(matches: Omit<TeamMatch, 'created_at' | 'updated_at' | 'individualMatches'>[]): Promise<TeamMatch[]> {
    const response = await fetch(`${API_BASE}/matches/team/batch`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ matches }),
    });
    return handleResponse<TeamMatch[]>(response, 'Failed to batch create team matches');
  },

  async batchDeleteRoundMatches(tournamentId: string, round: number): Promise<{ deleted: number }> {
    const response = await fetch(`${API_BASE}/matches/team/batch/${tournamentId}/${round}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse<{ deleted: number }>(response, 'Failed to batch delete round matches');
  },

  async deleteTeamMatch(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/matches/team/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    await handleResponse<void>(response, 'Failed to delete team match');
  },

  async updateIndividualMatch(id: string, updates: Partial<IndividualMatch>): Promise<IndividualMatch> {
    const response = await fetch(`${API_BASE}/matches/individual/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse<IndividualMatch>(response, 'Failed to update individual match');
  },

  async submitPlayerResult(matchId: string, data: { itsPin: string } & Partial<IndividualMatch>): Promise<IndividualMatch> {
    const response = await fetch(`${API_BASE}/matches/individual/${matchId}/player-result`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to submit result' }));
      throw new ApiError(errorData.error || 'Failed to submit result', response.status);
    }
    return response.json();
  },
};
