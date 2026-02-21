---
id: 028-16e5
title: Replace any types with proper interfaces
status: complete
priority: P2
created: "2026-02-21T10:26:16.473Z"
updated: "2026-02-21T11:17:04.149Z"
dependencies: []
---

# Replace any types with proper interfaces

## Problem Statement

Extensive any usage: dbUpdates in routes, pairing parameter in matches.ts, player captain detection, PairingSetupProps, onSave results in forms.

## Acceptance Criteria

- [ ] Define proper TypeScript interfaces for all any-typed parameters
- [ ] Type dbUpdates with specific allowed fields
- [ ] Type pairing and PairingSetupProps properly
- [ ] No any types remaining in modified files

## Files

- server/src/routes/matches.ts
- server/src/routes/teams.ts
- client/src/pages/Pairings.tsx
- client/src/components/IndividualMatchResultForm.tsx

## Work Log

### 2026-02-21T11:17:04.096Z - Replaced any types: PairingSetupProps uses Team/TeamMatch, player filters typed, onSave uses Partial<IndividualMatch>, captain find typed

