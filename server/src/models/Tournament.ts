import { db } from '../config/database';

export interface Tournament {
  id: string;
  name: string;
  currentRound: number;
  created_at?: string;
  updated_at?: string;
}

export interface Team {
  id: string;
  tournamentId: string;
  name: string;
  captainId: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Player {
  id: string;
  teamId: string;
  nickname: string;
  itsPin: string;
  army: string;
  isCaptain: boolean;
  isPainted: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TeamMatch {
  id: string;
  tournamentId: string;
  round: number;
  team1Id: string;
  team2Id: string;
  isCompleted: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface IndividualMatch {
  id: string;
  teamMatchId: string;
  player1Id: string;
  player2Id: string;
  tournamentPoints1: number;
  tournamentPoints2: number;
  objectivePoints1: number;
  objectivePoints2: number;
  victoryPointsFor1: number;
  victoryPointsAgainst1: number;
  victoryPointsFor2: number;
  victoryPointsAgainst2: number;
  paintedBonus1: boolean;
  paintedBonus2: boolean;
  isCompleted: boolean;
  created_at?: string;
  updated_at?: string;
}

export class TournamentModel {
  static async getAll(): Promise<Tournament[]> {
    return await db('tournaments').select('*');
  }

  static async getById(id: string): Promise<Tournament | null> {
    const tournament = await db('tournaments').where({ id }).first();
    return tournament || null;
  }

  static async create(tournament: Omit<Tournament, 'created_at' | 'updated_at'>): Promise<Tournament> {
    await db('tournaments').insert(tournament);
    return await this.getById(tournament.id) as Tournament;
  }

  static async update(id: string, updates: Partial<Tournament>): Promise<Tournament | null> {
    await db('tournaments').where({ id }).update(updates);
    return await this.getById(id);
  }

  static async delete(id: string): Promise<boolean> {
    const deleted = await db('tournaments').where({ id }).del();
    return deleted > 0;
  }

  static async getTeams(tournamentId: string): Promise<Team[]> {
    return await db('teams').where({ tournamentId }).select('*');
  }

  static async getPlayers(tournamentId: string): Promise<Player[]> {
    return await db('players')
      .join('teams', 'players.teamId', 'teams.id')
      .where('teams.tournamentId', tournamentId)
      .select('players.*');
  }

  static async getTeamMatches(tournamentId: string): Promise<TeamMatch[]> {
    return await db('team_matches').where({ tournamentId }).select('*');
  }

  static async getIndividualMatches(tournamentId: string): Promise<IndividualMatch[]> {
    return await db('individual_matches')
      .join('team_matches', 'individual_matches.teamMatchId', 'team_matches.id')
      .where('team_matches.tournamentId', tournamentId)
      .select('individual_matches.*');
  }
}

export class TeamModel {
  static async create(team: Omit<Team, 'created_at' | 'updated_at'>): Promise<Team> {
    await db('teams').insert(team);
    return await db('teams').where({ id: team.id }).first();
  }

  static async update(id: string, updates: Partial<Team>): Promise<Team | null> {
    await db('teams').where({ id }).update(updates);
    return await db('teams').where({ id }).first() || null;
  }

  static async delete(id: string): Promise<boolean> {
    const deleted = await db('teams').where({ id }).del();
    return deleted > 0;
  }

  static async getPlayers(teamId: string): Promise<Player[]> {
    return await db('players').where({ teamId }).select('*');
  }
}

export class PlayerModel {
  static async create(player: Omit<Player, 'created_at' | 'updated_at'>): Promise<Player> {
    await db('players').insert(player);
    return await db('players').where({ id: player.id }).first();
  }

  static async update(id: string, updates: Partial<Player>): Promise<Player | null> {
    await db('players').where({ id }).update(updates);
    return await db('players').where({ id }).first() || null;
  }

  static async delete(id: string): Promise<boolean> {
    const deleted = await db('players').where({ id }).del();
    return deleted > 0;
  }
}

export class MatchModel {
  static async createTeamMatch(match: Omit<TeamMatch, 'created_at' | 'updated_at'>): Promise<TeamMatch> {
    await db('team_matches').insert(match);
    return await db('team_matches').where({ id: match.id }).first();
  }

  static async updateTeamMatch(id: string, updates: Partial<TeamMatch>): Promise<TeamMatch | null> {
    await db('team_matches').where({ id }).update(updates);
    return await db('team_matches').where({ id }).first() || null;
  }

  static async createIndividualMatch(match: Omit<IndividualMatch, 'created_at' | 'updated_at'>): Promise<IndividualMatch> {
    await db('individual_matches').insert(match);
    return await db('individual_matches').where({ id: match.id }).first();
  }

  static async updateIndividualMatch(id: string, updates: Partial<IndividualMatch>): Promise<IndividualMatch | null> {
    await db('individual_matches').where({ id }).update(updates);
    return await db('individual_matches').where({ id }).first() || null;
  }

  static async getIndividualMatchesByTeamMatch(teamMatchId: string): Promise<IndividualMatch[]> {
    return await db('individual_matches').where({ teamMatchId }).select('*');
  }
}