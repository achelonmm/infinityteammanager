import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = process.env.DATA_DIR || path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(path.join(dbDir, 'tournament.db'));

db.pragma('foreign_keys = ON');

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

  CREATE INDEX IF NOT EXISTS idx_teams_tournament_id ON teams(tournament_id);
  CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);
  CREATE INDEX IF NOT EXISTS idx_team_matches_tournament_id ON team_matches(tournament_id);
  CREATE INDEX IF NOT EXISTS idx_team_matches_round ON team_matches(tournament_id, round);
  CREATE INDEX IF NOT EXISTS idx_individual_matches_team_match_id ON individual_matches(team_match_id);
`);

export default db;
