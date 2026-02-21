import React, { createContext, useContext, ReactNode } from 'react';
import { Team, Player } from '../types';
import { apiService } from '../services/api';
import { useTournamentData } from './TournamentDataContext';

interface TeamsContextType {
  addTeam: (team: Omit<Team, 'id'>) => Promise<void>;
  updateTeam: (teamId: string, updates: Partial<Team>) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  updatePlayer: (playerId: string, updates: Partial<Player>) => Promise<void>;
  getTeams: () => Team[];
  getPlayers: () => Player[];
}

const TeamsContext = createContext<TeamsContextType | undefined>(undefined);

export const useTeams = () => {
  const context = useContext(TeamsContext);
  if (!context) {
    throw new Error('useTeams must be used within a TeamsProvider');
  }
  return context;
};

interface TeamsProviderProps {
  children: ReactNode;
}

export const TeamsProvider: React.FC<TeamsProviderProps> = ({ children }) => {
  const { tournament, setLoading, setError, loadTournament } = useTournamentData();

  const addTeam = async (teamData: Omit<Team, 'id'>) => {
    if (!tournament) throw new Error('No tournament initialized');

    setLoading(true);
    setError(null);
    try {
      const teamId = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const playersWithIds = teamData.players.map((player, index) => ({
        ...player,
        id: `player_${teamId}_${index}`,
        teamId: teamId
      }));

      const captain = playersWithIds.find(p => p.isCaptain);

      const team: Omit<Team, 'players'> = {
        id: teamId,
        tournamentId: tournament.id,
        name: teamData.name,
        captainId: captain?.id || null
      };

      await apiService.createTeam({ team, players: playersWithIds });
      await loadTournament(tournament.id);
    } catch (err) {
      console.error('Failed to add team:', err);
      setError('Failed to add team');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTeam = async (teamId: string, updates: Partial<Team>) => {
    if (!tournament) return;

    setLoading(true);
    setError(null);
    try {
      const team = tournament.teams.find(t => t.id === teamId);
      if (!team) throw new Error('Team not found');

      await apiService.updateTeam(teamId, {
        team: {
          ...team,
          name: updates.name || team.name,
          captainId: updates.captainId || team.captainId
        },
        players: updates.players || team.players
      });

      await loadTournament(tournament.id);
    } catch (err) {
      console.error('Failed to update team:', err);
      setError('Failed to update team');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTeam = async (teamId: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.deleteTeam(teamId);
      await loadTournament(tournament!.id);
    } catch (err) {
      console.error('Failed to delete team:', err);
      setError('Failed to delete team');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePlayer = async (playerId: string, updates: Partial<Player>) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.updatePlayer(playerId, updates);
      if (tournament) {
        await loadTournament(tournament.id);
      }
    } catch (err) {
      console.error('Failed to update player:', err);
      setError('Failed to update player');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTeams = (): Team[] => {
    return tournament?.teams || [];
  };

  const getPlayers = (): Player[] => {
    return tournament?.teams.flatMap(team =>
      team.players.map(player => ({ ...player, teamId: team.id }))
    ) || [];
  };

  return (
    <TeamsContext.Provider value={{
      addTeam,
      updateTeam,
      deleteTeam,
      updatePlayer,
      getTeams,
      getPlayers
    }}>
      {children}
    </TeamsContext.Provider>
  );
};
