---
id: 019-ab35
title: Split Tournament.ts into separate model files
status: complete
priority: P2
created: "2026-02-21T10:25:57.919Z"
updated: "2026-02-21T11:23:05.289Z"
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

### 2026-02-21T11:23:05.236Z - Split Tournament.ts into db.ts, types.ts, helpers.ts, and 5 entity model files. Tournament.ts now re-exports everything for backward compatibility.

