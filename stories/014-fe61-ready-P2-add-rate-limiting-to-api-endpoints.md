---
id: 014-fe61
title: Add rate limiting to API endpoints
status: ready
priority: P2
created: "2026-02-21T10:25:40.369Z"
updated: "2026-02-21T10:26:29.367Z"
dependencies: []
---

# Add rate limiting to API endpoints

## Problem Statement

No rate limiting on any endpoint. API can be hammered without restriction.

## Acceptance Criteria

- [ ] Add express-rate-limit middleware
- [ ] Configure reasonable limits for tournament management operations
- [ ] Return 429 with retry-after header when rate limited

## Files

- server/src/server.ts

## Work Log

