// Maps for converting between camelCase (frontend) and snake_case (database)

const tournamentFieldMap: Record<string, string> = {
  currentRound: 'current_round',
  teamCount: 'team_count',
  matchCount: 'match_count',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

const teamFieldMap: Record<string, string> = {
  tournamentId: 'tournament_id',
  captainId: 'captain_id',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

const playerFieldMap: Record<string, string> = {
  teamId: 'team_id',
  itsPin: 'its_pin',
  isCaptain: 'is_captain',
  isPainted: 'is_painted',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

const teamMatchFieldMap: Record<string, string> = {
  tournamentId: 'tournament_id',
  team1Id: 'team1_id',
  team2Id: 'team2_id',
  tableNumber: 'table_number',
  isCompleted: 'is_completed',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

const individualMatchFieldMap: Record<string, string> = {
  teamMatchId: 'team_match_id',
  player1Id: 'player1_id',
  player2Id: 'player2_id',
  tournamentPoints1: 'tournament_points1',
  tournamentPoints2: 'tournament_points2',
  objectivePoints1: 'objective_points1',
  objectivePoints2: 'objective_points2',
  victoryPointsFor1: 'victory_points_for1',
  victoryPointsAgainst1: 'victory_points_against1',
  victoryPointsFor2: 'victory_points_for2',
  victoryPointsAgainst2: 'victory_points_against2',
  paintedBonus1: 'painted_bonus1',
  paintedBonus2: 'painted_bonus2',
  isCompleted: 'is_completed',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

// Invert a field map (snake_case -> camelCase)
function invertMap(map: Record<string, string>): Record<string, string> {
  const inverted: Record<string, string> = {};
  for (const [camel, snake] of Object.entries(map)) {
    inverted[snake] = camel;
  }
  return inverted;
}

// Boolean fields that need conversion from SQLite integers
const booleanSnakeFields = new Set([
  'is_captain', 'is_painted', 'is_completed',
  'painted_bonus1', 'painted_bonus2',
]);

// Convert DB row (snake_case) to API response (camelCase) with boolean conversion
function dbToApi(
  row: object,
  fieldMap: Record<string, string>
): Record<string, unknown> {
  const invertedMap = invertMap(fieldMap);
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    const mappedKey = invertedMap[key] ?? key;
    result[mappedKey] = booleanSnakeFields.has(key) ? Boolean(value) : value;
  }
  return result;
}

// Convert API request (camelCase) to DB fields (snake_case) with boolean-to-int conversion
function apiToDb(
  obj: object,
  fieldMap: Record<string, string>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = fieldMap[key] ?? key;
    if (booleanSnakeFields.has(snakeKey) && typeof value === 'boolean') {
      result[snakeKey] = value ? 1 : 0;
    } else {
      result[snakeKey] = value;
    }
  }
  return result;
}

export const tournamentMapper = {
  toApi: (row: object) => dbToApi(row, tournamentFieldMap),
  toDb: (obj: object) => apiToDb(obj, tournamentFieldMap),
};

export const teamMapper = {
  toApi: (row: object) => dbToApi(row, teamFieldMap),
  toDb: (obj: object) => apiToDb(obj, teamFieldMap),
};

export const playerMapper = {
  toApi: (row: object) => dbToApi(row, playerFieldMap),
  toDb: (obj: object) => apiToDb(obj, playerFieldMap),
};

export const teamMatchMapper = {
  toApi: (row: object) => dbToApi(row, teamMatchFieldMap),
  toDb: (obj: object) => apiToDb(obj, teamMatchFieldMap),
};

export const individualMatchMapper = {
  toApi: (row: object) => dbToApi(row, individualMatchFieldMap),
  toDb: (obj: object) => apiToDb(obj, individualMatchFieldMap),
};
