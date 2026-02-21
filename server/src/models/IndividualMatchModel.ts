import db from './db';
import { IndividualMatch } from './types';
import { buildUpdate } from './helpers';

const INDIVIDUAL_MATCH_COLUMNS = new Set([
  'team_match_id', 'player1_id', 'player2_id',
  'tournament_points1', 'tournament_points2',
  'objective_points1', 'objective_points2',
  'victory_points_for1', 'victory_points_against1',
  'victory_points_for2', 'victory_points_against2',
  'painted_bonus1', 'painted_bonus2', 'is_completed'
]);

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
    const created = IndividualMatchModel.findById(match.id);
    if (!created) throw new Error(`Failed to create individual match with id ${match.id}`);
    return created;
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

  findByTeamMatchIds: (teamMatchIds: string[]): IndividualMatch[] => {
    if (teamMatchIds.length === 0) return [];
    const placeholders = teamMatchIds.map(() => '?').join(', ');
    const stmt = db.prepare(`SELECT * FROM individual_matches WHERE team_match_id IN (${placeholders})`);
    return stmt.all(...teamMatchIds) as IndividualMatch[];
  },

  update: (id: string, updates: Partial<IndividualMatch>): IndividualMatch | null => {
    const { fields, values } = buildUpdate(updates as Record<string, unknown>, INDIVIDUAL_MATCH_COLUMNS);
    if (fields.length === 0) return IndividualMatchModel.findById(id);

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
