import db from './db';
import { TeamMatch } from './types';
import { buildUpdate } from './helpers';

const TEAM_MATCH_COLUMNS = new Set(['tournament_id', 'round', 'team1_id', 'team2_id', 'table_number', 'is_completed']);

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
    const created = TeamMatchModel.findById(teamMatch.id);
    if (!created) throw new Error(`Failed to create team match with id ${teamMatch.id}`);
    return created;
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
    const { fields, values } = buildUpdate(updates as Record<string, unknown>, TEAM_MATCH_COLUMNS);
    if (fields.length === 0) return TeamMatchModel.findById(id);

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
