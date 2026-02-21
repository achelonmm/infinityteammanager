import { TournamentModel } from '../models/TournamentModel';
import { TeamModel } from '../models/TeamModel';
import { PlayerModel } from '../models/PlayerModel';
import { TeamMatchModel } from '../models/TeamMatchModel';
import { IndividualMatchModel } from '../models/IndividualMatchModel';
import { tournamentMapper, playerMapper, teamMapper, teamMatchMapper, individualMatchMapper } from '../utils/caseMapper';

export const tournamentService = {
  findAll() {
    return TournamentModel.findAll();
  },

  findById(id: string) {
    return TournamentModel.findById(id);
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
    const existing = TournamentModel.findById(data.id);
    if (existing) return { tournament: existing, created: false };

    const tournament = TournamentModel.create({
      id: data.id,
      name: data.name,
      current_round: 1
    });
    return { tournament, created: true };
  },

  update(id: string, updates: Record<string, unknown>) {
    const dbUpdates = tournamentMapper.toDb(updates);
    const tournament = TournamentModel.update(id, dbUpdates);
    if (!tournament) return null;
    return tournamentMapper.toApi(tournament);
  },

  delete(id: string) {
    return TournamentModel.delete(id);
  }
};
