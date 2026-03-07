import { Team, TeamMatch } from '../types';

interface TeamWithStats {
  team: Team;
  tournamentPoints: number;
  objectivePoints: number;
  victoryPointsDifference: number;
  previousOpponents: Set<string>;
  previousTables: Set<number>;
}

// Fisher-Yates shuffle algorithm for random array shuffling
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Get team history from previous rounds
const getTeamHistory = (team: Team, allMatches: TeamMatch[]): { opponents: Set<string>, tables: Set<number> } => {
  const opponents = new Set<string>();
  const tables = new Set<number>();

  allMatches.forEach(match => {
    if (match.team1Id === team.id) {
      opponents.add(match.team2Id);
      tables.add(match.tableNumber);
    } else if (match.team2Id === team.id) {
      opponents.add(match.team1Id);
      tables.add(match.tableNumber);
    }
  });

  return { opponents, tables };
};

// Calculate team stats for pairing
const calculateTeamStats = (teams: Team[], allMatches: TeamMatch[]): TeamWithStats[] => {
  return teams.map(team => {
    let tournamentPoints = 0;
    let objectivePoints = 0;
    let victoryPointsFor = 0;
    let victoryPointsAgainst = 0;

    // Calculate stats from completed matches
    allMatches.forEach(match => {
      if (match.isCompleted && match.individualMatches) {
        const isTeam1 = match.team1Id === team.id;
        const isTeam2 = match.team2Id === team.id;

        if (isTeam1 || isTeam2) {
          match.individualMatches.forEach(indMatch => {
            if (indMatch.isCompleted) {
              if (isTeam1) {
                tournamentPoints += indMatch.tournamentPoints1;
                objectivePoints += indMatch.objectivePoints1;
                victoryPointsFor += indMatch.victoryPointsFor1;
                victoryPointsAgainst += indMatch.victoryPointsAgainst1;
              } else {
                tournamentPoints += indMatch.tournamentPoints2;
                objectivePoints += indMatch.objectivePoints2;
                victoryPointsFor += indMatch.victoryPointsFor2;
                victoryPointsAgainst += indMatch.victoryPointsAgainst2;
              }
            }
          });
        }
      }
    });

    const history = getTeamHistory(team, allMatches);

    return {
      team,
      tournamentPoints,
      objectivePoints,
      victoryPointsDifference: victoryPointsFor - victoryPointsAgainst,
      previousOpponents: history.opponents,
      previousTables: history.tables
    };
  });
};

// Find best table for a pairing
const findBestTable = (
  usedTables: Set<number>,
  team1Tables: Set<number>,
  team2Tables: Set<number>,
  maxTables: number = 10
): number => {
  // Try to find a table neither team has used
  for (let i = 1; i <= maxTables; i++) {
    if (!usedTables.has(i) && !team1Tables.has(i) && !team2Tables.has(i)) {
      return i;
    }
  }

  // If not possible, find a table only one team has used
  for (let i = 1; i <= maxTables; i++) {
    if (!usedTables.has(i) && !(team1Tables.has(i) && team2Tables.has(i))) {
      return i;
    }
  }

  // Last resort: use any available table
  for (let i = 1; i <= maxTables; i++) {
    if (!usedTables.has(i)) {
      return i;
    }
  }

  // If all tables are used, start from 1
  return 1;
};

// Generate random pairings for Round 1
const generateRandomPairings = (
  teams: Team[]
): { team1Id: string; team2Id: string; tableNumber: number }[] => {
  const shuffledTeams = shuffleArray(teams);
  const pairings: { team1Id: string; team2Id: string; tableNumber: number }[] = [];
  const usedTables = new Set<number>();

  for (let i = 0; i < shuffledTeams.length; i += 2) {
    // Find an unused table
    let tableNumber = 1;
    for (let t = 1; t <= 10; t++) {
      if (!usedTables.has(t)) {
        tableNumber = t;
        break;
      }
    }
    
    pairings.push({
      team1Id: shuffledTeams[i].id,
      team2Id: shuffledTeams[i + 1].id,
      tableNumber
    });
    
    usedTables.add(tableNumber);
  }

  return pairings;
};

// Build a lookup from team id to its previous opponents set
const buildOpponentLookup = (teamsWithStats: TeamWithStats[]): Map<string, Set<string>> => {
  const lookup = new Map<string, Set<string>>();
  teamsWithStats.forEach((t) => lookup.set(t.team.id, t.previousOpponents));
  return lookup;
};

// Resolve rematches by swapping opponents between pairings
const resolveRematches = (
  pairings: { team1Id: string; team2Id: string; tableNumber: number }[],
  opponentLookup: Map<string, Set<string>>
): { team1Id: string; team2Id: string; tableNumber: number }[] => {
  const havePlayed = (a: string, b: string): boolean =>
    opponentLookup.get(a)?.has(b) ?? false;

  // Iterate until no rematches remain (max passes = pairings.length to prevent infinite loop)
  for (let pass = 0; pass < pairings.length; pass++) {
    // Find a pairing that is a rematch
    const rematchIdx = pairings.findIndex((p) =>
      havePlayed(p.team1Id, p.team2Id)
    );
    if (rematchIdx === -1) break; // No rematches, done

    const bad = pairings[rematchIdx];
    let resolved = false;

    // Try swapping with every other pairing
    for (let j = 0; j < pairings.length && !resolved; j++) {
      if (j === rematchIdx) continue;
      const other = pairings[j];

      // Option A: swap team2s → (bad.t1, other.t2) and (other.t1, bad.t2)
      if (
        !havePlayed(bad.team1Id, other.team2Id) &&
        !havePlayed(other.team1Id, bad.team2Id)
      ) {
        pairings[rematchIdx] = { team1Id: bad.team1Id, team2Id: other.team2Id, tableNumber: bad.tableNumber };
        pairings[j] = { team1Id: other.team1Id, team2Id: bad.team2Id, tableNumber: other.tableNumber };
        resolved = true;
      }
      // Option B: cross-swap → (bad.t1, other.t1) and (bad.t2, other.t2)
      else if (
        !havePlayed(bad.team1Id, other.team1Id) &&
        !havePlayed(bad.team2Id, other.team2Id)
      ) {
        pairings[rematchIdx] = { team1Id: bad.team1Id, team2Id: other.team1Id, tableNumber: bad.tableNumber };
        pairings[j] = { team1Id: bad.team2Id, team2Id: other.team2Id, tableNumber: other.tableNumber };
        resolved = true;
      }
    }
    // If no swap resolved it, the rematch stays (mathematically impossible to avoid)
    if (!resolved) break;
  }

  return pairings;
};

// Generate Swiss system pairings for Round 2+
const generateSwissPairings = (
  teamsWithStats: TeamWithStats[]
): { team1Id: string; team2Id: string; tableNumber: number }[] => {
  // Sort teams by performance (for Swiss pairing)
  teamsWithStats.sort((a, b) => {
    if (a.tournamentPoints !== b.tournamentPoints) {
      return b.tournamentPoints - a.tournamentPoints;
    }
    if (a.objectivePoints !== b.objectivePoints) {
      return b.objectivePoints - a.objectivePoints;
    }
    return b.victoryPointsDifference - a.victoryPointsDifference;
  });

  const pairings: { team1Id: string; team2Id: string; tableNumber: number }[] = [];
  const paired = new Set<string>();
  const usedTables = new Set<number>();

  // Swiss pairing algorithm - START FROM THE BOTTOM
  // Pair lowest ranked teams first, moving up
  for (let i = teamsWithStats.length - 1; i >= 0; i--) {
    const team1 = teamsWithStats[i];

    if (paired.has(team1.team.id)) continue;

    // Try to find best opponent (close in ranking, haven't played before)
    let bestOpponent: TeamWithStats | null = null;

    // First pass: try to find opponent with similar ranking who hasn't been played
    // Search upward from current position (toward better teams)
    for (let j = i - 1; j >= 0; j--) {
      const team2 = teamsWithStats[j];

      if (paired.has(team2.team.id)) continue;

      // Check if teams have played before
      if (!team1.previousOpponents.has(team2.team.id)) {
        bestOpponent = team2;
        break;
      }
    }

    // Second pass: if all nearby opponents have been played, find any available opponent
    if (!bestOpponent) {
      for (let j = i - 1; j >= 0; j--) {
        const team2 = teamsWithStats[j];
        if (!paired.has(team2.team.id)) {
          bestOpponent = team2;
          break;
        }
      }
    }

    if (bestOpponent) {
      // Find best table for this pairing
      const tableNumber = findBestTable(
        usedTables,
        team1.previousTables,
        bestOpponent.previousTables
      );

      pairings.push({
        team1Id: team1.team.id,
        team2Id: bestOpponent.team.id,
        tableNumber
      });

      paired.add(team1.team.id);
      paired.add(bestOpponent.team.id);
      usedTables.add(tableNumber);
    }
  }

  // Post-processing: resolve any rematches caused by greedy pairing
  const opponentLookup = buildOpponentLookup(teamsWithStats);
  return resolveRematches(pairings, opponentLookup);
};

export const generatePairings = (
  teams: Team[],
  currentRound: number,
  allMatches: TeamMatch[]
): { team1Id: string; team2Id: string; tableNumber: number }[] => {
  if (teams.length < 2) {
    throw new Error('Need at least 2 teams to generate pairings');
  }

  if (teams.length % 2 !== 0) {
    throw new Error('Number of teams must be even for pairings');
  }

  // Round 1: Random pairings
  if (currentRound === 1) {
    return generateRandomPairings(teams);
  }

  // Round 2+: Swiss system pairings
  const teamsWithStats = calculateTeamStats(teams, allMatches);
  const pairings = generateSwissPairings(teamsWithStats);

  if (pairings.length !== teams.length / 2) {
    throw new Error('Failed to generate complete pairings');
  }

  return pairings;
};

export const validatePairings = (pairings: { team1Id: string; team2Id: string }[]): boolean => {
  const teams = new Set<string>();
  
  for (const pairing of pairings) {
    if (teams.has(pairing.team1Id) || teams.has(pairing.team2Id)) {
      return false; // Team paired multiple times
    }
    teams.add(pairing.team1Id);
    teams.add(pairing.team2Id);
  }
  
  return true;
};