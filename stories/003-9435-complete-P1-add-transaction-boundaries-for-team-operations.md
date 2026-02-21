---
id: 003-9435
title: Add transaction boundaries for team operations
status: complete
priority: P1
created: "2026-02-21T10:25:02.517Z"
updated: "2026-02-21T10:44:27.425Z"
dependencies: []
---

# Add transaction boundaries for team operations

## Problem Statement

Team update (teams.ts:117-133) uses DELETE ALL + INSERT loop with no transaction. Team creation (teams.ts:15-50) also has no transaction. A crash mid-operation causes data loss.

## Acceptance Criteria

- [ ] Wrap team update (delete+recreate) in db.transaction()
- [ ] Wrap team creation (team+players insert) in db.transaction()
- [ ] Consider UPSERT pattern instead of delete-recreate for updates

## Files

- server/src/routes/teams.ts

## Work Log

### 2026-02-21T10:44:27.374Z - Wrapped team creation POST (team INSERT + player INSERTs) in db.transaction(). Wrapped team update PUT (team UPDATE + player DELETE ALL + player INSERTs) in db.transaction(). If any operation fails, all changes are rolled back.

