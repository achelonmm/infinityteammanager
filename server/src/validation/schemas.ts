import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Tournament schemas
export const createTournamentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  currentRound: z.number().int().positive().optional(),
});

export const updateTournamentSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  currentRound: z.number().int().positive().optional(),
  status: z.enum(['active', 'completed']).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

// Player schema (used within team creation/update)
const playerSchema = z.object({
  id: z.string().min(1),
  nickname: z.string().min(1).max(100),
  itsPin: z.string().min(1).max(50),
  army: z.string().min(1).max(100),
  isCaptain: z.boolean().optional().default(false),
  isPainted: z.boolean().optional().default(false),
});

// Team schemas
export const createTeamSchema = z.object({
  team: z.object({
    id: z.string().min(1),
    tournamentId: z.string().min(1),
    name: z.string().min(1).max(200),
    captainId: z.string().nullable().optional(),
  }),
  players: z.array(playerSchema).min(1),
});

export const updateTeamSchema = z.object({
  team: z.object({
    name: z.string().min(1).max(200).optional(),
    captainId: z.string().nullable().optional(),
  }).optional(),
  players: z.array(playerSchema).optional(),
  name: z.string().min(1).max(200).optional(),
  captainId: z.string().nullable().optional(),
});

// Player update schema
export const updatePlayerSchema = z.object({
  nickname: z.string().min(1).max(100).optional(),
  itsPin: z.string().min(1).max(50).optional(),
  army: z.string().min(1).max(100).optional(),
  isCaptain: z.boolean().optional(),
  isPainted: z.boolean().optional(),
  armyListLate: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

// Team match schemas
export const createTeamMatchSchema = z.object({
  id: z.string().min(1),
  tournamentId: z.string().min(1),
  round: z.number().int().positive(),
  team1Id: z.string().min(1),
  team2Id: z.string().min(1),
  tableNumber: z.number().int().positive(),
  isCompleted: z.boolean().optional().default(false),
});

export const updateTeamMatchSchema = z.object({
  isCompleted: z.boolean().optional(),
  tableNumber: z.number().int().positive().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

export const batchCreateTeamMatchSchema = z.object({
  matches: z.array(createTeamMatchSchema).min(1),
});

// Individual match schemas
export const updateIndividualMatchSchema = z.object({
  tournamentPoints1: z.number().int().min(0).optional(),
  tournamentPoints2: z.number().int().min(0).optional(),
  objectivePoints1: z.number().int().min(0).max(10).optional(),
  objectivePoints2: z.number().int().min(0).max(10).optional(),
  victoryPointsFor1: z.number().int().min(0).max(300).optional(),
  victoryPointsAgainst1: z.number().int().min(0).max(300).optional(),
  victoryPointsFor2: z.number().int().min(0).max(300).optional(),
  victoryPointsAgainst2: z.number().int().min(0).max(300).optional(),
  paintedBonus1: z.boolean().optional(),
  paintedBonus2: z.boolean().optional(),
  lateListPenalty1: z.boolean().optional(),
  lateListPenalty2: z.boolean().optional(),
  isCompleted: z.boolean().optional(),
});

export const batchCreateIndividualMatchSchema = z.object({
  teamMatchId: z.string().min(1),
  pairings: z.array(z.object({
    id: z.string().optional(),
    player1Id: z.string().min(1),
    player2Id: z.string().min(1),
  })).min(1),
});

// Validation middleware factory
export function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }
    req.body = result.data;
    next();
  };
}
