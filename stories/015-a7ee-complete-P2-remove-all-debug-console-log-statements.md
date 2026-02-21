---
id: 015-a7ee
title: Remove all debug console.log statements
status: complete
priority: P2
created: "2026-02-21T10:25:40.370Z"
updated: "2026-02-21T10:40:41.191Z"
dependencies: []
---

# Remove all debug console.log statements

## Problem Statement

30+ debug console.log statements across server and client code. teams.ts has 10 debug logs, tournaments.ts logs RAW PLAYERS FROM DB, TournamentContext has 12+ debug logs. Some log sensitive player data.

## Acceptance Criteria

- [ ] Remove all debug console.log from server routes (teams.ts, tournaments.ts, matches.ts, players.ts)
- [ ] Remove all debug console.log from TournamentContext.tsx
- [ ] Remove debug console.log from Pairings.tsx render path
- [ ] Consider adding structured logging (pino) for server if needed

## Files

- server/src/routes/teams.ts
- server/src/routes/tournaments.ts
- client/src/contexts/TournamentContext.tsx
- client/src/pages/Pairings.tsx

## Work Log

### 2026-02-21T10:40:41.140Z - Removed all debug console.log statements: 10 from teams.ts, 1 from tournaments.ts, 12 from TournamentContext.tsx, 3 from Pairings.tsx. Kept console.error for actual error handling and server startup log.

