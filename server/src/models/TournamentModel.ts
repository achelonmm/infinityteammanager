import db from './db';
import { Tournament } from './types';
import { buildUpdate } from './helpers';

const TOURNAMENT_COLUMNS = new Set(['name', 'current_round']);

export const TournamentModel = {
  create: (tournament: Omit<Tournament, 'created_at' | 'updated_at'>): Tournament => {
    const stmt = db.prepare(`
      INSERT INTO tournaments (id, name, current_round)
      VALUES (?, ?, ?)
    `);
    stmt.run(tournament.id, tournament.name, tournament.current_round);
    const created = TournamentModel.findById(tournament.id);
    if (!created) throw new Error(`Failed to create tournament with id ${tournament.id}`);
    return created;
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
    const { fields, values } = buildUpdate(updates as Record<string, unknown>, TOURNAMENT_COLUMNS);
    if (fields.length === 0) return TournamentModel.findById(id);

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
