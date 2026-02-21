---
id: 026-49e6
title: Remove commented-out code across codebase
status: complete
priority: P2
created: "2026-02-21T10:26:16.472Z"
updated: "2026-02-21T10:41:58.550Z"
dependencies: []
---

# Remove commented-out code across codebase

## Problem Statement

Registration.tsx has ~60 lines of commented-out army validation across 9 locations. Navigation.tsx has commented-out handleLoginSuccess. Tournament.ts has commented-out dbDir block.

## Acceptance Criteria

- [ ] Delete all commented-out code in Registration.tsx
- [ ] Delete commented-out handleLoginSuccess in Navigation.tsx
- [ ] Delete commented-out dbDir block in Tournament.ts
- [ ] Git history preserves the code if needed later

## Files

- client/src/pages/Registration.tsx
- client/src/components/Navigation.tsx
- server/src/models/Tournament.ts

## Work Log

### 2026-02-21T10:41:58.499Z - Removed all commented-out code: ~60 lines of army validation in Registration.tsx (getArmyValidation, getAvailableArmies filter, validation checks, JSX warnings), commented-out handleLoginSuccess in Navigation.tsx, commented-out dbDir block in Tournament.ts. Simplified Registration to use armies array directly.

