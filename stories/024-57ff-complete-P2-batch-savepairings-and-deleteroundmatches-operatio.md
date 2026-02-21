---
id: 024-57ff
title: Batch savePairings and deleteRoundMatches operations
status: complete
priority: P2
created: "2026-02-21T10:25:57.923Z"
updated: "2026-02-21T11:17:04.362Z"
dependencies: []
---

# Batch savePairings and deleteRoundMatches operations

## Problem Statement

Pairings are saved one-by-one in a loop with await each. Matches are deleted one-by-one similarly. Both are sequential when they could be batched.

## Acceptance Criteria

- [ ] Add batch create endpoint for pairings on server
- [ ] Add batch delete endpoint for round matches on server
- [ ] Or use Promise.all() for parallel execution on client side
- [ ] Verify all-or-nothing behavior with transactions

## Files

- client/src/contexts/TournamentContext.tsx
- server/src/routes/matches.ts

## Work Log

### 2026-02-21T11:17:04.311Z - Added batch create/delete endpoints, added apiService methods, updated savePairings and deleteRoundMatches to use batch ops

