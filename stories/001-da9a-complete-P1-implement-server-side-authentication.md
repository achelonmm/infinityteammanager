---
id: 001-da9a
title: Implement server-side authentication
status: complete
priority: P1
created: "2026-02-21T10:25:02.514Z"
updated: "2026-02-21T11:34:27.133Z"
dependencies: []
---

# Implement server-side authentication

## Problem Statement

All API endpoints are completely public. Admin password Nano2025 is hardcoded in client-side code (AuthContext.tsx:26), visible to anyone inspecting the bundle. Auth state in localStorage is trivially bypassable. CORS wildcard allows any origin.

## Acceptance Criteria

- [ ] Add JWT or session-based auth with bcrypt password hashing on server
- [ ] Add auth middleware protecting all mutation endpoints
- [ ] Remove hardcoded password from client code
- [ ] Configure explicit CORS allowed origins
- [ ] Replace localStorage auth with HTTP-only cookies or token-based auth

## Files

- client/src/contexts/AuthContext.tsx
- server/src/server.ts

## Work Log

### 2026-02-21T11:34:27.080Z - Implemented JWT auth: server login endpoint with bcrypt password verification, auth middleware on all mutation routes, explicit CORS origins. Client: removed hardcoded password, AuthContext now calls server /api/auth/login, stores JWT token, includes Bearer token in API requests.

