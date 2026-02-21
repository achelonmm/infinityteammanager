---
id: 009-4338
title: Fix error masking in initializeTournament
status: complete
priority: P1
created: "2026-02-21T10:25:21.901Z"
updated: "2026-02-21T10:46:21.661Z"
dependencies: []
---

# Fix error masking in initializeTournament

## Problem Statement

Catch block in TournamentContext treats ALL API errors as tournament doesnt exist, masking network errors, server 500s, auth failures, etc.

## Acceptance Criteria

- [ ] Check error type/status code
- [ ] Only treat 404 as tournament doesnt exist
- [ ] Surface real errors to the user with appropriate messages

## Files

- client/src/contexts/TournamentContext.tsx

## Work Log

### 2026-02-21T10:46:21.609Z - Added ApiError class with status code to api.ts. Updated getTournament to throw ApiError. Fixed initializeTournament to only create tournament on 404, surfacing real errors (network, 500) to the user.

