---
id: 022-aadc
title: Add database indexes on foreign keys
status: complete
priority: P2
created: "2026-02-21T10:25:57.922Z"
updated: "2026-02-21T10:48:37.650Z"
dependencies: []
---

# Add database indexes on foreign keys

## Problem Statement

No indexes on team_id, tournament_id, team_match_id columns used in WHERE and JOIN clauses. Queries will slow down as data grows.

## Acceptance Criteria

- [ ] Add CREATE INDEX statements for tournament_id on teams table
- [ ] Add CREATE INDEX for team_id on players table
- [ ] Add CREATE INDEX for tournament_id and team_match_id on matches tables
- [ ] Add indexes in DDL initialization

## Files

- server/src/models/Tournament.ts

## Work Log

### 2026-02-21T10:48:37.597Z - Added 5 indexes: idx_teams_tournament_id, idx_players_team_id, idx_team_matches_tournament_id, idx_team_matches_round (compound), idx_individual_matches_team_match_id. All use CREATE INDEX IF NOT EXISTS.

