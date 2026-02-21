---
id: 016-255b
title: Split TournamentContext into smaller contexts
status: complete
priority: P2
created: "2026-02-21T10:25:40.371Z"
updated: "2026-02-21T11:26:21.485Z"
dependencies: []
---

# Split TournamentContext into smaller contexts

## Problem Statement

TournamentContext.tsx is 510+ lines with a 25-member interface. It mixes data fetching, state management, business logic, and API calls into one god object.

## Acceptance Criteria

- [ ] Split into domain-specific contexts (e.g., TeamsContext, MatchesContext, PairingsContext)
- [ ] Or refactor with useReducer to separate state logic from effects
- [ ] Each context should have a focused single responsibility
- [ ] Existing component consumers should not break

## Files

- client/src/contexts/TournamentContext.tsx

## Work Log

### 2026-02-21T11:26:21.434Z - Split TournamentContext into 3 domain-specific contexts: TournamentDataContext (core state), TeamsContext (team/player CRUD), MatchesContext (match operations). Combined useTournament hook maintained for backward compatibility.

