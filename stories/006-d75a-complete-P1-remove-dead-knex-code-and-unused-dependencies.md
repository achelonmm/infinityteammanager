---
id: 006-d75a
title: Remove dead Knex code and unused dependencies
status: complete
priority: P1
created: "2026-02-21T10:25:02.518Z"
updated: "2026-02-21T10:38:47.469Z"
dependencies: []
---

# Remove dead Knex code and unused dependencies

## Problem Statement

108-line Knex config file (database.ts) imported on startup but never used for queries. All actual DB access uses better-sqlite3 in Tournament.ts. Four npm packages (bcryptjs, jsonwebtoken, knex, sqlite3) installed but never imported.

## Acceptance Criteria

- [ ] Delete server/src/config/database.ts
- [ ] Remove initializeDatabase import from server.ts
- [ ] Run npm uninstall bcryptjs jsonwebtoken knex sqlite3
- [ ] Verify server starts and works correctly after removal

## Files

- server/src/config/database.ts
- server/src/server.ts
- server/package.json

## Work Log

### 2026-02-21T10:38:44.298Z - Deleted server/src/config/database.ts (108 lines dead Knex code). Removed initializeDatabase import from server.ts. Uninstalled bcryptjs, jsonwebtoken, knex, sqlite3, @types/bcryptjs, @types/jsonwebtoken, @types/sqlite3 (113 packages removed). Removed empty config/ directory. Server compiles cleanly.

