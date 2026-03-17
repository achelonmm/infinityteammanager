export interface Tournament {
  id: string;
  name: string;
  currentRound: number;
  status: 'active' | 'completed';
  teams: Team[];
  teamMatches: TeamMatch[];
  created_at?: string;
  updated_at?: string;
}

export interface TournamentSummary {
  id: string;
  name: string;
  currentRound: number;
  status: 'active' | 'completed';
  teamCount: number;
  matchCount: number;
  created_at?: string;
  updated_at?: string;
}

export interface Team {
  id: string;
  tournamentId: string;
  name: string;
  captainId: string | null;
  players: Player[];
  created_at?: string;
  updated_at?: string;
}

export interface Player {
  id: string;
  teamId: string;
  nickname: string;
  itsPin: string;
  army: string;
  isCaptain: boolean;
  isPainted: boolean;
  armyListLate: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TeamMatch {
  id: string;
  tournamentId: string;
  round: number;
  team1Id: string;
  team2Id: string;
  tableNumber: number; // Add table number
  isCompleted: boolean;
  individualMatches: IndividualMatch[];
  created_at?: string;
  updated_at?: string;
}

export interface IndividualMatch {
  id: string;
  teamMatchId: string;
  player1Id: string;
  player2Id: string;
  tournamentPoints1: number;
  tournamentPoints2: number;
  objectivePoints1: number;
  objectivePoints2: number;
  victoryPointsFor1: number;
  victoryPointsAgainst1: number;
  victoryPointsFor2: number;
  victoryPointsAgainst2: number;
  paintedBonus1: boolean;
  paintedBonus2: boolean;
  lateListPenalty1: boolean;
  lateListPenalty2: boolean;
  isCompleted: boolean;
  created_at?: string;
  updated_at?: string;
}