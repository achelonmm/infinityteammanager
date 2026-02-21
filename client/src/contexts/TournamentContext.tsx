import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { Team, Player, Tournament, TeamMatch, IndividualMatch } from '../types';
import { generatePairings as generatePairingsUtil } from '../utils/pairingUtils';
import { apiService, ApiError } from '../services/api';

interface TournamentContextType {
  tournament: Tournament | null;
  loading: boolean;
  error: string | null;
  pairings: { team1Id: string; team2Id: string; tableNumber: number }[];  // Add this line
  clearPairings: () => void;  // Add this line
  initializeTournament: (tournamentId: string) => Promise<void>;
  addTeam: (team: Omit<Team, 'id'>) => Promise<void>;
  updateTeam: (teamId: string, updates: Partial<Team>) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  updatePlayer: (playerId: string, updates: Partial<Player>) => Promise<void>;
  getTeams: () => Team[];
  getPlayers: () => Player[];
  generatePairings: () => Promise<void>;  // Changed this
  savePairings: (pairings: { team1Id: string; team2Id: string; tableNumber: number }[]) => Promise<void>;  // Changed this
  updatePairings: (newPairings: { team1Id: string; team2Id: string; tableNumber: number }[]) => void;
  getCurrentRoundMatches: () => TeamMatch[];
  deleteRoundMatches: (round: number) => Promise<void>;  // Add this line
  updateTeamMatch: (teamMatchId: string, updates: Partial<TeamMatch>) => Promise<void>;
  setIndividualPairings: (teamMatchId: string, pairings: { player1Id: string; player2Id: string }[]) => Promise<void>;
  updateIndividualMatch: (individualMatchId: string, updates: Partial<IndividualMatch>) => Promise<void>;
  canAdvanceToNextRound: boolean;
  advanceToNextRound: () => Promise<void>;
  getCurrentRound: () => number;
  getAllRounds: () => number[];
  getRoundMatches: (round: number) => TeamMatch[];
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
};

interface TournamentProviderProps {
  children: ReactNode;
}

// For now, we'll use a single tournament ID. Later we can make this dynamic for multi-tournament support
const CURRENT_TOURNAMENT_ID = 'main-tournament';

export const TournamentProvider: React.FC<TournamentProviderProps> = ({ children }) => {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pairings, setPairings] = useState<{ team1Id: string; team2Id: string; tableNumber: number }[]>([]);

  const clearPairings = () => {
    setPairings([]);
  };

  const updatePairings = (newPairings: { team1Id: string; team2Id: string; tableNumber: number }[]) => {
    setPairings(newPairings);
  };

  const initializeTournament = async (tournamentId: string = CURRENT_TOURNAMENT_ID) => {
    setLoading(true);
    setError(null);
    try {
      // Try to get existing tournament
      const existingTournament = await apiService.getTournament(tournamentId);
      setTournament(existingTournament);
    } catch (error) {
      // Only create a new tournament if the server returned 404 (not found)
      if (error instanceof ApiError && error.status === 404) {
        try {
          const newTournament = await apiService.createTournament({
            id: tournamentId,
            name: 'Infinity Team Tournament',
            currentRound: 1
          });
          setTournament({
            ...newTournament,
            teams: [],
            teamMatches: []
          });
        } catch (createError) {
          console.error('Failed to create tournament:', createError);
          setError('Failed to initialize tournament');
        }
      } else {
        // Surface real errors (network, server 500, etc.) to the user
        console.error('Failed to load tournament:', error);
        setError(error instanceof Error ? error.message : 'Failed to connect to server');
      }
    } finally {
      setLoading(false);
    }
  };

  // Initialize tournament on mount
  useEffect(() => {
    initializeTournament();
  }, []);

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
        captainId: captain?.id || null // Explicitly allow null
      };

      await apiService.createTeam({ team, players: playersWithIds });
      await loadTournament(tournament!.id);
    } catch (error) {
      console.error('Failed to add team:', error);
      setError('Failed to add team');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTeam = async (teamId: string, updates: Partial<Team>) => {
    if (!tournament) return;
  
    setLoading(true);
    setError(null);
  
    try {
      // Get the full team data including players
      const team = tournament.teams.find(t => t.id === teamId);
      if (!team) throw new Error('Team not found');
  
      // Send the data in the expected format
      await apiService.updateTeam(teamId, {
        team: {
          ...team,
          name: updates.name || team.name,
          captainId: updates.captainId || team.captainId
        },
        players: updates.players || team.players  // Use updated players if provided
      });
      
      // Reload the tournament to get fresh data
      await loadTournament(tournament.id);
    } catch (error) {
      console.error('Failed to update team:', error);
      setError('Failed to update team');
      throw error;
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
    } catch (error) {
      console.error('Failed to delete team:', error);
      setError('Failed to delete team');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadTournament = async (tournamentId: string) => {
    setLoading(true);
    setError(null);
  
    try {
      const data = await apiService.getTournament(tournamentId);
      setTournament(data);
    } catch (error) {
      console.error('Failed to load tournament:', error);
      setError('Failed to load tournament');
      throw error;
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
    } catch (error) {
      console.error('Failed to update player:', error);
      setError('Failed to update player');
      throw error;
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

  const generatePairings = async () => {
    if (!tournament) {
      throw new Error('No tournament initialized');
    }
  
    setLoading(true);
    setError(null);
  
    try {
      const teams = tournament.teams || [];

      if (teams.length < 2 || teams.length % 2 !== 0) {
        throw new Error('Need an even number of teams (at least 2) to generate pairings. Please ensure all teams are registered.');
      }
  
      const allMatches = tournament.teamMatches || [];

      const pairingsData = generatePairingsUtil(teams, tournament.currentRound, allMatches);

      setPairings(pairingsData);
    } catch (error) {
      console.error('Failed to generate pairings:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate pairings');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const savePairings = async (pairingsToSave: { team1Id: string; team2Id: string; tableNumber: number }[]) => {
    if (!tournament) return;
  
    setLoading(true);
    setError(null);
  
    try {
      const teamMatches = [];
  
      for (const pairing of pairingsToSave) {
        const teamMatch = await apiService.createTeamMatch({
          id: crypto.randomUUID(),
          tournamentId: tournament.id,
          round: tournament.currentRound,
          team1Id: pairing.team1Id,
          team2Id: pairing.team2Id,
          tableNumber: pairing.tableNumber,
          isCompleted: false
        });
        teamMatches.push(teamMatch);
      }
  
      await loadTournament(tournament.id);
      setPairings([]);
    } catch (error) {
      console.error('Failed to save pairings:', error);
      setError('Failed to save pairings');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getCurrentRoundMatches = (): TeamMatch[] => {
    if (!tournament?.teamMatches) return [];
    return tournament.teamMatches.filter(match => match.round === tournament.currentRound);
  };

  const getRoundMatches = (round: number): TeamMatch[] => {
    if (!tournament?.teamMatches) return [];
    return tournament.teamMatches.filter(match => match.round === round);
  };

  const updateTeamMatch = async (teamMatchId: string, updates: Partial<TeamMatch>) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.updateTeamMatch(teamMatchId, updates);
      await loadTournament(tournament!.id);
    } catch (error) {
      console.error('Failed to update team match:', error);
      setError('Failed to update team match');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const setIndividualPairings = async (teamMatchId: string, pairings: { player1Id: string; player2Id: string }[]) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.createIndividualMatches(teamMatchId, pairings);
      await loadTournament(tournament!.id);
    } catch (error) {
      console.error('Failed to set individual pairings:', error);
      setError('Failed to set individual pairings');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateIndividualMatch = async (individualMatchId: string, updates: Partial<IndividualMatch>) => {
    setLoading(true);
    setError(null);
    try {
      // Update the individual match
      await apiService.updateIndividualMatch(individualMatchId, updates);

      // Reload tournament to get fresh data
      if (tournament?.id) {
        const freshTournament = await apiService.getTournament(tournament.id);

        // Find the team match that contains this individual match
        const teamMatch = freshTournament.teamMatches?.find(tm =>
          tm.individualMatches?.some(im => im.id === individualMatchId)
        );

        if (teamMatch && teamMatch.individualMatches && teamMatch.individualMatches.length > 0) {
          // Check if ALL individual matches are completed
          const allCompleted = teamMatch.individualMatches.every(im => im.isCompleted);

          if (allCompleted && !teamMatch.isCompleted) {
            await apiService.updateTeamMatch(teamMatch.id, { isCompleted: true });
          }
        }

        // Final reload to get the updated team match status
        await loadTournament(tournament.id);
      }
    } catch (error) {
      console.error('Failed to update individual match:', error);
      setError('Failed to update individual match');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const canAdvanceToNextRound = useMemo(() => {
    if (!tournament) return false;
  
    const currentRoundMatches = tournament.teamMatches?.filter(m => m.round === tournament.currentRound) || [];
    
    if (currentRoundMatches.length === 0) return false;
  
    // Check if all team matches are completed
    const allTeamMatchesComplete = currentRoundMatches.every(tm => tm.isCompleted);
    
    // Check if all individual matches are completed
    const allIndividualMatchesComplete = currentRoundMatches.every(tm => {
      if (!tm.individualMatches || tm.individualMatches.length === 0) return false;
      return tm.individualMatches.every(im => im.isCompleted);
    });
  
    return allTeamMatchesComplete && allIndividualMatchesComplete;
  }, [tournament]);

  const advanceToNextRound = async () => {
    if (!tournament) throw new Error('No tournament initialized');
    if (!canAdvanceToNextRound) {
      throw new Error('Cannot advance to next round: current round is not complete');
    }
    
    setLoading(true);
    setError(null);
    try {
      await apiService.updateTournament(tournament.id, { currentRound: tournament.currentRound + 1 });
      await loadTournament(tournament!.id);
    } catch (error) {
      console.error('Failed to advance round:', error);
      setError('Failed to advance round');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getCurrentRound = () => tournament?.currentRound || 1;

  const getAllRounds = (): number[] => {
    if (!tournament?.teamMatches) return [tournament?.currentRound || 1];
    
    const rounds = new Set<number>();
    tournament.teamMatches.forEach(match => rounds.add(match.round));
    const roundArray = Array.from(rounds).sort((a, b) => a - b);
    
    if (!roundArray.includes(tournament.currentRound)) {
      roundArray.push(tournament.currentRound);
      roundArray.sort((a, b) => a - b);
    }
    
    return roundArray;
  };

  const deleteRoundMatches = async (round: number) => {
    if (!tournament) return;
  
    setLoading(true);
    setError(null);
  
    try {
      const roundMatches = tournament.teamMatches?.filter(m => m.round === round) || [];

      for (const match of roundMatches) {
        await apiService.deleteTeamMatch(match.id);
      }
  
      await loadTournament(tournament.id);
    } catch (error) {
      console.error('Failed to delete round matches:', error);
      setError('Failed to delete round matches');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <TournamentContext.Provider value={{
      tournament,
      loading,
      error,
      pairings,
      initializeTournament,
      addTeam,
      updateTeam,
      deleteTeam,
      updatePlayer,
      getTeams,
      getPlayers,
      generatePairings,
      savePairings,
      clearPairings,
      updatePairings,
      deleteRoundMatches,
      getCurrentRoundMatches,
      updateTeamMatch,
      setIndividualPairings,
      updateIndividualMatch,
      canAdvanceToNextRound,
      advanceToNextRound,
      getCurrentRound,
      getAllRounds,
      getRoundMatches
    }}>
      {children}
    </TournamentContext.Provider>
  );
};