---
id: 010-72f8
title: Fix unchecked fetch in deleteRoundMatches
status: complete
priority: P1
created: "2026-02-21T10:25:21.902Z"
updated: "2026-02-21T10:46:21.767Z"
dependencies: []
---

# Fix unchecked fetch in deleteRoundMatches

## Problem Statement

deleteRoundMatches in TournamentContext.tsx:464 uses raw fetch() instead of apiService and does not check response.ok. Failed deletes are silently ignored.

## Acceptance Criteria

- [ ] Use apiService instead of raw fetch
- [ ] Check response status and handle errors
- [ ] Notify user on failure

## Files

- client/src/contexts/TournamentContext.tsx

## Work Log

### 2026-02-21T10:46:21.717Z - Added deleteTeamMatch method to apiService. Replaced raw fetch with apiService.deleteTeamMatch in TournamentContext.deleteRoundMatches. Now properly checks response status and throws on failure.

