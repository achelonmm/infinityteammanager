import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Tournament } from '../types';
import { apiService, ApiError } from '../services/api';

const ACTIVE_TOURNAMENT_KEY = 'infinityActiveTournamentId';
const DEFAULT_TOURNAMENT_ID = 'main-tournament';

function getStoredTournamentId(): string | null {
  return localStorage.getItem(ACTIVE_TOURNAMENT_KEY);
}

function storeActiveTournamentId(id: string): void {
  localStorage.setItem(ACTIVE_TOURNAMENT_KEY, id);
}

interface TournamentDataContextType {
  tournament: Tournament | null;
  activeTournamentId: string | null;
  loading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setTournament: (tournament: Tournament | null) => void;
  loadTournament: (tournamentId: string) => Promise<void>;
  switchTournament: (tournamentId: string) => Promise<void>;
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
  const [activeTournamentId, setActiveTournamentId] = useState<string | null>(getStoredTournamentId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTournament = useCallback(async (tournamentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getTournament(tournamentId);
      setTournament(data);
      setActiveTournamentId(tournamentId);
      storeActiveTournamentId(tournamentId);
    } catch (err) {
      console.error('Failed to load tournament:', err);
      setError('Failed to load tournament');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const switchTournament = useCallback(async (tournamentId: string) => {
    setTournament(null);
    setActiveTournamentId(tournamentId);
    storeActiveTournamentId(tournamentId);
    await loadTournament(tournamentId);
  }, [loadTournament]);

  const initializeTournament = useCallback(async (tournamentId?: string) => {
    const idToLoad = tournamentId || getStoredTournamentId();

    setLoading(true);
    setError(null);
    try {
      if (idToLoad) {
        const existingTournament = await apiService.getTournament(idToLoad);
        setTournament(existingTournament);
        setActiveTournamentId(idToLoad);
        storeActiveTournamentId(idToLoad);
        return;
      }

      // No stored ID — try to find the active tournament from the server
      try {
        const active = await apiService.getActiveTournament();
        const fullTournament = await apiService.getTournament(active.id);
        setTournament(fullTournament);
        setActiveTournamentId(active.id);
        storeActiveTournamentId(active.id);
        return;
      } catch {
        // No active tournament found — create a default one
      }

      const newTournament = await apiService.createTournament({
        id: DEFAULT_TOURNAMENT_ID,
        name: 'Infinity Team Tournament',
      });
      const fullTournament = await apiService.getTournament(newTournament.id);
      setTournament(fullTournament);
      setActiveTournamentId(fullTournament.id);
      storeActiveTournamentId(fullTournament.id);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        // Stored tournament was deleted — try active tournament fallback
        try {
          const active = await apiService.getActiveTournament();
          const fullTournament = await apiService.getTournament(active.id);
          setTournament(fullTournament);
          setActiveTournamentId(active.id);
          storeActiveTournamentId(active.id);
          return;
        } catch {
          // No active tournament at all
          setTournament(null);
          setActiveTournamentId(null);
          localStorage.removeItem(ACTIVE_TOURNAMENT_KEY);
          setError(null);
          return;
        }
      }
      console.error('Failed to initialize tournament:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to server');
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
      activeTournamentId,
      loading,
      error,
      setLoading,
      setError,
      setTournament,
      loadTournament,
      switchTournament,
      initializeTournament
    }}>
      {children}
    </TournamentDataContext.Provider>
  );
};
