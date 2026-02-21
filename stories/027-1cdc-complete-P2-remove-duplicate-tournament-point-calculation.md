---
id: 027-1cdc
title: Remove duplicate tournament-point calculation
status: complete
priority: P2
created: "2026-02-21T10:26:16.472Z"
updated: "2026-02-21T10:48:13.485Z"
dependencies: []
---

# Remove duplicate tournament-point calculation

## Problem Statement

IndividualMatchResultForm.tsx reimplements calculateTournamentPoints locally instead of using the shared function from rankingUtils.ts. Also has unused import of calculateIndividualTournamentPoints.

## Acceptance Criteria

- [ ] Import and use calculateIndividualTournamentPoints from rankingUtils
- [ ] Remove local duplicate implementation
- [ ] Remove unused import

## Files

- client/src/components/IndividualMatchResultForm.tsx
- client/src/utils/rankingUtils.ts

## Work Log

### 2026-02-21T10:48:13.432Z - Removed 30-line local calculateTournamentPoints duplicate from IndividualMatchResultForm. Now imports and uses calculateTeamTournamentPoints from rankingUtils. Removed unused calculateIndividualTournamentPoints import.

