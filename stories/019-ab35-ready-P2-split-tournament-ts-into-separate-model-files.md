---
id: 019-ab35
title: Split Tournament.ts into separate model files
status: ready
priority: P2
created: "2026-02-21T10:25:57.919Z"
updated: "2026-02-21T10:26:29.370Z"
dependencies: []
---

# Split Tournament.ts into separate model files

## Problem Statement

All 5 models (Tournament, Team, Player, TeamMatch, IndividualMatch) plus DDL plus interfaces are in one 440-line file (Tournament.ts).

## Acceptance Criteria

- [ ] Create separate model files per entity
- [ ] Keep shared DDL initialization in a dedicated db-init module
- [ ] Each model file should export its interface and model class

## Files

- server/src/models/Tournament.ts

## Work Log

