---
id: 008-1592
title: Fix double tournament fetch in updateIndividualMatch
status: ready
priority: P1
created: "2026-02-21T10:25:21.900Z"
updated: "2026-02-21T10:26:29.363Z"
dependencies: []
---

# Fix double tournament fetch in updateIndividualMatch

## Problem Statement

updateIndividualMatch in TournamentContext.tsx:358+384 fetches the full tournament data twice per call, doubling API traffic for every match result save.

## Acceptance Criteria

- [ ] Remove redundant tournament fetch
- [ ] Use single API response for the update flow

## Files

- client/src/contexts/TournamentContext.tsx

## Work Log

