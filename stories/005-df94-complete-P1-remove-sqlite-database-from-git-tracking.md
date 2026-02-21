---
id: 005-df94
title: Remove SQLite database from git tracking
status: complete
priority: P1
created: "2026-02-21T10:25:02.518Z"
updated: "2026-02-21T10:39:04.761Z"
dependencies: []
---

# Remove SQLite database from git tracking

## Problem Statement

Binary database file server/data/tournament.db with player data (PII) is version-controlled. It will cause merge conflicts and exposes user data.

## Acceptance Criteria

- [ ] Add *.db to .gitignore
- [ ] Remove tournament.db from git tracking with git rm --cached
- [ ] Add README note about initializing empty database

## Files

- server/data/tournament.db
- .gitignore

## Work Log

### 2026-02-21T10:39:04.710Z - Added *.db and *.sqlite to .gitignore. Removed server/data/tournament.db from git tracking with git rm --cached. File remains on disk for local development.

