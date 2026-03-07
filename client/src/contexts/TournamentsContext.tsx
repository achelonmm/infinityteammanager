import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { TournamentSummary } from '../types';
import { apiService, ApiError } from '../services/api';
import { useTournamentData } from './TournamentDataContext';

interface TournamentsContextType {
  tournaments: TournamentSummary[];
  loading: boolean;
  error: string | null;
  loadTournaments: () => Promise<void>;
  createTournament: (name: string) => Promise<TournamentSummary>;
  updateTournament: (id: string, updates: { name: string }) => Promise<void>;
  deleteTournament: (id: string) => Promise<void>;
  activateTournament: (id: string) => Promise<void>;
  completeTournament: (id: string) => Promise<void>;
}

const TournamentsContext = createContext<TournamentsContextType | undefined>(undefined);

export const useTournaments = () => {
  const context = useContext(TournamentsContext);
  if (!context) {
    throw new Error('useTournaments must be used within a TournamentsProvider');
  }
  return context;
};

interface TournamentsProviderProps {
  children: ReactNode;
}

export const TournamentsProvider: React.FC<TournamentsProviderProps> = ({ children }) => {
  const [tournaments, setTournaments] = useState<TournamentSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { switchTournament, activeTournamentId } = useTournamentData();

  const loadTournaments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getTournaments();
      setTournaments(data);
    } catch (err) {
      console.error('Failed to load tournaments:', err);
      setError('Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTournament = useCallback(async (name: string): Promise<TournamentSummary> => {
    const id = `tournament_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const created = await apiService.createTournament({ id, name });
    await loadTournaments();
    return {
      id: created.id,
      name: created.name,
      currentRound: created.currentRound,
      status: created.status,
      teamCount: 0,
      matchCount: 0,
      created_at: created.created_at,
      updated_at: created.updated_at,
    };
  }, [loadTournaments]);

  const updateTournament = useCallback(async (id: string, updates: { name: string }) => {
    await apiService.updateTournament(id, updates);
    await loadTournaments();
  }, [loadTournaments]);

  const deleteTournament = useCallback(async (id: string) => {
    await apiService.deleteTournament(id);
    await loadTournaments();

    // If we deleted the active tournament, switch to the next active one
    if (id === activeTournamentId) {
      const remaining = tournaments.filter(t => t.id !== id);
      const nextActive = remaining.find(t => t.status === 'active') || remaining[0];
      if (nextActive) {
        await switchTournament(nextActive.id);
      }
    }
  }, [loadTournaments, activeTournamentId, tournaments, switchTournament]);

  const activateTournament = useCallback(async (id: string) => {
    await apiService.activateTournament(id);
    await loadTournaments();
    await switchTournament(id);
  }, [loadTournaments, switchTournament]);

  const completeTournament = useCallback(async (id: string) => {
    await apiService.completeTournament(id);
    await loadTournaments();
  }, [loadTournaments]);

  useEffect(() => {
    loadTournaments();
  }, [loadTournaments]);

  return (
    <TournamentsContext.Provider value={{
      tournaments,
      loading,
      error,
      loadTournaments,
      createTournament,
      updateTournament,
      deleteTournament,
      activateTournament,
      completeTournament,
    }}>
      {children}
    </TournamentsContext.Provider>
  );
};
