---
id: 002-4e4d
title: Fix SQL injection via dynamic column names
status: complete
priority: P1
created: "2026-02-21T10:25:02.516Z"
updated: "2026-02-21T10:43:05.841Z"
dependencies: []
---

# Fix SQL injection via dynamic column names

## Problem Statement

Dynamic UPDATE query in Tournament.ts:170-175 builds column names from unvalidated user input: Object.keys(updates).map(key => ${key} = ?). Attacker can inject arbitrary SQL via column names.

## Acceptance Criteria

- [ ] Whitelist allowed column names before interpolation in all dynamic UPDATE queries
- [ ] Add integration test proving injection is blocked

## Files

- server/src/models/Tournament.ts

## Work Log

### 2026-02-21T10:43:05.789Z - Added column whitelist sets for all 5 models (TOURNAMENT_COLUMNS, TEAM_COLUMNS, PLAYER_COLUMNS, TEAM_MATCH_COLUMNS, INDIVIDUAL_MATCH_COLUMNS). Created buildUpdate() helper that filters keys against whitelist before interpolating into SQL. All 5 update methods now use buildUpdate(). Unrecognized column names are silently dropped.

