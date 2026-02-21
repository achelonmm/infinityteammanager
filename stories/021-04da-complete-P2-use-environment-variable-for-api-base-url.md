---
id: 021-04da
title: Use environment variable for API base URL
status: complete
priority: P2
created: "2026-02-21T10:25:57.922Z"
updated: "2026-02-21T11:17:03.606Z"
dependencies: []
---

# Use environment variable for API base URL

## Problem Statement

http://localhost:3001/api is hardcoded in api.ts and TournamentContext.tsx. Cannot deploy to different environments.

## Acceptance Criteria

- [ ] Use REACT_APP_API_URL environment variable
- [ ] Update api.ts to read from env
- [ ] Remove hardcoded URL from TournamentContext.tsx
- [ ] Add .env.example with the variable documented

## Files

- client/src/services/api.ts
- client/src/contexts/TournamentContext.tsx

## Work Log

### 2026-02-21T11:17:03.554Z - Added REACT_APP_API_URL env var support in api.ts, created client/.env.example

