import db from './db';
import { Player } from './types';
import { buildUpdate } from './helpers';

const PLAYER_COLUMNS = new Set(['team_id', 'nickname', 'its_pin', 'army', 'is_captain', 'is_painted']);

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
    const created = PlayerModel.findById(player.id);
    if (!created) throw new Error(`Failed to create player with id ${player.id}`);
    return created;
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

  findByTeamIds: (teamIds: string[]): Player[] => {
    if (teamIds.length === 0) return [];
    const placeholders = teamIds.map(() => '?').join(', ');
    const stmt = db.prepare(`SELECT * FROM players WHERE team_id IN (${placeholders})`);
    return stmt.all(...teamIds) as Player[];
  },

  update: (id: string, updates: Partial<Player>): Player | null => {
    const { fields, values } = buildUpdate(updates as Record<string, unknown>, PLAYER_COLUMNS);
    if (fields.length === 0) return PlayerModel.findById(id);

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
