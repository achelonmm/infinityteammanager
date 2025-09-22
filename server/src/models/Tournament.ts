import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

/* const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
} */
  const dbDir = process.env.DATA_DIR || path.join(__dirname, '../../data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

const db = new Database(path.join(dbDir, 'tournament.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS tournaments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    current_round INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY,
    tournament_id TEXT NOT NULL,
    name TEXT NOT NULL,
    captain_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS players (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL,
    nickname TEXT NOT NULL,
    its_pin TEXT NOT NULL,
    army TEXT NOT NULL,
    is_captain BOOLEAN DEFAULT 0,
    is_painted BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS team_matches (
    id TEXT PRIMARY KEY,
    tournament_id TEXT NOT NULL,
    round INTEGER NOT NULL,
    team1_id TEXT NOT NULL,
    team2_id TEXT NOT NULL,
    table_number INTEGER DEFAULT 1,
    is_completed BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (team1_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (team2_id) REFERENCES teams(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS individual_matches (
    id TEXT PRIMARY KEY,
    team_match_id TEXT NOT NULL,
    player1_id TEXT NOT NULL,
    player2_id TEXT NOT NULL,
    tournament_points1 INTEGER DEFAULT 0,
    tournament_points2 INTEGER DEFAULT 0,
    objective_points1 INTEGER DEFAULT 0,
    objective_points2 INTEGER DEFAULT 0,
    victory_points_for1 INTEGER DEFAULT 0,
    victory_points_against1 INTEGER DEFAULT 0,
    victory_points_for2 INTEGER DEFAULT 0,
    victory_points_against2 INTEGER DEFAULT 0,
    painted_bonus1 BOOLEAN DEFAULT 0,
    painted_bonus2 BOOLEAN DEFAULT 0,
    is_completed BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_match_id) REFERENCES team_matches(id) ON DELETE CASCADE,
    FOREIGN KEY (player1_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (player2_id) REFERENCES players(id) ON DELETE CASCADE
  );
`);

// Model interfaces
interface Tournament {
  id: string;
  name: string;
  current_round: number;
  created_at?: string;
  updated_at?: string;
}

interface Team {
  id: string;
  tournament_id: string;
  name: string;
  captain_id: string | null;
  created_at?: string;
  updated_at?: string;
}

interface Player {
  id: string;
  team_id: string;
  nickname: string;
  its_pin: string;
  army: string;
  is_captain: number;
  is_painted: number;
  created_at?: string;
  updated_at?: string;
}

interface TeamMatch {
  id: string;
  tournament_id: string;
  round: number;
  team1_id: string;
  team2_id: string;
  table_number: number;
  is_completed: number;
  created_at?: string;
  updated_at?: string;
}

interface IndividualMatch {
  id: string;
  team_match_id: string;
  player1_id: string;
  player2_id: string;
  tournament_points1: number;
  tournament_points2: number;
  objective_points1: number;
  objective_points2: number;
  victory_points_for1: number;
  victory_points_against1: number;
  victory_points_for2: number;
  victory_points_against2: number;
  painted_bonus1: number;
  painted_bonus2: number;
  is_completed: number;
  created_at?: string;
  updated_at?: string;
}

// Tournament Model
export const TournamentModel = {
  create: (tournament: Omit<Tournament, 'created_at' | 'updated_at'>): Tournament => {
    const stmt = db.prepare(`
      INSERT INTO tournaments (id, name, current_round)
      VALUES (?, ?, ?)
    `);
    stmt.run(tournament.id, tournament.name, tournament.current_round);
    return TournamentModel.findById(tournament.id)!;
  },

  findById: (id: string): Tournament | null => {
    const stmt = db.prepare('SELECT * FROM tournaments WHERE id = ?');
    const row = stmt.get(id) as Tournament | undefined;
    return row || null;
  },

  findAll: (): Tournament[] => {
    const stmt = db.prepare('SELECT * FROM tournaments ORDER BY created_at DESC');
    return stmt.all() as Tournament[];
  },

  update: (id: string, updates: Partial<Tournament>): Tournament | null => {
    const fields = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'created_at')
      .map(key => `${key} = ?`);
    
    if (fields.length === 0) return TournamentModel.findById(id);

    const values = Object.entries(updates)
      .filter(([key]) => key !== 'id' && key !== 'created_at')
      .map(([, value]) => value);

    const stmt = db.prepare(`
      UPDATE tournaments 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(...values, id);
    return TournamentModel.findById(id);
  },

  delete: (id: string): boolean => {
    const stmt = db.prepare('DELETE FROM tournaments WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
};

// Team Model
export const TeamModel = {
  create: (team: Omit<Team, 'created_at' | 'updated_at'>): Team => {
    const stmt = db.prepare(`
      INSERT INTO teams (id, tournament_id, name, captain_id)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(team.id, team.tournament_id, team.name, team.captain_id);
    return TeamModel.findById(team.id)!;
  },

  findById: (id: string): Team | null => {
    const stmt = db.prepare('SELECT * FROM teams WHERE id = ?');
    const row = stmt.get(id) as Team | undefined;
    return row || null;
  },

  findByTournamentId: (tournamentId: string): Team[] => {
    const stmt = db.prepare('SELECT * FROM teams WHERE tournament_id = ?');
    return stmt.all(tournamentId) as Team[];
  },

  update: (id: string, updates: Partial<Team>): Team | null => {
    const fields = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'created_at')
      .map(key => `${key} = ?`);
    
    if (fields.length === 0) return TeamModel.findById(id);

    const values = Object.entries(updates)
      .filter(([key]) => key !== 'id' && key !== 'created_at')
      .map(([, value]) => value);

    const stmt = db.prepare(`
      UPDATE teams 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(...values, id);
    return TeamModel.findById(id);
  },

  delete: (id: string): boolean => {
    const stmt = db.prepare('DELETE FROM teams WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
};

// Player Model
export const PlayerModel = {
  create: (player: Omit<Player, 'created_at' | 'updated_at'>): Player => {
    const stmt = db.prepare(`
      INSERT INTO players (id, team_id, nickname, its_pin, army, is_captain, is_painted)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      player.id,
      player.team_id,
      player.nickname,
      player.its_pin,
      player.army,
      player.is_captain ? 1 : 0,
      player.is_painted ? 1 : 0
    );
    return PlayerModel.findById(player.id)!;
  },

  findById: (id: string): Player | null => {
    const stmt = db.prepare('SELECT * FROM players WHERE id = ?');
    const row = stmt.get(id) as Player | undefined;
    return row || null;
  },

  findByTeamId: (teamId: string): Player[] => {
    const stmt = db.prepare('SELECT * FROM players WHERE team_id = ?');
    return stmt.all(teamId) as Player[];
  },

  update: (id: string, updates: Partial<Player>): Player | null => {
    const fields = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'created_at')
      .map(key => `${key} = ?`);
    
    if (fields.length === 0) return PlayerModel.findById(id);

    const values = Object.entries(updates)
      .filter(([key]) => key !== 'id' && key !== 'created_at')
      .map(([, value]) => value);

    const stmt = db.prepare(`
      UPDATE players 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(...values, id);
    return PlayerModel.findById(id);
  },

  delete: (id: string): boolean => {
    const stmt = db.prepare('DELETE FROM players WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
};

// TeamMatch Model
export const TeamMatchModel = {
  create: (teamMatch: Omit<TeamMatch, 'created_at' | 'updated_at'>): TeamMatch => {
    const stmt = db.prepare(`
      INSERT INTO team_matches (id, tournament_id, round, team1_id, team2_id, table_number, is_completed)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      teamMatch.id,
      teamMatch.tournament_id,
      teamMatch.round,
      teamMatch.team1_id,
      teamMatch.team2_id,
      teamMatch.table_number,
      teamMatch.is_completed ? 1 : 0
    );
    return TeamMatchModel.findById(teamMatch.id)!;
  },

  findById: (id: string): TeamMatch | null => {
    const stmt = db.prepare('SELECT * FROM team_matches WHERE id = ?');
    const row = stmt.get(id) as TeamMatch | undefined;
    return row || null;
  },

  findByTournamentId: (tournamentId: string): TeamMatch[] => {
    const stmt = db.prepare('SELECT * FROM team_matches WHERE tournament_id = ? ORDER BY round, table_number');
    return stmt.all(tournamentId) as TeamMatch[];
  },

  findByRound: (tournamentId: string, round: number): TeamMatch[] => {
    const stmt = db.prepare('SELECT * FROM team_matches WHERE tournament_id = ? AND round = ? ORDER BY table_number');
    return stmt.all(tournamentId, round) as TeamMatch[];
  },

  update: (id: string, updates: Partial<TeamMatch>): TeamMatch | null => {
    const fields = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'created_at')
      .map(key => `${key} = ?`);
    
    if (fields.length === 0) return TeamMatchModel.findById(id);

    const values = Object.entries(updates)
      .filter(([key]) => key !== 'id' && key !== 'created_at')
      .map(([, value]) => value);

    const stmt = db.prepare(`
      UPDATE team_matches 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(...values, id);
    return TeamMatchModel.findById(id);
  },

  delete: (id: string): boolean => {
    const stmt = db.prepare('DELETE FROM team_matches WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
};

// IndividualMatch Model
export const IndividualMatchModel = {
  create: (match: Omit<IndividualMatch, 'created_at' | 'updated_at'>): IndividualMatch => {
    const stmt = db.prepare(`
      INSERT INTO individual_matches (
        id, team_match_id, player1_id, player2_id,
        tournament_points1, tournament_points2,
        objective_points1, objective_points2,
        victory_points_for1, victory_points_against1,
        victory_points_for2, victory_points_against2,
        painted_bonus1, painted_bonus2, is_completed
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      match.id,
      match.team_match_id,
      match.player1_id,
      match.player2_id,
      match.tournament_points1,
      match.tournament_points2,
      match.objective_points1,
      match.objective_points2,
      match.victory_points_for1,
      match.victory_points_against1,
      match.victory_points_for2,
      match.victory_points_against2,
      match.painted_bonus1 ? 1 : 0,
      match.painted_bonus2 ? 1 : 0,
      match.is_completed ? 1 : 0
    );
    return IndividualMatchModel.findById(match.id)!;
  },

  findById: (id: string): IndividualMatch | null => {
    const stmt = db.prepare('SELECT * FROM individual_matches WHERE id = ?');
    const row = stmt.get(id) as IndividualMatch | undefined;
    return row || null;
  },

  findByTeamMatchId: (teamMatchId: string): IndividualMatch[] => {
    const stmt = db.prepare('SELECT * FROM individual_matches WHERE team_match_id = ?');
    return stmt.all(teamMatchId) as IndividualMatch[];
  },

  update: (id: string, updates: Partial<IndividualMatch>): IndividualMatch | null => {
    const fields = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'created_at')
      .map(key => `${key} = ?`);
    
    if (fields.length === 0) return IndividualMatchModel.findById(id);

    const values = Object.entries(updates)
      .filter(([key]) => key !== 'id' && key !== 'created_at')
      .map(([, value]) => value);

    const stmt = db.prepare(`
      UPDATE individual_matches 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(...values, id);
    return IndividualMatchModel.findById(id);
  },

  delete: (id: string): boolean => {
    const stmt = db.prepare('DELETE FROM individual_matches WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
};

export default db;