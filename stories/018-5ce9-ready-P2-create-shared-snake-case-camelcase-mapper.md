---
id: 018-5ce9
title: Create shared snake_case/camelCase mapper
status: ready
priority: P2
created: "2026-02-21T10:25:40.371Z"
updated: "2026-02-21T10:26:29.370Z"
dependencies: []
---

# Create shared snake_case/camelCase mapper

## Problem Statement

Same camelCase-to-snake_case mapping logic is copy-pasted across multiple route files (tournaments.ts, teams.ts).

## Acceptance Criteria

- [ ] Create shared mapper utility for camelCase to snake_case conversion
- [ ] Replace all duplicate conversion code with shared utility
- [ ] Consider configuring at DB layer level

## Files

- server/src/routes/tournaments.ts
- server/src/routes/teams.ts

## Work Log

