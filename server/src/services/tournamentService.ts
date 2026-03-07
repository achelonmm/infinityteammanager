import db from '../models/db';
import { TournamentModel } from '../models/TournamentModel';
import { TeamModel } from '../models/TeamModel';
import { PlayerModel } from '../models/PlayerModel';
import { TeamMatchModel } from '../models/TeamMatchModel';
import { IndividualMatchModel } from '../models/IndividualMatchModel';
import { tournamentMapper, playerMapper, teamMapper, teamMatchMapper, individualMatchMapper } from '../utils/caseMapper';

export const tournamentService = {
  findAll() {
    const tournaments = TournamentModel.findAllWithCounts();
    return tournaments.map(t => tournamentMapper.toApi(t));
  },

  findById(id: string) {
    return TournamentModel.findById(id);
  },

  findActive() {
    const tournament = TournamentModel.findActive();
    if (!tournament) return null;
    return tournamentMapper.toApi(tournament);
  },

  getFullTournament(id: string) {
    const tournament = TournamentModel.findById(id);
    if (!tournament) return null;

    const teams = TeamModel.findByTournamentId(id);
    const teamMatches = TeamMatchModel.findByTournamentId(id);

    const teamIds = teams.map(t => t.id);
    const allPlayers = PlayerModel.findByTeamIds(teamIds);
    const camelCasePlayers = allPlayers.map(p => playerMapper.toApi(p));

    const teamsWithPlayers = teams.map(team => ({
      ...teamMapper.toApi(team),
      players: camelCasePlayers.filter((player: Record<string, unknown>) => player.teamId === team.id)
    }));

    const teamMatchIds = teamMatches.map(tm => tm.id);
    const allIndividualMatches = IndividualMatchModel.findByTeamMatchIds(teamMatchIds);

    const teamMatchesWithIndividual = teamMatches.map(teamMatch => {
      const individualMatches = allIndividualMatches
        .filter(indMatch => indMatch.team_match_id === teamMatch.id)
        .map(indMatch => individualMatchMapper.toApi(indMatch));

      return {
        ...teamMatchMapper.toApi(teamMatch),
        individualMatches
      };
    });

    return {
      ...tournamentMapper.toApi(tournament),
      teams: teamsWithPlayers,
      teamMatches: teamMatchesWithIndividual
    };
  },

  create(data: { id: string; name: string }) {
    const existingName = TournamentModel.findByName(data.name);
    if (existingName) {
      return { tournament: null, created: false, conflict: true };
    }

    const existing = TournamentModel.findById(data.id);
    if (existing) {
      return { tournament: null, created: false, conflict: true };
    }

    const tournament = TournamentModel.create({
      id: data.id,
      name: data.name,
      current_round: 1,
      status: 'active'
    });
    return { tournament: tournamentMapper.toApi(tournament), created: true, conflict: false };
  },

  update(id: string, updates: Record<string, unknown>) {
    if (updates.name) {
      const existingName = TournamentModel.findByName(updates.name as string);
      if (existingName && existingName.id !== id) {
        return { tournament: null, conflict: true };
      }
    }
    const dbUpdates = tournamentMapper.toDb(updates);
    const tournament = TournamentModel.update(id, dbUpdates);
    if (!tournament) return { tournament: null, conflict: false };
    return { tournament: tournamentMapper.toApi(tournament), conflict: false };
  },

  activate(id: string) {
    const tournament = TournamentModel.findById(id);
    if (!tournament) return null;

    const activateTx = db.transaction(() => {
      TournamentModel.deactivateAll();
      return TournamentModel.setStatus(id, 'active');
    });

    const updated = activateTx();
    if (!updated) return null;
    return tournamentMapper.toApi(updated);
  },

  complete(id: string) {
    const tournament = TournamentModel.findById(id);
    if (!tournament) return null;
    const updated = TournamentModel.setStatus(id, 'completed');
    if (!updated) return null;
    return tournamentMapper.toApi(updated);
  },

  delete(id: string) {
    return TournamentModel.delete(id);
  }
};
