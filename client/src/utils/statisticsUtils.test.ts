import {
  calculateArmyDistribution,
  calculatePlayerPerformance,
  calculateArmyPerformance,
  calculateTournamentStats
} from './statisticsUtils';
import { Team, Player, TeamMatch, IndividualMatch } from '../types';

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

const makeIndividualMatch = (overrides: Partial<IndividualMatch> = {}): IndividualMatch => ({
  id: 'im-1',
  teamMatchId: 'tm-1',
  player1Id: 'player-1',
  player2Id: 'player-2',
  tournamentPoints1: 4,
  tournamentPoints2: 0,
  objectivePoints1: 7,
  objectivePoints2: 3,
  victoryPointsFor1: 150,
  victoryPointsAgainst1: 80,
  victoryPointsFor2: 80,
  victoryPointsAgainst2: 150,
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

describe('calculateArmyDistribution', () => {
  it('returns empty array for no players', () => {
    expect(calculateArmyDistribution([])).toEqual([]);
  });

  it('counts armies correctly', () => {
    const players = [
      makePlayer({ id: 'p1', army: 'Nomads' }),
      makePlayer({ id: 'p2', army: 'Nomads' }),
      makePlayer({ id: 'p3', army: 'PanO' })
    ];

    const distribution = calculateArmyDistribution(players);
    expect(distribution).toHaveLength(2);
    expect(distribution[0].army).toBe('Nomads');
    expect(distribution[0].count).toBe(2);
    expect(distribution[0].percentage).toBeCloseTo(66.67, 0);
    expect(distribution[1].army).toBe('PanO');
    expect(distribution[1].count).toBe(1);
    expect(distribution[1].percentage).toBeCloseTo(33.33, 0);
  });

  it('sorts by count descending', () => {
    const players = [
      makePlayer({ id: 'p1', army: 'Yu Jing' }),
      makePlayer({ id: 'p2', army: 'Haqqislam' }),
      makePlayer({ id: 'p3', army: 'Haqqislam' }),
      makePlayer({ id: 'p4', army: 'Ariadna' }),
      makePlayer({ id: 'p5', army: 'Ariadna' }),
      makePlayer({ id: 'p6', army: 'Ariadna' })
    ];

    const distribution = calculateArmyDistribution(players);
    expect(distribution[0].army).toBe('Ariadna');
    expect(distribution[1].army).toBe('Haqqislam');
    expect(distribution[2].army).toBe('Yu Jing');
  });
});

describe('calculatePlayerPerformance', () => {
  it('returns empty for players with no completed matches', () => {
    const players = [makePlayer({ id: 'p1' })];
    const result = calculatePlayerPerformance(players, []);
    expect(result).toHaveLength(0); // filtered out since gamesPlayed === 0
  });

  it('calculates win rate and averages', () => {
    const players = [
      makePlayer({ id: 'p1' }),
      makePlayer({ id: 'p2' })
    ];
    const matches = [
      makeTeamMatch({
        individualMatches: [
          makeIndividualMatch({
            player1Id: 'p1',
            player2Id: 'p2',
            objectivePoints1: 7,
            objectivePoints2: 3,
            victoryPointsFor1: 150,
            victoryPointsAgainst1: 80,
            victoryPointsFor2: 80,
            victoryPointsAgainst2: 150,
            tournamentPoints1: 5,
            tournamentPoints2: 0
          })
        ]
      })
    ];

    const result = calculatePlayerPerformance(players, matches);
    const p1 = result.find(r => r.player.id === 'p1')!;
    const p2 = result.find(r => r.player.id === 'p2')!;

    expect(p1.winRate).toBe(100);
    expect(p1.gamesPlayed).toBe(1);
    expect(p1.averageObjectivePoints).toBe(7);
    expect(p1.totalTournamentPoints).toBe(5);
    expect(p1.killRatio).toBeCloseTo(150 / 80, 2);

    expect(p2.winRate).toBe(0);
    expect(p2.gamesPlayed).toBe(1);
  });

  it('handles player with 0 VP against (kill ratio edge case)', () => {
    const players = [makePlayer({ id: 'p1' }), makePlayer({ id: 'p2' })];
    const matches = [
      makeTeamMatch({
        individualMatches: [
          makeIndividualMatch({
            player1Id: 'p1',
            player2Id: 'p2',
            victoryPointsFor1: 200,
            victoryPointsAgainst1: 0,
            victoryPointsFor2: 0,
            victoryPointsAgainst2: 200
          })
        ]
      })
    ];

    const result = calculatePlayerPerformance(players, matches);
    const p1 = result.find(r => r.player.id === 'p1')!;
    // When VP against is 0, killRatio = totalVictoryPointsFor
    expect(p1.killRatio).toBe(200);
  });

  it('skips incomplete individual matches', () => {
    const players = [makePlayer({ id: 'p1' }), makePlayer({ id: 'p2' })];
    const matches = [
      makeTeamMatch({
        individualMatches: [
          makeIndividualMatch({ isCompleted: false })
        ]
      })
    ];

    const result = calculatePlayerPerformance(players, matches);
    expect(result).toHaveLength(0);
  });
});

describe('calculateArmyPerformance', () => {
  it('aggregates performance by army', () => {
    const players = [
      makePlayer({ id: 'p1', army: 'Nomads' }),
      makePlayer({ id: 'p2', army: 'PanO' })
    ];
    const matches = [
      makeTeamMatch({
        individualMatches: [
          makeIndividualMatch({
            player1Id: 'p1',
            player2Id: 'p2',
            objectivePoints1: 7,
            objectivePoints2: 3
          })
        ]
      })
    ];

    const result = calculateArmyPerformance(players, matches);
    const nomads = result.find(r => r.army === 'Nomads')!;
    const pano = result.find(r => r.army === 'PanO')!;

    expect(nomads.wins).toBe(1);
    expect(nomads.gamesPlayed).toBe(1);
    expect(nomads.winRate).toBe(100);

    expect(pano.wins).toBe(0);
    expect(pano.winRate).toBe(0);
  });

  it('sorts by win rate descending', () => {
    const players = [
      makePlayer({ id: 'p1', army: 'Nomads' }),
      makePlayer({ id: 'p2', army: 'PanO' })
    ];
    const matches = [
      makeTeamMatch({
        individualMatches: [
          makeIndividualMatch({
            player1Id: 'p1',
            player2Id: 'p2',
            objectivePoints1: 7,
            objectivePoints2: 3
          })
        ]
      })
    ];

    const result = calculateArmyPerformance(players, matches);
    expect(result[0].army).toBe('Nomads');
  });
});

describe('calculateTournamentStats', () => {
  it('returns correct aggregate stats', () => {
    const teams = [
      { id: 't1', tournamentId: 'tour', name: 'Team 1', captainId: null, players: [makePlayer({ id: 'p1', teamId: 't1', army: 'Nomads' })] },
      { id: 't2', tournamentId: 'tour', name: 'Team 2', captainId: null, players: [makePlayer({ id: 'p2', teamId: 't2', army: 'PanO' })] }
    ];
    const allPlayers = teams.flatMap(t => t.players);
    const matches = [
      makeTeamMatch({
        round: 1,
        team1Id: 't1',
        team2Id: 't2',
        individualMatches: [
          makeIndividualMatch({ player1Id: 'p1', player2Id: 'p2', isCompleted: true }),
          makeIndividualMatch({ id: 'im-2', player1Id: 'p1', player2Id: 'p2', isCompleted: false })
        ]
      })
    ];

    const stats = calculateTournamentStats(teams, allPlayers, matches, 1);

    expect(stats.totalPlayers).toBe(2);
    expect(stats.totalTeams).toBe(2);
    expect(stats.totalMatches).toBe(2);
    expect(stats.completedMatches).toBe(1);
    expect(stats.currentRound).toBe(1);
    expect(stats.totalRounds).toBe(1);
    expect(stats.armyDistribution).toHaveLength(2);
  });

  it('handles empty tournament', () => {
    const stats = calculateTournamentStats([], [], [], 1);
    expect(stats.totalPlayers).toBe(0);
    expect(stats.totalTeams).toBe(0);
    expect(stats.totalMatches).toBe(0);
    expect(stats.mostKills).toBeNull();
    expect(stats.leastDeaths).toBeNull();
    expect(stats.highestObjectiveAverage).toBeNull();
  });
});
