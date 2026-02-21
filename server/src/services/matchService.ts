import db from '../models/db';
import { TeamMatchModel } from '../models/TeamMatchModel';
import { IndividualMatchModel } from '../models/IndividualMatchModel';
import { teamMatchMapper, individualMatchMapper } from '../utils/caseMapper';

interface IndividualMatchPairing {
  id?: string;
  player1Id: string;
  player2Id: string;
}

export const matchService = {
  createTeamMatch(data: Record<string, unknown>) {
    const dbData = teamMatchMapper.toDb(data);
    const created = TeamMatchModel.create(dbData as Parameters<typeof TeamMatchModel.create>[0]);
    return teamMatchMapper.toApi(created);
  },

  updateTeamMatch(id: string, updates: Record<string, unknown>) {
    const dbUpdates = teamMatchMapper.toDb(updates);
    const match = TeamMatchModel.update(id, dbUpdates);
    if (!match) return null;
    return teamMatchMapper.toApi(match);
  },

  deleteTeamMatch(id: string) {
    return TeamMatchModel.delete(id);
  },

  createIndividualMatch(data: Record<string, unknown>) {
    const created = IndividualMatchModel.create(data as Parameters<typeof IndividualMatchModel.create>[0]);
    return created;
  },

  updateIndividualMatch(id: string, updates: Record<string, unknown>) {
    const dbUpdates = individualMatchMapper.toDb(updates);
    const match = IndividualMatchModel.update(id, dbUpdates);
    if (!match) return null;
    return individualMatchMapper.toApi(match);
  },

  batchCreateIndividualMatches(teamMatchId: string, pairings: IndividualMatchPairing[]) {
    return db.transaction(() => {
      return pairings.map(pairing => {
        const created = IndividualMatchModel.create({
          id: pairing.id || crypto.randomUUID(),
          team_match_id: teamMatchId,
          player1_id: pairing.player1Id,
          player2_id: pairing.player2Id,
          tournament_points1: 0,
          tournament_points2: 0,
          objective_points1: 0,
          objective_points2: 0,
          victory_points_for1: 0,
          victory_points_against1: 0,
          victory_points_for2: 0,
          victory_points_against2: 0,
          painted_bonus1: 0,
          painted_bonus2: 0,
          is_completed: 0
        });
        return individualMatchMapper.toApi(created);
      });
    })();
  },

  batchCreateTeamMatches(matches: Record<string, unknown>[]) {
    return db.transaction(() => {
      return matches.map(teamMatch => {
        const dbData = teamMatchMapper.toDb(teamMatch);
        const created = TeamMatchModel.create(dbData as Parameters<typeof TeamMatchModel.create>[0]);
        return teamMatchMapper.toApi(created);
      });
    })();
  },

  batchDeleteTeamMatchesByRound(tournamentId: string, round: number) {
    const matchesToDelete = TeamMatchModel.findByRound(tournamentId, round);
    db.transaction(() => {
      for (const match of matchesToDelete) {
        TeamMatchModel.delete(match.id);
      }
    })();
    return matchesToDelete.length;
  }
};
