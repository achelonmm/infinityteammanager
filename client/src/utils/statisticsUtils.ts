import { Team, TeamMatch, Player } from '../types';

export interface ArmyDistribution {
  army: string;
  count: number;
  percentage: number;
}

export interface PlayerPerformance {
  player: Player;
  winRate: number;
  averageObjectivePoints: number;
  killRatio: number;
  gamesPlayed: number;
  totalTournamentPoints: number;
}

export interface ArmyPerformance {
  army: string;
  gamesPlayed: number;
  wins: number;
  winRate: number;
  averageObjectivePoints: number;
  averageKillRatio: number;
  players: string[];
}

export interface TournamentStats {
  totalPlayers: number;
  totalTeams: number;
  totalMatches: number;
  completedMatches: number;
  totalRounds: number;
  currentRound: number;
  armyDistribution: ArmyDistribution[];
  topPerformers: PlayerPerformance[];
  bottomPerformers: PlayerPerformance[];
  armyPerformance: ArmyPerformance[];
  mostKills: PlayerPerformance | null;
  leastDeaths: PlayerPerformance | null;
  highestObjectiveAverage: PlayerPerformance | null;
}

export const calculateArmyDistribution = (players: Player[]): ArmyDistribution[] => {
  const armyCounts = players.reduce((acc, player) => {
    acc[player.army] = (acc[player.army] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = players.length;
  
  return Object.entries(armyCounts)
    .map(([army, count]) => ({
      army,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }))
    .sort((a, b) => b.count - a.count);
};

export const calculatePlayerPerformance = (
  players: Player[],
  teamMatches: TeamMatch[]
): PlayerPerformance[] => {
  return players.map(player => {
    // Find all individual matches for this player
    const playerMatches = teamMatches.flatMap(teamMatch =>
      teamMatch.individualMatches.filter(indMatch =>
        (indMatch.player1Id === player.id || indMatch.player2Id === player.id) && indMatch.isCompleted
      )
    );

    let wins = 0;
    let totalObjectivePoints = 0;
    let totalVictoryPointsFor = 0;
    let totalVictoryPointsAgainst = 0;
    let totalTournamentPoints = 0;

    playerMatches.forEach(match => {
      const isPlayer1 = match.player1Id === player.id;
      const playerObjPoints = isPlayer1 ? match.objectivePoints1 : match.objectivePoints2;
      const opponentObjPoints = isPlayer1 ? match.objectivePoints2 : match.objectivePoints1;
      
      if (playerObjPoints > opponentObjPoints) {
        wins++;
      }

      totalObjectivePoints += playerObjPoints;
      totalVictoryPointsFor += isPlayer1 ? match.victoryPointsFor1 : match.victoryPointsFor2;
      totalVictoryPointsAgainst += isPlayer1 ? match.victoryPointsAgainst1 : match.victoryPointsAgainst2;
      totalTournamentPoints += isPlayer1 ? match.tournamentPoints1 : match.tournamentPoints2;
    });

    const gamesPlayed = playerMatches.length;
    const winRate = gamesPlayed > 0 ? (wins / gamesPlayed) * 100 : 0;
    const averageObjectivePoints = gamesPlayed > 0 ? totalObjectivePoints / gamesPlayed : 0;
    const killRatio = totalVictoryPointsAgainst > 0 ? totalVictoryPointsFor / totalVictoryPointsAgainst : 
                     totalVictoryPointsFor > 0 ? totalVictoryPointsFor : 0;

    return {
      player,
      winRate,
      averageObjectivePoints,
      killRatio,
      gamesPlayed,
      totalTournamentPoints
    };
  }).filter(performance => performance.gamesPlayed > 0);
};

export const calculateArmyPerformance = (
  players: Player[],
  teamMatches: TeamMatch[]
): ArmyPerformance[] => {
  const playerPerformances = calculatePlayerPerformance(players, teamMatches);
  const armyStats = new Map<string, {
    gamesPlayed: number;
    wins: number;
    totalObjectivePoints: number;
    totalKillRatio: number;
    players: Set<string>;
  }>();

  playerPerformances.forEach(performance => {
    const army = performance.player.army;
    const current = armyStats.get(army) || {
      gamesPlayed: 0,
      wins: 0,
      totalObjectivePoints: 0,
      totalKillRatio: 0,
      players: new Set()
    };

    current.gamesPlayed += performance.gamesPlayed;
    current.wins += Math.round((performance.winRate / 100) * performance.gamesPlayed);
    current.totalObjectivePoints += performance.averageObjectivePoints * performance.gamesPlayed;
    current.totalKillRatio += performance.killRatio;
    current.players.add(performance.player.nickname);

    armyStats.set(army, current);
  });

  return Array.from(armyStats.entries()).map(([army, stats]) => ({
    army,
    gamesPlayed: stats.gamesPlayed,
    wins: stats.wins,
    winRate: stats.gamesPlayed > 0 ? (stats.wins / stats.gamesPlayed) * 100 : 0,
    averageObjectivePoints: stats.gamesPlayed > 0 ? stats.totalObjectivePoints / stats.gamesPlayed : 0,
    averageKillRatio: stats.players.size > 0 ? stats.totalKillRatio / stats.players.size : 0,
    players: Array.from(stats.players)
  })).sort((a, b) => b.winRate - a.winRate);
};

export const calculateTournamentStats = (
  teams: Team[],
  players: Player[],
  teamMatches: TeamMatch[],
  currentRound: number
): TournamentStats => {
  const playerPerformances = calculatePlayerPerformance(players, teamMatches);
  const armyDistribution = calculateArmyDistribution(players);
  const armyPerformance = calculateArmyPerformance(players, teamMatches);

  const totalMatches = teamMatches.flatMap(tm => tm.individualMatches).length;
  const completedMatches = teamMatches.flatMap(tm => tm.individualMatches).filter(im => im.isCompleted).length;
  
  const rounds = new Set(teamMatches.map(tm => tm.round));
  const totalRounds = rounds.size;

  // Sort players for top/bottom performers
  const sortedByWinRate = [...playerPerformances].sort((a, b) => b.winRate - a.winRate);
  const sortedByKillRatio = [...playerPerformances].sort((a, b) => b.killRatio - a.killRatio);
  const sortedByObjective = [...playerPerformances].sort((a, b) => b.averageObjectivePoints - a.averageObjectivePoints);

  // Calculate specific achievements
  const mostKills = sortedByKillRatio.length > 0 ? sortedByKillRatio[0] : null;
  const leastDeaths = [...playerPerformances]
    .filter(p => p.gamesPlayed > 0)
    .sort((a, b) => a.killRatio - b.killRatio)[0] || null;
  const highestObjectiveAverage = sortedByObjective.length > 0 ? sortedByObjective[0] : null;

  return {
    totalPlayers: players.length,
    totalTeams: teams.length,
    totalMatches,
    completedMatches,
    totalRounds,
    currentRound,
    armyDistribution,
    topPerformers: sortedByWinRate.slice(0, 5),
    bottomPerformers: sortedByWinRate.slice(-5).reverse(),
    armyPerformance,
    mostKills,
    leastDeaths,
    highestObjectiveAverage
  };
};