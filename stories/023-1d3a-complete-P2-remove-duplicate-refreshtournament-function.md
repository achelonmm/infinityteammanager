---
id: 023-1d3a
title: Remove duplicate refreshTournament function
status: complete
priority: P2
created: "2026-02-21T10:25:57.923Z"
updated: "2026-02-21T10:48:13.372Z"
dependencies: []
---

# Remove duplicate refreshTournament function

## Problem Statement

TournamentContext has two functions (refreshTournament and loadTournament) that do the same thing - fetch tournament by ID.

## Acceptance Criteria

- [ ] Remove one duplicate function
- [ ] Update all callers to use the single remaining function
- [ ] Verify no behavior difference between the two

## Files

- client/src/contexts/TournamentContext.tsx

## Work Log

### 2026-02-21T10:48:13.319Z - Removed refreshTournament function (duplicate of loadTournament). Replaced all 5 refreshTournament() calls with loadTournament(tournament!.id).

