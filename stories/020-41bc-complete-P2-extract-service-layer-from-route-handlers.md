---
id: 020-41bc
title: Extract service layer from route handlers
status: complete
priority: P2
created: "2026-02-21T10:25:57.921Z"
updated: "2026-02-21T11:24:37.036Z"
dependencies: []
---

# Extract service layer from route handlers

## Problem Statement

No service layer exists. Route handlers directly orchestrate DB operations, mixing HTTP concerns with business logic.

## Acceptance Criteria

- [ ] Create service layer between routes and models
- [ ] Move business logic (multi-step operations, validations) to services
- [ ] Routes should only handle request parsing and response formatting

## Files

- server/src/routes/teams.ts
- server/src/routes/tournaments.ts
- server/src/routes/matches.ts

## Work Log

### 2026-02-21T11:24:36.985Z - Created service layer (tournamentService, teamService, matchService, playerService). Routes now only handle HTTP concerns, services own business logic, transactions, and case mapping.

