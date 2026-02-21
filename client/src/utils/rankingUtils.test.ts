import {
  calculateIndividualTournamentPoints,
  calculateTeamTournamentPoints,
  calculatePlayerRankings,
  calculateTeamRankings,
  sortPlayerRankings,
  sortTeamRankings,
  PlayerRanking,
  TeamRanking
} from './rankingUtils';
import { Team, Player, TeamMatch, IndividualMatch } from '../types';

// Helpers
const makePlayer = (overrides: Partial<Player> = {}): Player => ({
  id: 'player-1',
  teamId: 'team-1',
  nickname: 'Player One',
  itsPin: 'PIN001',
  army: 'Army A',
  isCaptain: false,
  isPainted: false,
  ...overrides
});

const makeTeam = (overrides: Partial<Team> & { players?: Player[] } = {}): Team => ({
  id: 'team-1',
  tournamentId: 'tournament-1',
  name: 'Team One',
  captainId: null,
  players: [makePlayer()],
  ...overrides
});

const makeIndividualMatch = (overrides: Partial<IndividualMatch> = {}): IndividualMatch => ({
  id: 'im-1',
  teamMatchId: 'tm-1',
  player1Id: 'player-1',
  player2Id: 'player-2',
  tournamentPoints1: 0,
  tournamentPoints2: 0,
  objectivePoints1: 0,
  objectivePoints2: 0,
  victoryPointsFor1: 0,
  victoryPointsAgainst1: 0,
  victoryPointsFor2: 0,
  victoryPointsAgainst2: 0,
  paintedBonus1: false,
  paintedBonus2: false,
  isCompleted: true,
  ...overrides
});

const makeTeamMatch = (overrides: Partial<TeamMatch> = {}): TeamMatch => ({
  id: 'tm-1',
  tournamentId: 'tournament-1',
  round: 1,
  team1Id: 'team-1',
  team2Id: 'team-2',
  tableNumber: 1,
  isCompleted: true,
  individualMatches: [],
  ...overrides
});

describe('calculateIndividualTournamentPoints', () => {
  it('gives 4 points for a victory (below 5 obj)', () => {
    expect(calculateIndividualTournamentPoints(4, 1, true)).toBe(4);
    expect(calculateIndividualTournamentPoints(1, 4, false)).toBe(4);
  });

  it('gives 0 points for a defeat (diff > 2)', () => {
    expect(calculateIndividualTournamentPoints(1, 4, true)).toBe(0);
    expect(calculateIndividualTournamentPoints(4, 1, false)).toBe(0);
  });

  it('gives 2 points for a tie (below 5 obj)', () => {
    expect(calculateIndividualTournamentPoints(3, 3, true)).toBe(2);
    expect(calculateIndividualTournamentPoints(3, 3, false)).toBe(2);
  });

  it('adds offensive bonus for 5+ objective points', () => {
    // Win with 5+ objective = 4 (win) + 1 (offensive) = 5
    expect(calculateIndividualTournamentPoints(5, 3, true)).toBe(5);
    // Win with 6 objective = 4 + 1 = 5
    expect(calculateIndividualTournamentPoints(6, 3, true)).toBe(5);
  });

  it('does not add offensive bonus for <5 objective points', () => {
    expect(calculateIndividualTournamentPoints(4, 2, true)).toBe(4);
  });

  it('adds defensive bonus for losing by 2 or less', () => {
    // Lose by 1: 0 (defeat) + 1 (defensive) = 1
    expect(calculateIndividualTournamentPoints(4, 5, true)).toBe(1);
    // Lose by 2: 0 + 1 = 1
    expect(calculateIndividualTournamentPoints(3, 5, true)).toBe(1);
  });

  it('does not add defensive bonus for losing by more than 2', () => {
    expect(calculateIndividualTournamentPoints(2, 5, true)).toBe(0);
  });

  it('does not add defensive bonus for winner', () => {
    // Win by 1 with 6 obj: 4 (win) + 1 (offensive) = 5, no defensive
    expect(calculateIndividualTournamentPoints(6, 5, true)).toBe(5);
  });

  it('can stack offensive and defensive bonuses for loser', () => {
    // Player2 loses 5 to 6 = 0 (defeat) + 1 (offensive, 5pts) + 1 (defensive, diff=1) = 2
    expect(calculateIndividualTournamentPoints(6, 5, false)).toBe(2);
  });

  it('tie with 5+ gives offensive bonus to both', () => {
    // Tie at 5-5: 2 (tie) + 1 (offensive) = 3
    expect(calculateIndividualTournamentPoints(5, 5, true)).toBe(3);
    expect(calculateIndividualTournamentPoints(5, 5, false)).toBe(3);
  });
});

describe('calculateTeamTournamentPoints', () => {
  it('adds painted bonus on top of individual points', () => {
    // Win with 7 obj: 4 (win) + 1 (offensive, 7 >= 5) + 1 (painted) = 6
    expect(calculateTeamTournamentPoints(7, 3, true, false, true)).toBe(6);
  });

  it('does not add painted bonus if false', () => {
    // Win with 7 obj: 4 (win) + 1 (offensive) = 5, no painted
    expect(calculateTeamTournamentPoints(7, 3, false, false, true)).toBe(5);
  });

  it('adds painted bonus for player 2', () => {
    // Loss with 3 obj (diff=4 > 2, no defensive): 0 + 1 (painted) = 1
    expect(calculateTeamTournamentPoints(7, 3, false, true, false)).toBe(1);
  });
});

describe('calculatePlayerRankings', () => {
  it('returns empty rankings for no matches', () => {
    const teams = [
      makeTeam({ id: 'team-1', players: [makePlayer({ id: 'p1', teamId: 'team-1' })] }),
      makeTeam({ id: 'team-2', players: [makePlayer({ id: 'p2', teamId: 'team-2' })] })
    ];
    const rankings = calculatePlayerRankings(teams, []);
    expect(rankings).toHaveLength(2);
    expect(rankings[0].tournamentPoints).toBe(0);
    expect(rankings[0].matchesPlayed).toBe(0);
  });

  it('calculates stats from completed individual matches', () => {
    const teams = [
      makeTeam({ id: 'team-1', players: [makePlayer({ id: 'p1', teamId: 'team-1' })] }),
      makeTeam({ id: 'team-2', players: [makePlayer({ id: 'p2', teamId: 'team-2' })] })
    ];
    const matches = [
      makeTeamMatch({
        team1Id: 'team-1',
        team2Id: 'team-2',
        individualMatches: [
          makeIndividualMatch({
            player1Id: 'p1',
            player2Id: 'p2',
            objectivePoints1: 7,
            objectivePoints2: 3,
            victoryPointsFor1: 150,
            victoryPointsFor2: 80,
            isCompleted: true
          })
        ]
      })
    ];

    const rankings = calculatePlayerRankings(teams, matches);
    const p1 = rankings.find(r => r.player.id === 'p1')!;
    const p2 = rankings.find(r => r.player.id === 'p2')!;

    // P1 won (7 vs 3): 4 points + 1 offensive (7 >= 5) = 5
    expect(p1.tournamentPoints).toBe(5);
    expect(p1.wins).toBe(1);
    expect(p1.matchesPlayed).toBe(1);
    expect(p1.objectivePoints).toBe(7);
    expect(p1.victoryPointsFor).toBe(150);

    // P2 lost (3 vs 7): 0 points, diff = 4 > 2, no defensive
    expect(p2.tournamentPoints).toBe(0);
    expect(p2.losses).toBe(1);
  });

  it('skips incomplete matches', () => {
    const teams = [
      makeTeam({ id: 'team-1', players: [makePlayer({ id: 'p1', teamId: 'team-1' })] }),
      makeTeam({ id: 'team-2', players: [makePlayer({ id: 'p2', teamId: 'team-2' })] })
    ];
    const matches = [
      makeTeamMatch({
        isCompleted: false,
        individualMatches: [
          makeIndividualMatch({ objectivePoints1: 10, objectivePoints2: 0, isCompleted: false })
        ]
      })
    ];

    const rankings = calculatePlayerRankings(teams, matches);
    expect(rankings[0].matchesPlayed).toBe(0);
  });
});

describe('calculateTeamRankings', () => {
  it('aggregates individual match results per team', () => {
    const teams = [
      makeTeam({ id: 'team-1', players: [makePlayer({ id: 'p1', teamId: 'team-1' })] }),
      makeTeam({ id: 'team-2', players: [makePlayer({ id: 'p2', teamId: 'team-2' })] })
    ];
    const matches = [
      makeTeamMatch({
        team1Id: 'team-1',
        team2Id: 'team-2',
        individualMatches: [
          makeIndividualMatch({
            player1Id: 'p1',
            player2Id: 'p2',
            objectivePoints1: 6,
            objectivePoints2: 4,
            victoryPointsFor1: 120,
            victoryPointsFor2: 80,
            paintedBonus1: true,
            paintedBonus2: false,
            isCompleted: true
          })
        ]
      })
    ];

    const rankings = calculateTeamRankings(teams, matches);
    const t1 = rankings.find(r => r.team.id === 'team-1')!;
    const t2 = rankings.find(r => r.team.id === 'team-2')!;

    // Team 1: 4 (win) + 1 (offensive, 6pts) + 1 (painted) = 6
    expect(t1.tournamentPoints).toBe(6);
    expect(t1.paintedBonus).toBe(1);
    expect(t1.wins).toBe(1);

    // Team 2: 0 (loss) + 0 (no offensive, 4pts) + 0 (diff=2, defensive) + 0 (no painted) = 1
    // Actually: loss with diff 2, so defensive bonus = 1
    expect(t2.tournamentPoints).toBe(1);
    expect(t2.paintedBonus).toBe(0);
    expect(t2.losses).toBe(1);
  });
});

describe('sortPlayerRankings', () => {
  const makeRanking = (overrides: Partial<PlayerRanking>): PlayerRanking => ({
    player: makePlayer(),
    team: makeTeam(),
    tournamentPoints: 0,
    objectivePoints: 0,
    objectivePointsAgainst: 0,
    objectivePointsDifference: 0,
    victoryPointsFor: 0,
    victoryPointsAgainst: 0,
    victoryPointsDifference: 0,
    matchesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    ...overrides
  });

  it('sorts by tournament points first (descending)', () => {
    const rankings = [
      makeRanking({ tournamentPoints: 5, player: makePlayer({ nickname: 'A' }) }),
      makeRanking({ tournamentPoints: 10, player: makePlayer({ nickname: 'B' }) })
    ];
    const sorted = sortPlayerRankings(rankings);
    expect(sorted[0].player.nickname).toBe('B');
  });

  it('breaks ties with objective points', () => {
    const rankings = [
      makeRanking({ tournamentPoints: 10, objectivePoints: 5, player: makePlayer({ nickname: 'A' }) }),
      makeRanking({ tournamentPoints: 10, objectivePoints: 8, player: makePlayer({ nickname: 'B' }) })
    ];
    const sorted = sortPlayerRankings(rankings);
    expect(sorted[0].player.nickname).toBe('B');
  });

  it('breaks further ties with VP difference', () => {
    const rankings = [
      makeRanking({ tournamentPoints: 10, objectivePoints: 8, victoryPointsDifference: 20, player: makePlayer({ nickname: 'A' }) }),
      makeRanking({ tournamentPoints: 10, objectivePoints: 8, victoryPointsDifference: 50, player: makePlayer({ nickname: 'B' }) })
    ];
    const sorted = sortPlayerRankings(rankings);
    expect(sorted[0].player.nickname).toBe('B');
  });

  it('uses alphabetical order as final tiebreaker', () => {
    const rankings = [
      makeRanking({ player: makePlayer({ nickname: 'Zara' }) }),
      makeRanking({ player: makePlayer({ nickname: 'Alice' }) })
    ];
    const sorted = sortPlayerRankings(rankings);
    expect(sorted[0].player.nickname).toBe('Alice');
  });
});

describe('sortTeamRankings', () => {
  const makeTeamRanking = (overrides: Partial<TeamRanking>): TeamRanking => ({
    team: makeTeam(),
    tournamentPoints: 0,
    objectivePoints: 0,
    objectivePointsAgainst: 0,
    objectivePointsDifference: 0,
    victoryPointsFor: 0,
    victoryPointsAgainst: 0,
    victoryPointsDifference: 0,
    matchesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    paintedBonus: 0,
    ...overrides
  });

  it('sorts by tournament points first', () => {
    const rankings = [
      makeTeamRanking({ tournamentPoints: 5, team: makeTeam({ name: 'A' }) }),
      makeTeamRanking({ tournamentPoints: 15, team: makeTeam({ name: 'B' }) })
    ];
    const sorted = sortTeamRankings(rankings);
    expect(sorted[0].team.name).toBe('B');
  });

  it('uses team name as final tiebreaker', () => {
    const rankings = [
      makeTeamRanking({ team: makeTeam({ name: 'Zeta' }) }),
      makeTeamRanking({ team: makeTeam({ name: 'Alpha' }) })
    ];
    const sorted = sortTeamRankings(rankings);
    expect(sorted[0].team.name).toBe('Alpha');
  });
});
