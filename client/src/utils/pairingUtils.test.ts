import { generatePairings, validatePairings } from './pairingUtils';
import { Team, TeamMatch, IndividualMatch, Player } from '../types';

const makePlayer = (overrides: Partial<Player> = {}): Player => ({
  id: 'player-1',
  teamId: 'team-1',
  nickname: 'Player One',
  itsPin: 'PIN001',
  army: 'Army A',
  isCaptain: false,
  isPainted: false,
  armyListLate: false,
  ...overrides
});

const makeTeam = (id: string, name: string): Team => ({
  id,
  tournamentId: 'tournament-1',
  name,
  captainId: null,
  players: [makePlayer({ id: `${id}-p1`, teamId: id })]
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

describe('generatePairings', () => {
  it('throws for fewer than 2 teams', () => {
    expect(() => generatePairings([makeTeam('t1', 'Team 1')], 1, []))
      .toThrow('Need at least 2 teams');
  });

  it('throws for odd number of teams', () => {
    const teams = [
      makeTeam('t1', 'Team 1'),
      makeTeam('t2', 'Team 2'),
      makeTeam('t3', 'Team 3')
    ];
    expect(() => generatePairings(teams, 1, []))
      .toThrow('Number of teams must be even');
  });

  it('generates pairings for round 1 with correct count', () => {
    const teams = [
      makeTeam('t1', 'Team 1'),
      makeTeam('t2', 'Team 2'),
      makeTeam('t3', 'Team 3'),
      makeTeam('t4', 'Team 4')
    ];

    const pairings = generatePairings(teams, 1, []);
    expect(pairings).toHaveLength(2);
    expect(validatePairings(pairings)).toBe(true);
  });

  it('generates round 1 with unique table numbers', () => {
    const teams = [
      makeTeam('t1', 'Team 1'),
      makeTeam('t2', 'Team 2'),
      makeTeam('t3', 'Team 3'),
      makeTeam('t4', 'Team 4')
    ];

    const pairings = generatePairings(teams, 1, []);
    const tables = pairings.map(p => p.tableNumber);
    expect(new Set(tables).size).toBe(tables.length);
  });

  it('generates Swiss pairings for round 2+ based on stats', () => {
    const teams = [
      makeTeam('t1', 'Team 1'),
      makeTeam('t2', 'Team 2'),
      makeTeam('t3', 'Team 3'),
      makeTeam('t4', 'Team 4')
    ];

    const previousMatches: TeamMatch[] = [
      makeTeamMatch({ id: 'tm1', team1Id: 't1', team2Id: 't2', round: 1, tableNumber: 1 }),
      makeTeamMatch({ id: 'tm2', team1Id: 't3', team2Id: 't4', round: 1, tableNumber: 2 })
    ];

    const pairings = generatePairings(teams, 2, previousMatches);
    expect(pairings).toHaveLength(2);
    expect(validatePairings(pairings)).toBe(true);
  });

  it('avoids rematches in Swiss pairings when possible', () => {
    const teams = [
      makeTeam('t1', 'Team 1'),
      makeTeam('t2', 'Team 2'),
      makeTeam('t3', 'Team 3'),
      makeTeam('t4', 'Team 4')
    ];

    const previousMatches: TeamMatch[] = [
      makeTeamMatch({ id: 'tm1', team1Id: 't1', team2Id: 't2', round: 1, tableNumber: 1 }),
      makeTeamMatch({ id: 'tm2', team1Id: 't3', team2Id: 't4', round: 1, tableNumber: 2 })
    ];

    const pairings = generatePairings(teams, 2, previousMatches);

    // Check no rematches occurred
    for (const pairing of pairings) {
      const wasRound1 = previousMatches.some(
        m => (m.team1Id === pairing.team1Id && m.team2Id === pairing.team2Id) ||
             (m.team1Id === pairing.team2Id && m.team2Id === pairing.team1Id)
      );
      expect(wasRound1).toBe(false);
    }
  });

  it('pairs all teams (no team left unpaired)', () => {
    const teams = Array.from({ length: 8 }, (_, i) => makeTeam(`t${i}`, `Team ${i}`));
    const pairings = generatePairings(teams, 1, []);

    const allTeamIds = new Set(pairings.flatMap(p => [p.team1Id, p.team2Id]));
    expect(allTeamIds.size).toBe(8);
  });
});

describe('validatePairings', () => {
  it('returns true for valid pairings', () => {
    const pairings = [
      { team1Id: 't1', team2Id: 't2' },
      { team1Id: 't3', team2Id: 't4' }
    ];
    expect(validatePairings(pairings)).toBe(true);
  });

  it('returns false if a team appears twice', () => {
    const pairings = [
      { team1Id: 't1', team2Id: 't2' },
      { team1Id: 't1', team2Id: 't3' }
    ];
    expect(validatePairings(pairings)).toBe(false);
  });

  it('returns false if team is on both sides', () => {
    const pairings = [
      { team1Id: 't1', team2Id: 't2' },
      { team1Id: 't3', team2Id: 't2' }
    ];
    expect(validatePairings(pairings)).toBe(false);
  });
});
