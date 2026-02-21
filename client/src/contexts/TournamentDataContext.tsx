import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Tournament } from '../types';
import { apiService, ApiError } from '../services/api';

const CURRENT_TOURNAMENT_ID = 'main-tournament';

interface TournamentDataContextType {
  tournament: Tournament | null;
  loading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setTournament: (tournament: Tournament | null) => void;
  loadTournament: (tournamentId: string) => Promise<void>;
  initializeTournament: (tournamentId?: string) => Promise<void>;
}

const TournamentDataContext = createContext<TournamentDataContextType | undefined>(undefined);

export const useTournamentData = () => {
  const context = useContext(TournamentDataContext);
  if (!context) {
    throw new Error('useTournamentData must be used within a TournamentDataProvider');
  }
  return context;
};

interface TournamentDataProviderProps {
  children: ReactNode;
}

export const TournamentDataProvider: React.FC<TournamentDataProviderProps> = ({ children }) => {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTournament = useCallback(async (tournamentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getTournament(tournamentId);
      setTournament(data);
    } catch (err) {
      console.error('Failed to load tournament:', err);
      setError('Failed to load tournament');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const initializeTournament = useCallback(async (tournamentId: string = CURRENT_TOURNAMENT_ID) => {
    setLoading(true);
    setError(null);
    try {
      const existingTournament = await apiService.getTournament(tournamentId);
      setTournament(existingTournament);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
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
        console.error('Failed to load tournament:', err);
        setError(err instanceof Error ? err.message : 'Failed to connect to server');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeTournament();
  }, [initializeTournament]);

  return (
    <TournamentDataContext.Provider value={{
      tournament,
      loading,
      error,
      setLoading,
      setError,
      setTournament,
      loadTournament,
      initializeTournament
    }}>
      {children}
    </TournamentDataContext.Provider>
  );
};
