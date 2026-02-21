---
id: 029-2e5d
title: Fix useEffect missing dependency in TournamentContext
status: complete
priority: P2
created: "2026-02-21T10:26:16.474Z"
updated: "2026-02-21T11:17:03.714Z"
dependencies: []
---

# Fix useEffect missing dependency in TournamentContext

## Problem Statement

useEffect in TournamentContext.tsx has incomplete dependency array, which can cause stale closures or missed re-renders.

## Acceptance Criteria

- [ ] Add missing dependencies to useEffect array
- [ ] Or restructure effect to avoid the dependency
- [ ] Verify no infinite re-render loops introduced

## Files

- client/src/contexts/TournamentContext.tsx

## Work Log

### 2026-02-21T11:17:03.662Z - Wrapped initializeTournament in useCallback, added it to useEffect deps

