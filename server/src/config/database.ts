import knex from 'knex';
import path from 'path';

const database = knex({
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, '../../database.sqlite')
  },
  useNullAsDefault: true,
  migrations: {
    directory: path.join(__dirname, '../migrations')
  }
});

export const initializeDatabase = async () => {
  try {
    // Create tournaments table
    const tournamentsExists = await database.schema.hasTable('tournaments');
    if (!tournamentsExists) {
      await database.schema.createTable('tournaments', (table) => {
        table.string('id').primary();
        table.string('name').notNullable();
        table.integer('currentRound').defaultTo(1);
        table.timestamps(true, true);
      });
    }

    // Create teams table
    const teamsExists = await database.schema.hasTable('teams');
    if (!teamsExists) {
      await database.schema.createTable('teams', (table) => {
        table.string('id').primary();
        table.string('tournamentId').notNullable();
        table.string('name').notNullable();
        table.string('captainId').nullable();
        table.timestamps(true, true);
        table.foreign('tournamentId').references('tournaments.id').onDelete('CASCADE');
      });
    }

    // Create players table
    const playersExists = await database.schema.hasTable('players');
    if (!playersExists) {
      await database.schema.createTable('players', (table) => {
        table.string('id').primary();
        table.string('teamId').notNullable();
        table.string('nickname').notNullable();
        table.string('itsPin').notNullable();
        table.string('army').notNullable();
        table.boolean('isCaptain').defaultTo(false);
        table.boolean('isPainted').defaultTo(false);
        table.timestamps(true, true);
        table.foreign('teamId').references('teams.id').onDelete('CASCADE');
      });
    }

    // Create team_matches table
    const teamMatchesExists = await database.schema.hasTable('team_matches');
    if (!teamMatchesExists) {
      await database.schema.createTable('team_matches', (table) => {
        table.string('id').primary();
        table.string('tournamentId').notNullable();
        table.integer('round').notNullable();
        table.string('team1Id').notNullable();
        table.string('team2Id').notNullable();
        table.boolean('isCompleted').defaultTo(false);
        table.timestamps(true, true);
        table.foreign('tournamentId').references('tournaments.id').onDelete('CASCADE');
        table.foreign('team1Id').references('teams.id').onDelete('CASCADE');
        table.foreign('team2Id').references('teams.id').onDelete('CASCADE');
      });
    }

    // Create individual_matches table
    const individualMatchesExists = await database.schema.hasTable('individual_matches');
    if (!individualMatchesExists) {
      await database.schema.createTable('individual_matches', (table) => {
        table.string('id').primary();
        table.string('teamMatchId').notNullable();
        table.string('player1Id').notNullable();
        table.string('player2Id').notNullable();
        table.integer('tournamentPoints1').defaultTo(0);
        table.integer('tournamentPoints2').defaultTo(0);
        table.integer('objectivePoints1').defaultTo(0);
        table.integer('objectivePoints2').defaultTo(0);
        table.integer('victoryPointsFor1').defaultTo(0);
        table.integer('victoryPointsAgainst1').defaultTo(0);
        table.integer('victoryPointsFor2').defaultTo(0);
        table.integer('victoryPointsAgainst2').defaultTo(0);
        table.boolean('paintedBonus1').defaultTo(false);
        table.boolean('paintedBonus2').defaultTo(false);
        table.boolean('isCompleted').defaultTo(false);
        table.timestamps(true, true);
        table.foreign('teamMatchId').references('team_matches.id').onDelete('CASCADE');
        table.foreign('player1Id').references('players.id').onDelete('CASCADE');
        table.foreign('player2Id').references('players.id').onDelete('CASCADE');
      });
    }

    console.log('All database tables created successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

export { database as db };
export default database;