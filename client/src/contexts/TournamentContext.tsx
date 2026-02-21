import React, { ReactNode } from 'react';
import { TournamentDataProvider, useTournamentData } from './TournamentDataContext';
import { TeamsProvider, useTeams } from './TeamsContext';
import { MatchesProvider, useMatches } from './MatchesContext';

export { useTournamentData } from './TournamentDataContext';
export { useTeams } from './TeamsContext';
export { useMatches } from './MatchesContext';

/**
 * Combined hook providing backward compatibility.
 * Prefer using the domain-specific hooks (useTournamentData, useTeams, useMatches)
 * for new code.
 */
export const useTournament = () => {
  const tournamentData = useTournamentData();
  const teams = useTeams();
  const matches = useMatches();

  return {
    tournament: tournamentData.tournament,
    loading: tournamentData.loading,
    error: tournamentData.error,
    initializeTournament: tournamentData.initializeTournament,
    ...teams,
    ...matches
  };
};

interface TournamentProviderProps {
  children: ReactNode;
}

export const TournamentProvider: React.FC<TournamentProviderProps> = ({ children }) => {
  return (
    <TournamentDataProvider>
      <TeamsProvider>
        <MatchesProvider>
          {children}
        </MatchesProvider>
      </TeamsProvider>
    </TournamentDataProvider>
  );
};
