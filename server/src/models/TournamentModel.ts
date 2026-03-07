import db from './db';
import { Tournament, TournamentWithCounts } from './types';
import { buildUpdate } from './helpers';

const TOURNAMENT_COLUMNS = new Set(['name', 'current_round', 'status']);

export const TournamentModel = {
  create: (tournament: Omit<Tournament, 'created_at' | 'updated_at'>): Tournament => {
    const stmt = db.prepare(`
      INSERT INTO tournaments (id, name, current_round, status)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(tournament.id, tournament.name, tournament.current_round, tournament.status);
    const created = TournamentModel.findById(tournament.id);
    if (!created) throw new Error(`Failed to create tournament with id ${tournament.id}`);
    return created;
  },

  findById: (id: string): Tournament | null => {
    const stmt = db.prepare('SELECT * FROM tournaments WHERE id = ?');
    const row = stmt.get(id) as Tournament | undefined;
    return row || null;
  },

  findByName: (name: string): Tournament | null => {
    const stmt = db.prepare('SELECT * FROM tournaments WHERE name = ?');
    const row = stmt.get(name) as Tournament | undefined;
    return row || null;
  },

  findAll: (): Tournament[] => {
    const stmt = db.prepare('SELECT * FROM tournaments ORDER BY created_at DESC');
    return stmt.all() as Tournament[];
  },

  findAllWithCounts: (): TournamentWithCounts[] => {
    const stmt = db.prepare(`
      SELECT
        t.*,
        COALESCE(tc.team_count, 0) AS team_count,
        COALESCE(mc.match_count, 0) AS match_count
      FROM tournaments t
      LEFT JOIN (
        SELECT tournament_id, COUNT(*) AS team_count
        FROM teams
        GROUP BY tournament_id
      ) tc ON tc.tournament_id = t.id
      LEFT JOIN (
        SELECT tournament_id, COUNT(*) AS match_count
        FROM team_matches
        GROUP BY tournament_id
      ) mc ON mc.tournament_id = t.id
      ORDER BY
        CASE t.status WHEN 'active' THEN 0 ELSE 1 END,
        t.created_at DESC
    `);
    return stmt.all() as TournamentWithCounts[];
  },

  findActive: (): Tournament | null => {
    const stmt = db.prepare("SELECT * FROM tournaments WHERE status = 'active' ORDER BY created_at DESC LIMIT 1");
    const row = stmt.get() as Tournament | undefined;
    return row || null;
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

  setStatus: (id: string, status: 'active' | 'completed'): Tournament | null => {
    const stmt = db.prepare(`
      UPDATE tournaments
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(status, id);
    return TournamentModel.findById(id);
  },

  deactivateAll: (): void => {
    db.prepare("UPDATE tournaments SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE status = 'active'").run();
  },

  delete: (id: string): boolean => {
    const stmt = db.prepare('DELETE FROM tournaments WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
};
