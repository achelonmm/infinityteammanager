export interface Tournament {
  id: string;
  name: string;
  current_round: number;
  status: 'active' | 'completed';
  created_at?: string;
  updated_at?: string;
}

export interface TournamentWithCounts extends Tournament {
  team_count: number;
  match_count: number;
}

export interface Team {
  id: string;
  tournament_id: string;
  name: string;
  captain_id: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Player {
  id: string;
  team_id: string;
  nickname: string;
  its_pin: string;
  army: string;
  is_captain: number;
  is_painted: number;
  created_at?: string;
  updated_at?: string;
}

export interface TeamMatch {
  id: string;
  tournament_id: string;
  round: number;
  team1_id: string;
  team2_id: string;
  table_number: number;
  is_completed: number;
  created_at?: string;
  updated_at?: string;
}

export interface IndividualMatch {
  id: string;
  team_match_id: string;
  player1_id: string;
  player2_id: string;
  tournament_points1: number;
  tournament_points2: number;
  objective_points1: number;
  objective_points2: number;
  victory_points_for1: number;
  victory_points_against1: number;
  victory_points_for2: number;
  victory_points_against2: number;
  painted_bonus1: number;
  painted_bonus2: number;
  is_completed: number;
  created_at?: string;
  updated_at?: string;
}
