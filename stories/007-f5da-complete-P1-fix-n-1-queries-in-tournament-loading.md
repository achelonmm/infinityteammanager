---
id: 007-f5da
title: Fix N+1 queries in tournament loading
status: complete
priority: P1
created: "2026-02-21T10:25:21.899Z"
updated: "2026-02-21T11:17:03.822Z"
dependencies: []
---

# Fix N+1 queries in tournament loading

## Problem Statement

For each team, a separate query fetches players (tournaments.ts:45-60). For each team match, a separate query fetches individual matches (tournaments.ts:65-75). With 20 teams this means 21+ queries instead of 2-3.

## Acceptance Criteria

- [ ] Batch fetch all players for tournament and group by teamId
- [ ] Batch fetch all individual matches and group by teamMatchId
- [ ] Verify single tournament load uses <= 5 queries

## Files

- server/src/routes/tournaments.ts

## Work Log

### 2026-02-21T11:17:03.770Z - Added findByTeamIds and findByTeamMatchIds batch methods, replaced N+1 flatMap calls with single batch queries

