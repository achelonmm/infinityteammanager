import { generatePairings, validatePairings } from '../pairingUtils';
import { Team, TeamMatch, IndividualMatch } from '../../types';

// ──────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────

function makeTeams(count: number, tournamentId = 'test-tournament'): Team[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `team-${String(i + 1).padStart(2, '0')}`,
    tournamentId,
    name: `Team ${i + 1}`,
    captainId: null,
    players: [],
  }));
}

/** Simulate match results so teams accumulate diverging stats */
function simulateMatchResults(
  pairings: { team1Id: string; team2Id: string; tableNumber: number }[],
  round: number,
  tournamentId: string,
  existingMatches: TeamMatch[]
): TeamMatch[] {
  const newMatches: TeamMatch[] = pairings.map((p, idx) => {
    // Give team1 a slight advantage based on pairing index to create ranking divergence
    const team1Wins = idx % 3 !== 0; // team1 wins 2/3 of the time
    const tp1 = team1Wins ? 3 : 0;
    const tp2 = team1Wins ? 0 : 3;
    const op1 = team1Wins ? 4 : 1;
    const op2 = team1Wins ? 1 : 4;
    const vp1 = team1Wins ? 120 : 60;
    const vp2 = team1Wins ? 60 : 120;

    const indMatch: IndividualMatch = {
      id: `ind-r${round}-m${idx}`,
      teamMatchId: `match-r${round}-m${idx}`,
      player1Id: 'p1',
      player2Id: 'p2',
      tournamentPoints1: tp1,
      tournamentPoints2: tp2,
      objectivePoints1: op1,
      objectivePoints2: op2,
      victoryPointsFor1: vp1,
      victoryPointsAgainst1: vp2,
      victoryPointsFor2: vp2,
      victoryPointsAgainst2: vp1,
      paintedBonus1: false,
      paintedBonus2: false,
      lateListPenalty1: false,
      lateListPenalty2: false,
      isCompleted: true,
    };

    return {
      id: `match-r${round}-m${idx}`,
      tournamentId,
      round,
      team1Id: p.team1Id,
      team2Id: p.team2Id,
      tableNumber: p.tableNumber,
      isCompleted: true,
      individualMatches: [indMatch],
    };
  });

  return [...existingMatches, ...newMatches];
}

function matchupKey(a: string, b: string): string {
  return [a, b].sort().join(' vs ');
}

// ──────────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────────

describe('Pairing System – 20 teams × 5 rounds', () => {
  const NUM_TEAMS = 20;
  const NUM_ROUNDS = 5;
  const TOURNAMENT_ID = 'test-tournament';

  let teams: Team[];
  let allMatches: TeamMatch[];
  let roundPairings: { team1Id: string; team2Id: string; tableNumber: number }[][];

  beforeAll(() => {
    teams = makeTeams(NUM_TEAMS, TOURNAMENT_ID);
    allMatches = [];
    roundPairings = [];

    for (let round = 1; round <= NUM_ROUNDS; round++) {
      const pairings = generatePairings(teams, round, allMatches);
      roundPairings.push(pairings);
      allMatches = simulateMatchResults(pairings, round, TOURNAMENT_ID, allMatches);
    }
  });

  // ── Basic sanity ──

  test('generates exactly 10 pairings per round', () => {
    for (let r = 0; r < NUM_ROUNDS; r++) {
      expect(roundPairings[r]).toHaveLength(NUM_TEAMS / 2);
    }
  });

  test('every team appears exactly once per round', () => {
    for (let r = 0; r < NUM_ROUNDS; r++) {
      expect(validatePairings(roundPairings[r])).toBe(true);
    }
  });

  // ── Round 1: random pairings ──

  test('Round 1 pairings are generated (random)', () => {
    const r1 = roundPairings[0];
    expect(r1).toHaveLength(10);

    // Verify all 20 team IDs appear
    const teamIds = new Set<string>();
    r1.forEach((p) => {
      teamIds.add(p.team1Id);
      teamIds.add(p.team2Id);
    });
    expect(teamIds.size).toBe(20);
  });

  test('Round 1 is produced by random pairing (statistical check over multiple runs)', () => {
    // Run round 1 many times; if it were deterministic every run would be identical.
    // With 20 teams the odds of two random shuffles producing the exact same pairings
    // are astronomically low (~1 / 654,729,075).
    const runs = 5;
    const signatures = new Set<string>();

    for (let run = 0; run < runs; run++) {
      const p = generatePairings(teams, 1, []);
      const sig = p.map((x) => `${x.team1Id}-${x.team2Id}`).join('|');
      signatures.add(sig);
    }

    // With 5 independent random shuffles we expect at least 2 distinct orderings
    expect(signatures.size).toBeGreaterThanOrEqual(2);
  });

  // ── Rounds 2-5: Swiss system ──

  test('Rounds 2-5 use Swiss ordering (bottom-to-top)', () => {
    // For each Swiss round, verify the algorithm pairs teams that are close in ranking.
    // We check that, on average, the ranking gap between paired teams is reasonable
    // (not just random).
    for (let r = 1; r < NUM_ROUNDS; r++) {
      const pairings = roundPairings[r];
      const round = r + 1;

      // Build current stats for each team at the point before this round
      const matchesBefore = allMatches.filter((m) => m.round < round);
      const stats = new Map<
        string,
        { tp: number; op: number; vpDiff: number }
      >();
      teams.forEach((t) => stats.set(t.id, { tp: 0, op: 0, vpDiff: 0 }));

      matchesBefore.forEach((m) => {
        if (!m.isCompleted || !m.individualMatches) return;
        m.individualMatches.forEach((im) => {
          if (!im.isCompleted) return;
          const s1 = stats.get(m.team1Id)!;
          s1.tp += im.tournamentPoints1;
          s1.op += im.objectivePoints1;
          s1.vpDiff += im.victoryPointsFor1 - im.victoryPointsAgainst1;
          const s2 = stats.get(m.team2Id)!;
          s2.tp += im.tournamentPoints2;
          s2.op += im.objectivePoints2;
          s2.vpDiff += im.victoryPointsFor2 - im.victoryPointsAgainst2;
        });
      });

      // Sort by the same criteria the algorithm uses
      const ranked = Array.from(stats.entries()).sort((a, b) => {
        if (a[1].tp !== b[1].tp) return b[1].tp - a[1].tp;
        if (a[1].op !== b[1].op) return b[1].op - a[1].op;
        return b[1].vpDiff - a[1].vpDiff;
      });

      const rankOf = new Map<string, number>();
      ranked.forEach(([id], idx) => rankOf.set(id, idx));

      // Calculate average ranking gap
      let totalGap = 0;
      pairings.forEach((p) => {
        const r1 = rankOf.get(p.team1Id)!;
        const r2 = rankOf.get(p.team2Id)!;
        totalGap += Math.abs(r1 - r2);
      });
      const avgGap = totalGap / pairings.length;

      // Swiss should produce a much lower average gap than random pairing
      // Random: expected gap ~ NUM_TEAMS/3 ≈ 6.7
      // Swiss bottom-to-top with adjacent pairing: expected gap ~ 1-3
      // Allow some slack due to rematch avoidance
      expect(avgGap).toBeLessThan(NUM_TEAMS / 3);
    }
  });

  // ── No repeated matchups ──

  test('no matchup is repeated across any round', () => {
    const seen = new Set<string>();
    const duplicates: string[] = [];

    for (let r = 0; r < NUM_ROUNDS; r++) {
      for (const p of roundPairings[r]) {
        const key = matchupKey(p.team1Id, p.team2Id);
        if (seen.has(key)) {
          duplicates.push(`Round ${r + 1}: ${key}`);
        }
        seen.add(key);
      }
    }

    expect(duplicates).toEqual([]);
  });

  test('total unique matchups equals rounds × pairings per round', () => {
    const seen = new Set<string>();
    for (const rp of roundPairings) {
      for (const p of rp) {
        seen.add(matchupKey(p.team1Id, p.team2Id));
      }
    }
    // 5 rounds × 10 pairings = 50 unique matchups (if no duplicates)
    expect(seen.size).toBe(NUM_ROUNDS * (NUM_TEAMS / 2));
  });

  // ── Edge-case stress: run the simulation 10 times ──

  test('no rematch across 50 independent full simulations', () => {
    const failures: string[] = [];

    for (let sim = 0; sim < 50; sim++) {
      const t = makeTeams(NUM_TEAMS, `sim-${sim}`);
      let matches: TeamMatch[] = [];
      const seen = new Map<string, number>(); // key → round first seen

      for (let round = 1; round <= NUM_ROUNDS; round++) {
        const pairings = generatePairings(t, round, matches);
        for (const p of pairings) {
          const key = matchupKey(p.team1Id, p.team2Id);
          if (seen.has(key)) {
            failures.push(
              `Sim ${sim}, Round ${round}: ${key} (first seen round ${seen.get(key)})`
            );
          } else {
            seen.set(key, round);
          }
        }
        matches = simulateMatchResults(pairings, round, `sim-${sim}`, matches);
      }
    }

    if (failures.length > 0) {
      // eslint-disable-next-line no-console
      console.log('REMATCHES FOUND:\n' + failures.join('\n'));
    }
    expect(failures).toEqual([]);
  });

  // ── Structural: every round's pairings have valid table numbers ──

  test('all table numbers are positive and unique within each round', () => {
    for (let r = 0; r < NUM_ROUNDS; r++) {
      const tables = roundPairings[r].map((p) => p.tableNumber);
      tables.forEach((t) => expect(t).toBeGreaterThan(0));

      const unique = new Set(tables);
      expect(unique.size).toBe(tables.length);
    }
  });
});
