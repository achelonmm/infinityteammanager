---
id: 017-0f98
title: Use apiService consistently for all API calls
status: ready
priority: P2
created: "2026-02-21T10:25:40.371Z"
updated: "2026-02-21T10:26:29.369Z"
dependencies: []
---

# Use apiService consistently for all API calls

## Problem Statement

deleteRoundMatches in TournamentContext.tsx:464 uses raw fetch() instead of the apiService abstraction. Missing deleteTeamMatch method in api.ts.

## Acceptance Criteria

- [ ] Add deleteTeamMatch method to apiService
- [ ] Replace raw fetch with apiService in deleteRoundMatches
- [ ] Audit for any other raw fetch calls bypassing apiService

## Files

- client/src/services/api.ts
- client/src/contexts/TournamentContext.tsx

## Work Log

