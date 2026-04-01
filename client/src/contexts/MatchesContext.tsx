import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { TeamMatch, IndividualMatch } from '../types';
import { generatePairings as generatePairingsUtil } from '../utils/pairingUtils';
import { apiService } from '../services/api';
import { useTournamentData } from './TournamentDataContext';

interface MatchesContextType {
  pairings: { team1Id: string; team2Id: string; tableNumber: number }[];
  clearPairings: () => void;
  updatePairings: (newPairings: { team1Id: string; team2Id: string; tableNumber: number }[]) => void;
  generatePairings: () => Promise<void>;
  savePairings: (pairings: { team1Id: string; team2Id: string; tableNumber: number }[]) => Promise<void>;
  getCurrentRoundMatches: () => TeamMatch[];
  getRoundMatches: (round: number) => TeamMatch[];
  deleteRoundMatches: (round: number) => Promise<void>;
  updateTeamMatch: (teamMatchId: string, updates: Partial<TeamMatch>) => Promise<void>;
  setIndividualPairings: (teamMatchId: string, pairings: { player1Id: string; player2Id: string }[]) => Promise<void>;
  updateIndividualMatch: (individualMatchId: string, updates: Partial<IndividualMatch>) => Promise<void>;
  submitPlayerResult: (matchId: string, itsPin: string, results: Partial<IndividualMatch>) => Promise<void>;
  canAdvanceToNextRound: boolean;
  advanceToNextRound: () => Promise<void>;
  getCurrentRound: () => number;
  getAllRounds: () => number[];
}

const MatchesContext = createContext<MatchesContextType | undefined>(undefined);

export const useMatches = () => {
  const context = useContext(MatchesContext);
  if (!context) {
    throw new Error('useMatches must be used within a MatchesProvider');
  }
  return context;
};

interface MatchesProviderProps {
  children: ReactNode;
}

export const MatchesProvider: React.FC<MatchesProviderProps> = ({ children }) => {
  const { tournament, setLoading, setError, setTournament, loadTournament } = useTournamentData();
  const [pairings, setPairings] = useState<{ team1Id: string; team2Id: string; tableNumber: number }[]>([]);

  const clearPairings = () => setPairings([]);

  const updatePairings = (newPairings: { team1Id: string; team2Id: string; tableNumber: number }[]) => {
    setPairings(newPairings);
  };

  const generatePairings = async () => {
    if (!tournament) throw new Error('No tournament initialized');

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
    } catch (err) {
      console.error('Failed to generate pairings:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate pairings');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const savePairings = async (pairingsToSave: { team1Id: string; team2Id: string; tableNumber: number }[]) => {
    if (!tournament) return;

    setLoading(true);
    setError(null);
    try {
      const matches = pairingsToSave.map(pairing => ({
        id: crypto.randomUUID(),
        tournamentId: tournament.id,
        round: tournament.currentRound,
        team1Id: pairing.team1Id,
        team2Id: pairing.team2Id,
        tableNumber: pairing.tableNumber,
        isCompleted: false
      }));

      await apiService.batchCreateTeamMatches(matches);
      await loadTournament(tournament.id);
      setPairings([]);
    } catch (err) {
      console.error('Failed to save pairings:', err);
      setError('Failed to save pairings');
      throw err;
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

  const deleteRoundMatches = async (round: number) => {
    if (!tournament) return;

    setLoading(true);
    setError(null);
    try {
      await apiService.batchDeleteRoundMatches(tournament.id, round);
      await loadTournament(tournament.id);
    } catch (err) {
      console.error('Failed to delete round matches:', err);
      setError('Failed to delete round matches');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTeamMatch = async (teamMatchId: string, updates: Partial<TeamMatch>) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.updateTeamMatch(teamMatchId, updates);
      await loadTournament(tournament!.id);
    } catch (err) {
      console.error('Failed to update team match:', err);
      setError('Failed to update team match');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const setIndividualPairings = async (teamMatchId: string, matchPairings: { player1Id: string; player2Id: string }[]) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.createIndividualMatches(teamMatchId, matchPairings);
      await loadTournament(tournament!.id);
    } catch (err) {
      console.error('Failed to set individual pairings:', err);
      setError('Failed to set individual pairings');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateIndividualMatch = async (individualMatchId: string, updates: Partial<IndividualMatch>) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.updateIndividualMatch(individualMatchId, updates);

      if (tournament?.id) {
        const freshTournament = await apiService.getTournament(tournament.id);

        const teamMatch = freshTournament.teamMatches?.find(tm =>
          tm.individualMatches?.some(im => im.id === individualMatchId)
        );

        if (teamMatch && teamMatch.individualMatches && teamMatch.individualMatches.length > 0) {
          const allCompleted = teamMatch.individualMatches.every(im => im.isCompleted);

          if (allCompleted && !teamMatch.isCompleted) {
            await apiService.updateTeamMatch(teamMatch.id, { isCompleted: true });
            const updatedTournament = await apiService.getTournament(tournament.id);
            setTournament(updatedTournament);
            return;
          }
        }

        setTournament(freshTournament);
      }
    } catch (err) {
      console.error('Failed to update individual match:', err);
      setError('Failed to update individual match');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const submitPlayerResult = async (matchId: string, itsPin: string, results: Partial<IndividualMatch>) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.submitPlayerResult(matchId, { itsPin, ...results });

      if (tournament?.id) {
        const freshTournament = await apiService.getTournament(tournament.id);
        setTournament(freshTournament);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit result');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const canAdvanceToNextRound = useMemo(() => {
    if (!tournament) return false;

    const currentRoundMatches = tournament.teamMatches?.filter(m => m.round === tournament.currentRound) || [];
    if (currentRoundMatches.length === 0) return false;

    const allTeamMatchesComplete = currentRoundMatches.every(tm => tm.isCompleted);
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
      await loadTournament(tournament.id);
    } catch (err) {
      console.error('Failed to advance round:', err);
      setError('Failed to advance round');
      throw err;
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

  return (
    <MatchesContext.Provider value={{
      pairings,
      clearPairings,
      updatePairings,
      generatePairings,
      savePairings,
      getCurrentRoundMatches,
      getRoundMatches,
      deleteRoundMatches,
      updateTeamMatch,
      setIndividualPairings,
      updateIndividualMatch,
      submitPlayerResult,
      canAdvanceToNextRound,
      advanceToNextRound,
      getCurrentRound,
      getAllRounds
    }}>
      {children}
    </MatchesContext.Provider>
  );
};
