import { Team, Player, TeamMatch } from '../types';

export interface PlayerRanking {
  player: Player;
  team: Team;
  tournamentPoints: number; // Without painted bonus
  objectivePoints: number;
  objectivePointsAgainst: number; // Add this
  objectivePointsDifference: number; // Add this
  victoryPointsFor: number;
  victoryPointsAgainst: number;
  victoryPointsDifference: number;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
}

export interface TeamRanking {
  team: Team;
  tournamentPoints: number; // Including painted bonus
  objectivePoints: number;
  objectivePointsAgainst: number; // Add this
  objectivePointsDifference: number; // Add this
  victoryPointsFor: number;
  victoryPointsAgainst: number;
  victoryPointsDifference: number;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  paintedBonus: number; // Total painted bonuses earned
}

// Calculate individual player points (excluding painted bonus)
export const calculateIndividualTournamentPoints = (
  objectivePoints1: number,
  objectivePoints2: number,
  isPlayer1: boolean
): number => {
  let points = 0;
  
  // Base points from victory/tie/defeat
  if (objectivePoints1 > objectivePoints2) {
    points = isPlayer1 ? 4 : 0; // Victory vs Defeat
  } else if (objectivePoints1 < objectivePoints2) {
    points = isPlayer1 ? 0 : 4; // Defeat vs Victory
  } else {
    points = 2; // Tie
  }

  // Offensive Bonus (5+ objective points)
  const playerObjectivePoints = isPlayer1 ? objectivePoints1 : objectivePoints2;
  if (playerObjectivePoints >= 5) {
    points += 1;
  }

  // Defensive Bonus (losing by 2 or less objective points)
  const difference = Math.abs(objectivePoints1 - objectivePoints2);
  const isLoser = (isPlayer1 && objectivePoints1 < objectivePoints2) || 
                  (!isPlayer1 && objectivePoints2 < objectivePoints1);
  if (isLoser && difference <= 2) {
    points += 1;
  }

  return points;
};

// Calculate team tournament points (including painted bonus and late list penalty)
export const calculateTeamTournamentPoints = (
  objectivePoints1: number,
  objectivePoints2: number,
  paintedBonus1: boolean,
  paintedBonus2: boolean,
  lateListPenalty1: boolean,
  lateListPenalty2: boolean,
  isPlayer1: boolean
): number => {
  // Start with individual points
  let points = calculateIndividualTournamentPoints(objectivePoints1, objectivePoints2, isPlayer1);

  // Add painted army bonus
  const hasPaintedBonus = isPlayer1 ? paintedBonus1 : paintedBonus2;
  if (hasPaintedBonus) {
    points += 1;
  }

  // Apply late list penalty
  const hasLateListPenalty = isPlayer1 ? lateListPenalty1 : lateListPenalty2;
  if (hasLateListPenalty) {
    points -= 1;
  }

  return points;
};

export const calculatePlayerRankings = (teams: Team[], allMatches: TeamMatch[]): PlayerRanking[] => {
  const playerStats = new Map<string, {
    player: Player;
    team: Team;
    tournamentPoints: number;
    objectivePoints: number;
    objectivePointsAgainst: number;
    victoryPointsFor: number;
    victoryPointsAgainst: number;
    matchesPlayed: number;
    wins: number;
    draws: number;
    losses: number;
  }>();

  // Initialize stats for all players
  teams.forEach(team => {
    team.players.forEach(player => {
      playerStats.set(player.id, {
        player,
        team,
        tournamentPoints: 0,
        objectivePoints: 0,
        objectivePointsAgainst: 0,
        victoryPointsFor: 0,
        victoryPointsAgainst: 0,
        matchesPlayed: 0,
        wins: 0,
        draws: 0,
        losses: 0
      });
    });
  });

  // Process completed matches
  allMatches.forEach(teamMatch => {
    if (teamMatch.isCompleted && teamMatch.individualMatches) {
      teamMatch.individualMatches.forEach((match) => {
        if (match.isCompleted) {
          const player1Stats = playerStats.get(match.player1Id);
          const player2Stats = playerStats.get(match.player2Id);

          if (player1Stats && player2Stats) {
            // Calculate individual tournament points (no painted bonus)
            const player1Points = calculateIndividualTournamentPoints(
              match.objectivePoints1, 
              match.objectivePoints2, 
              true
            );
            const player2Points = calculateIndividualTournamentPoints(
              match.objectivePoints1, 
              match.objectivePoints2, 
              false
            );

            // Update Player 1 stats
            player1Stats.tournamentPoints += player1Points;
            player1Stats.objectivePoints += match.objectivePoints1;
            player1Stats.objectivePointsAgainst += match.objectivePoints2; // Enemy's objective points
            player1Stats.victoryPointsFor += match.victoryPointsFor1;
            player1Stats.victoryPointsAgainst += match.victoryPointsFor2; // Enemy's victory points
            player1Stats.matchesPlayed += 1;

            // Update Player 2 stats
            player2Stats.tournamentPoints += player2Points;
            player2Stats.objectivePoints += match.objectivePoints2;
            player2Stats.objectivePointsAgainst += match.objectivePoints1; // Enemy's objective points
            player2Stats.victoryPointsFor += match.victoryPointsFor2;
            player2Stats.victoryPointsAgainst += match.victoryPointsFor1; // Enemy's victory points
            player2Stats.matchesPlayed += 1;

            // Update wins/draws/losses
            if (match.objectivePoints1 > match.objectivePoints2) {
              player1Stats.wins += 1;
              player2Stats.losses += 1;
            } else if (match.objectivePoints1 < match.objectivePoints2) {
              player1Stats.losses += 1;
              player2Stats.wins += 1;
            } else {
              player1Stats.draws += 1;
              player2Stats.draws += 1;
            }
          }
        }
      });
    }
  });

  // Convert to rankings format
  return Array.from(playerStats.values()).map(stats => ({
    ...stats,
    objectivePointsDifference: stats.objectivePoints - stats.objectivePointsAgainst,
    victoryPointsDifference: stats.victoryPointsFor - stats.victoryPointsAgainst
  }));
};

export const calculateTeamRankings = (teams: Team[], allMatches: TeamMatch[]): TeamRanking[] => {
  const teamStats = new Map<string, {
    team: Team;
    tournamentPoints: number;
    objectivePoints: number;
    objectivePointsAgainst: number;
    victoryPointsFor: number;
    victoryPointsAgainst: number;
    matchesPlayed: number;
    wins: number;
    draws: number;
    losses: number;
    paintedBonus: number;
  }>();

  // Initialize stats for all teams
  teams.forEach(team => {
    teamStats.set(team.id, {
      team,
      tournamentPoints: 0,
      objectivePoints: 0,
      objectivePointsAgainst: 0,
      victoryPointsFor: 0,
      victoryPointsAgainst: 0,
      matchesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      paintedBonus: 0
    });
  });

  // Process completed matches
  allMatches.forEach(teamMatch => {
    if (teamMatch.isCompleted && teamMatch.individualMatches) {
      const team1Stats = teamStats.get(teamMatch.team1Id);
      const team2Stats = teamStats.get(teamMatch.team2Id);

      if (team1Stats && team2Stats) {
        let team1TotalPoints = 0;
        let team2TotalPoints = 0;
        let team1TotalObjective = 0;
        let team2TotalObjective = 0;
        let team1TotalVictoryFor = 0;
        let team2TotalVictoryFor = 0;

        teamMatch.individualMatches.forEach((match) => {
          if (match.isCompleted) {
            // Calculate team tournament points (including painted bonus and late list penalty)
            const player1TeamPoints = calculateTeamTournamentPoints(
              match.objectivePoints1,
              match.objectivePoints2,
              match.paintedBonus1,
              match.paintedBonus2,
              match.lateListPenalty1,
              match.lateListPenalty2,
              true
            );
            const player2TeamPoints = calculateTeamTournamentPoints(
              match.objectivePoints1,
              match.objectivePoints2,
              match.paintedBonus1,
              match.paintedBonus2,
              match.lateListPenalty1,
              match.lateListPenalty2,
              false
            );

            team1TotalPoints += player1TeamPoints;
            team2TotalPoints += player2TeamPoints;
            team1TotalObjective += match.objectivePoints1;
            team2TotalObjective += match.objectivePoints2;
            team1TotalVictoryFor += match.victoryPointsFor1;
            team2TotalVictoryFor += match.victoryPointsFor2;

            // Count painted bonuses
            if (match.paintedBonus1) team1Stats.paintedBonus += 1;
            if (match.paintedBonus2) team2Stats.paintedBonus += 1;
          }
        });

        // Update team stats
        team1Stats.tournamentPoints += team1TotalPoints;
        team1Stats.objectivePoints += team1TotalObjective;
        team1Stats.objectivePointsAgainst += team2TotalObjective; // Enemy's objective points
        team1Stats.victoryPointsFor += team1TotalVictoryFor;
        team1Stats.victoryPointsAgainst += team2TotalVictoryFor; // Enemy's victory points
        team1Stats.matchesPlayed += 1;

        team2Stats.tournamentPoints += team2TotalPoints;
        team2Stats.objectivePoints += team2TotalObjective;
        team2Stats.objectivePointsAgainst += team1TotalObjective; // Enemy's objective points
        team2Stats.victoryPointsFor += team2TotalVictoryFor;
        team2Stats.victoryPointsAgainst += team1TotalVictoryFor; // Enemy's victory points
        team2Stats.matchesPlayed += 1;

        // Sum individual match W-D-L for each team
        teamMatch.individualMatches.forEach((match) => {
          if (match.isCompleted) {
            if (match.objectivePoints1 > match.objectivePoints2) {
              team1Stats.wins += 1;
              team2Stats.losses += 1;
            } else if (match.objectivePoints1 < match.objectivePoints2) {
              team1Stats.losses += 1;
              team2Stats.wins += 1;
            } else {
              team1Stats.draws += 1;
              team2Stats.draws += 1;
            }
          }
        });
      }
    }
  });

  // Convert to rankings format
  return Array.from(teamStats.values()).map(stats => ({
    ...stats,
    objectivePointsDifference: stats.objectivePoints - stats.objectivePointsAgainst,
    victoryPointsDifference: stats.victoryPointsFor - stats.victoryPointsAgainst
  }));
};

export const sortPlayerRankings = (rankings: PlayerRanking[]): PlayerRanking[] => {
  return [...rankings].sort((a, b) => {
    // 1. Tournament Points (higher is better) - WITHOUT painted bonus
    if (a.tournamentPoints !== b.tournamentPoints) {
      return b.tournamentPoints - a.tournamentPoints;
    }
    
    // 2. Objective Points (higher is better)
    if (a.objectivePoints !== b.objectivePoints) {
      return b.objectivePoints - a.objectivePoints;
    }
    
    // 3. Victory Points Difference (higher is better)
    if (a.victoryPointsDifference !== b.victoryPointsDifference) {
      return b.victoryPointsDifference - a.victoryPointsDifference;
    }
    
    // 4. Victory Points For (higher is better)
    if (a.victoryPointsFor !== b.victoryPointsFor) {
      return b.victoryPointsFor - a.victoryPointsFor;
    }
    
    // 5. Alphabetical by player name
    return a.player.nickname.localeCompare(b.player.nickname);
  });
};

export const sortTeamRankings = (rankings: TeamRanking[]): TeamRanking[] => {
  return [...rankings].sort((a, b) => {
    // 1. Tournament Points (higher is better) - INCLUDING painted bonus
    if (a.tournamentPoints !== b.tournamentPoints) {
      return b.tournamentPoints - a.tournamentPoints;
    }
    
    // 2. Objective Points (higher is better)
    if (a.objectivePoints !== b.objectivePoints) {
      return b.objectivePoints - a.objectivePoints;
    }
    
    // 3. Victory Points Difference (higher is better)
    if (a.victoryPointsDifference !== b.victoryPointsDifference) {
      return b.victoryPointsDifference - a.victoryPointsDifference;
    }
    
    // 4. Victory Points For (higher is better)
    if (a.victoryPointsFor !== b.victoryPointsFor) {
      return b.victoryPointsFor - a.victoryPointsFor;
    }
    
    // 5. Alphabetical by team name
    return a.team.name.localeCompare(b.team.name);
  });
};