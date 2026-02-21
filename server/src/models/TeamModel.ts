import db from './db';
import { Team } from './types';
import { buildUpdate } from './helpers';

const TEAM_COLUMNS = new Set(['tournament_id', 'name', 'captain_id']);

export const TeamModel = {
  create: (team: Omit<Team, 'created_at' | 'updated_at'>): Team => {
    const stmt = db.prepare(`
      INSERT INTO teams (id, tournament_id, name, captain_id)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(team.id, team.tournament_id, team.name, team.captain_id);
    const created = TeamModel.findById(team.id);
    if (!created) throw new Error(`Failed to create team with id ${team.id}`);
    return created;
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
    const { fields, values } = buildUpdate(updates as Record<string, unknown>, TEAM_COLUMNS);
    if (fields.length === 0) return TeamModel.findById(id);

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
