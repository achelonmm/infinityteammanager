import db from '../models/db';
import { TeamModel } from '../models/TeamModel';
import { PlayerModel } from '../models/PlayerModel';
import { playerMapper } from '../utils/caseMapper';

interface PlayerInput {
  id: string;
  nickname: string;
  itsPin: string;
  army: string;
  isCaptain?: boolean;
  isPainted?: boolean;
  armyListLate?: boolean;
}

interface CreateTeamInput {
  team: { id: string; tournamentId: string; name: string };
  players: PlayerInput[];
}

interface UpdateTeamInput {
  teamData: { name?: string; captainId?: string | null };
  playersData?: PlayerInput[];
}

function mapPlayer(player: { id: string; team_id: string; nickname: string; its_pin: string; army: string; is_captain: number; is_painted: number; army_list_late: number; created_at?: string; updated_at?: string }) {
  return playerMapper.toApi(player);
}

function mapTeam(team: { id: string; tournament_id: string; name: string; captain_id: string | null; created_at?: string; updated_at?: string }, players: Record<string, unknown>[]) {
  return {
    id: team.id,
    tournamentId: team.tournament_id,
    name: team.name,
    captainId: team.captain_id,
    createdAt: team.created_at,
    updatedAt: team.updated_at,
    players
  };
}

export const teamService = {
  create(input: CreateTeamInput) {
    const { team, players } = input;
    const captainPlayer = players?.find(p => Boolean(p.isCaptain));

    return db.transaction(() => {
      const createdTeam = TeamModel.create({
        id: team.id,
        tournament_id: team.tournamentId,
        name: team.name,
        captain_id: captainPlayer?.id || null
      });

      const createdPlayers = (players || []).map(player => {
        const created = PlayerModel.create({
          id: player.id,
          team_id: createdTeam.id,
          nickname: player.nickname,
          its_pin: player.itsPin,
          army: player.army,
          is_captain: player.isCaptain ? 1 : 0,
          is_painted: player.isPainted ? 1 : 0,
          army_list_late: player.armyListLate ? 1 : 0
        });
        return mapPlayer(created);
      });

      return mapTeam(createdTeam, createdPlayers);
    })();
  },

  update(id: string, input: UpdateTeamInput) {
    const { teamData, playersData } = input;
    const captainPlayer = playersData?.find(p => p.isCaptain);
    const captainId = captainPlayer?.id || teamData.captainId || null;

    return db.transaction(() => {
      const updatedTeam = TeamModel.update(id, {
        name: teamData.name,
        captain_id: captainId
      });

      if (!updatedTeam) return null;

      const updatedPlayers: Record<string, unknown>[] = [];
      if (playersData && Array.isArray(playersData)) {
        const existingPlayers = PlayerModel.findByTeamId(id);
        existingPlayers.forEach(p => PlayerModel.delete(p.id));

        for (const player of playersData) {
          const created = PlayerModel.create({
            id: player.id,
            team_id: id,
            nickname: player.nickname,
            its_pin: player.itsPin,
            army: player.army,
            is_captain: player.isCaptain ? 1 : 0,
            is_painted: player.isPainted ? 1 : 0,
            army_list_late: player.armyListLate ? 1 : 0
          });
          updatedPlayers.push(mapPlayer(created));
        }
      }

      return mapTeam(updatedTeam, updatedPlayers);
    })();
  },

  delete(id: string) {
    return TeamModel.delete(id);
  }
};
