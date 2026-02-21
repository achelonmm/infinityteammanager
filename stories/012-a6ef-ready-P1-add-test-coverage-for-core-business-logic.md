---
id: 012-a6ef
title: Add test coverage for core business logic
status: ready
priority: P1
created: "2026-02-21T10:25:21.903Z"
updated: "2026-02-21T10:26:29.366Z"
dependencies: []
---

# Add test coverage for core business logic

## Problem Statement

Server has 0 tests. Client has 1 broken placeholder test (App.test.tsx searches for learn react text that doesnt exist). Critical business logic for scoring, Swiss pairing, and rankings is completely untested.

## Acceptance Criteria

- [ ] Add unit tests for rankingUtils (calculateIndividualTournamentPoints, calculateTeamTournamentPoints, sort functions)
- [ ] Add unit tests for pairingUtils (generatePairings, findBestTable)
- [ ] Add unit tests for statisticsUtils
- [ ] Fix or replace broken App.test.tsx
- [ ] Add integration tests for server route handlers
- [ ] Achieve at least 60% coverage on utility functions

## Files

- client/src/utils/rankingUtils.ts
- client/src/utils/pairingUtils.ts
- client/src/utils/statisticsUtils.ts
- client/src/App.test.tsx

## Work Log

