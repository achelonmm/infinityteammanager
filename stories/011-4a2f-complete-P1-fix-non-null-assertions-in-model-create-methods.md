---
id: 011-4a2f
title: Fix non-null assertions in model create methods
status: complete
priority: P1
created: "2026-02-21T10:25:21.902Z"
updated: "2026-02-21T10:45:12.549Z"
dependencies: []
---

# Fix non-null assertions in model create methods

## Problem Statement

All create() methods in Tournament.ts use ! non-null assertion on findById after INSERT. If INSERT silently fails or returns unexpected ID, the app crashes with an unhelpful undefined error.

## Acceptance Criteria

- [ ] Check if findById result is null after INSERT
- [ ] Throw descriptive error if record not found after creation
- [ ] Add type narrowing instead of non-null assertions

## Files

- server/src/models/Tournament.ts

## Work Log

### 2026-02-21T10:45:12.499Z - Replaced all 5 non-null assertions (!) in create() methods with explicit null checks that throw descriptive errors. Affected: TournamentModel, TeamModel, PlayerModel, TeamMatchModel, IndividualMatchModel.

