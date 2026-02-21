import { PlayerModel } from '../models/PlayerModel';
import { playerMapper } from '../utils/caseMapper';

export const playerService = {
  update(id: string, updates: Record<string, unknown>) {
    const dbUpdates = playerMapper.toDb(updates);
    const player = PlayerModel.update(id, dbUpdates);
    if (!player) return null;
    return playerMapper.toApi(player);
  },

  delete(id: string) {
    return PlayerModel.delete(id);
  }
};
