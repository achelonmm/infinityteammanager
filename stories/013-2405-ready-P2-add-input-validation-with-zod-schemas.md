---
id: 013-2405
title: Add input validation with zod schemas
status: ready
priority: P2
created: "2026-02-21T10:25:40.367Z"
updated: "2026-02-21T10:26:29.367Z"
dependencies: []
---

# Add input validation with zod schemas

## Problem Statement

No request body validation on any server route. All routes trust client input completely. Raw req.body passed directly to IndividualMatchModel.create() in matches.ts:78.

## Acceptance Criteria

- [ ] Add zod schemas for all request bodies (teams, players, matches, tournaments)
- [ ] Validate request body at route level before passing to models
- [ ] Return 400 with descriptive errors for invalid input

## Files

- server/src/routes/matches.ts
- server/src/routes/teams.ts
- server/src/routes/players.ts
- server/src/routes/tournaments.ts

## Work Log

