# Code Review: Full Repository - Infinity Team Manager
**Date:** 2026-02-21
**Reviewers:** Multi-Agent (security, performance, architecture, simplicity, silent-failure, test-quality, typescript, data-safety)
**Target:** All files in repository (initial codebase review)
**Branch:** main (commit 2ca5dc2)

## Summary
- **P1 Critical Issues:** 18 (deduplicated)
- **P2 Important Issues:** 25 (deduplicated)
- **P3 Nice-to-Have:** 12 (deduplicated)
- **Confidence Threshold:** 70 (default)
- **Filtered Out (below threshold):** 0

---

## P1 - Critical (Block Merge)

- [ ] **[SECURITY] Hardcoded admin password in client** `client/src/contexts/AuthContext.tsx:26` (Confidence: 98)
  - Issue: Plaintext password `Nano2025` hardcoded in client-side code, visible to anyone inspecting the bundle
  - Fix: Move authentication to server-side with proper password hashing (bcrypt) and session/JWT tokens
  - Agents: security, architecture, typescript, test-quality

- [ ] **[SECURITY] No server-side authentication** `server/src/server.ts` (Confidence: 98)
  - Issue: All API endpoints are completely public. Anyone can modify tournament data, delete teams/players
  - Fix: Add auth middleware (JWT or session-based), protect all mutation endpoints
  - Agents: security, architecture

- [ ] **[SECURITY] SQL injection via dynamic column names** `server/src/models/Tournament.ts:170-175` (Confidence: 95)
  - Issue: Dynamic UPDATE query builds column names from unvalidated user input: `Object.keys(updates).map(key => \`${key} = ?\`)`
  - Fix: Whitelist allowed column names before interpolation
  - Agents: security, data-safety

- [ ] **[SECURITY] Wildcard CORS configuration** `server/src/server.ts` (Confidence: 90)
  - Issue: `app.use(cors())` allows any origin to make authenticated requests
  - Fix: Configure explicit allowed origins
  - Agents: security

- [ ] **[SECURITY] localStorage auth bypass** `client/src/contexts/AuthContext.tsx` (Confidence: 92)
  - Issue: Auth state stored in localStorage with no server validation; trivially bypassable
  - Fix: Implement server-side sessions with HTTP-only cookies
  - Agents: security, typescript

- [ ] **[DATA] Team update deletes all players without transaction** `server/src/routes/teams.ts:117-133` (Confidence: 95)
  - Issue: DELETE ALL + INSERT loop pattern with no transaction boundary. Crash mid-operation = data loss
  - Fix: Wrap in `db.transaction()`, or use UPSERT pattern instead of delete-recreate
  - Agents: data-safety, silent-failure, architecture

- [ ] **[DATA] Team creation has no transaction boundary** `server/src/routes/teams.ts:15-50` (Confidence: 90)
  - Issue: Team INSERT + multiple Player INSERTs not wrapped in transaction
  - Fix: Wrap in `db.transaction()`
  - Agents: data-safety

- [ ] **[DATA] Batch individual match creation has no transaction** `server/src/routes/matches.ts:68-85` (Confidence: 90)
  - Issue: Multiple match INSERTs in a loop with no transaction
  - Fix: Wrap in `db.transaction()`
  - Agents: data-safety, silent-failure

- [ ] **[DATA] SQLite database committed to git** `server/data/tournament.db` (Confidence: 95)
  - Issue: Binary database file with player data (PII) is version-controlled
  - Fix: Add `*.db` to `.gitignore`, remove from tracking with `git rm --cached`
  - Agents: data-safety, security, architecture

- [ ] **[SIMPLICITY] Entire Knex database.ts is dead code** `server/src/config/database.ts` (Confidence: 98)
  - Issue: 108-line Knex configuration file imported on startup but never used for any queries. All actual DB access uses better-sqlite3 directly in Tournament.ts
  - Fix: Delete `database.ts`, remove import from `server.ts`, remove knex/sqlite3 from package.json
  - Agents: simplicity, architecture, data-safety

- [ ] **[SIMPLICITY] 4 unused npm dependencies** `server/package.json` (Confidence: 95)
  - Issue: `bcryptjs`, `jsonwebtoken`, `knex`, `sqlite3` are installed but never used in any code path
  - Fix: `npm uninstall bcryptjs jsonwebtoken knex sqlite3`
  - Agents: simplicity, architecture

- [ ] **[PERF] N+1 query: player fetch per team** `server/src/routes/tournaments.ts:45-60` (Confidence: 92)
  - Issue: For each team, a separate query fetches players. With 20 teams = 21 queries instead of 2
  - Fix: Batch fetch all players for tournament, group by teamId in JS
  - Agents: performance

- [ ] **[PERF] N+1 query: individual match fetch per team match** `server/src/routes/tournaments.ts:65-75` (Confidence: 90)
  - Issue: For each team match, a separate query fetches individual matches
  - Fix: Batch fetch all individual matches, group by teamMatchId
  - Agents: performance

- [ ] **[PERF] Double tournament fetch in updateIndividualMatch** `client/src/contexts/TournamentContext.tsx:358+384` (Confidence: 88)
  - Issue: `updateIndividualMatch` fetches the full tournament twice per call
  - Fix: Remove redundant fetch, use single response
  - Agents: performance

- [ ] **[SILENT] initializeTournament masks all errors** `client/src/contexts/TournamentContext.tsx` (Confidence: 92)
  - Issue: Catch block treats ALL API errors as "tournament doesn't exist", masking network errors, server errors, etc.
  - Fix: Check error type/status code, only treat 404 as "doesn't exist"
  - Agents: silent-failure

- [ ] **[SILENT] deleteRoundMatches no response.ok check** `client/src/contexts/TournamentContext.tsx:464` (Confidence: 90)
  - Issue: Uses raw `fetch` (not apiService) and doesn't check response status
  - Fix: Use apiService, check response, handle errors
  - Agents: silent-failure, typescript

- [ ] **[SILENT] Non-null assertions crash if INSERT fails** `server/src/models/Tournament.ts` (Confidence: 88)
  - Issue: All `create()` methods use `!` non-null assertion on `findById` after INSERT. If INSERT silently fails, app crashes with unhelpful error
  - Fix: Check if result is null, throw descriptive error
  - Agents: silent-failure, typescript

- [ ] **[TEST] Zero test coverage across entire codebase** (Confidence: 98)
  - Issue: Server has 0 tests. Client has 1 broken placeholder test. Critical business logic (scoring, pairing, rankings) is completely untested
  - Fix: Add tests for: rankingUtils, pairingUtils, statisticsUtils, Tournament model, route handlers, AuthContext
  - Agents: test-quality

---

## P2 - Important (Fix Before/After Merge)

- [ ] **[SECURITY] Raw req.body passed to model** `server/src/routes/matches.ts:78` (Confidence: 85)
  - Issue: Unvalidated request body passed directly to `IndividualMatchModel.create()`
  - Fix: Add input validation (zod schema) at route level
  - Agents: security, silent-failure

- [ ] **[SECURITY] No input validation on any route** `server/src/routes/*` (Confidence: 88)
  - Issue: No request body validation anywhere. All routes trust client input completely
  - Fix: Add zod schemas for all request bodies
  - Agents: security

- [ ] **[SECURITY] No rate limiting** `server/src/server.ts` (Confidence: 78)
  - Issue: No rate limiting on any endpoint
  - Fix: Add express-rate-limit middleware
  - Agents: security

- [ ] **[SECURITY] Sensitive data in console.log** `server/src/routes/teams.ts` (Confidence: 82)
  - Issue: Debug logging dumps full request bodies including player data
  - Fix: Remove debug logs or use structured logging (pino) with redaction
  - Agents: security, simplicity

- [ ] **[ARCH] God object: TournamentContext** `client/src/contexts/TournamentContext.tsx` (Confidence: 88)
  - Issue: 510+ lines, 25-member interface. Mixes data fetching, state management, business logic, and API calls
  - Fix: Split into domain-specific contexts (TeamsContext, MatchesContext, PairingsContext) or use useReducer
  - Agents: architecture

- [ ] **[ARCH] Raw fetch bypassing apiService** `client/src/contexts/TournamentContext.tsx:464` (Confidence: 85)
  - Issue: `deleteRoundMatches` uses raw `fetch()` instead of the apiService abstraction
  - Fix: Add `deleteTeamMatch` to apiService, use it consistently
  - Agents: architecture, typescript, simplicity

- [ ] **[ARCH] Manual snake_case/camelCase conversion duplicated** `server/src/routes/tournaments.ts`, `teams.ts` (Confidence: 82)
  - Issue: Same camelCase-to-snake_case mapping logic copy-pasted across multiple route files
  - Fix: Create shared mapper utility or configure at DB layer
  - Agents: architecture

- [ ] **[ARCH] All 5 models in one 440-line file** `server/src/models/Tournament.ts` (Confidence: 80)
  - Issue: Tournament, Team, Player, TeamMatch, IndividualMatch models + DDL + interfaces all in one file
  - Fix: Split into separate model files per entity
  - Agents: architecture

- [ ] **[ARCH] Route handlers contain business logic** `server/src/routes/*` (Confidence: 78)
  - Issue: No service layer; routes directly orchestrate DB operations
  - Fix: Extract service layer between routes and models
  - Agents: architecture

- [ ] **[ARCH] Hardcoded base URL in two locations** `client/src/services/api.ts`, `client/src/contexts/TournamentContext.tsx` (Confidence: 80)
  - Issue: `http://localhost:3001/api` hardcoded in both files
  - Fix: Use environment variable `REACT_APP_API_URL`
  - Agents: architecture, data-safety

- [ ] **[PERF] Missing database indexes on foreign keys** `server/src/models/Tournament.ts` (Confidence: 85)
  - Issue: No indexes on `team_id`, `tournament_id`, `team_match_id` columns used in WHERE/JOIN
  - Fix: Add CREATE INDEX statements in DDL
  - Agents: performance

- [ ] **[PERF] Duplicate refreshTournament/loadTournament** `client/src/contexts/TournamentContext.tsx` (Confidence: 82)
  - Issue: Two functions that do the same thing (fetch tournament by ID)
  - Fix: Remove one, use the other consistently
  - Agents: performance, simplicity

- [ ] **[PERF] Sequential savePairings** `client/src/contexts/TournamentContext.tsx` (Confidence: 80)
  - Issue: Pairings saved one-by-one in a loop with `await` each
  - Fix: Use `Promise.all()` or batch API endpoint
  - Agents: performance

- [ ] **[PERF] Sequential deleteRoundMatches** `client/src/contexts/TournamentContext.tsx` (Confidence: 80)
  - Issue: Matches deleted one-by-one in a loop
  - Fix: Add batch delete endpoint, or use `Promise.all()`
  - Agents: performance

- [ ] **[PERF] O(n^2) calculatePlayerPerformance** `client/src/utils/statisticsUtils.ts` (Confidence: 78)
  - Issue: Nested loops over all matches for each player
  - Fix: Pre-index matches by playerId
  - Agents: performance

- [ ] **[SIMPLICITY] Debug console.log in teams.ts** `server/src/routes/teams.ts` (Confidence: 90)
  - Issue: 10 debug `console.log` statements left in production code
  - Fix: Remove all debug logs
  - Agents: simplicity, security

- [ ] **[SIMPLICITY] Debug console.log in tournaments.ts** `server/src/routes/tournaments.ts` (Confidence: 90)
  - Issue: Debug logging (`RAW PLAYERS FROM DB:`) left in
  - Fix: Remove debug logs
  - Agents: simplicity

- [ ] **[SIMPLICITY] Debug console.log in TournamentContext** `client/src/contexts/TournamentContext.tsx` (Confidence: 88)
  - Issue: 12+ debug console.log statements
  - Fix: Remove or replace with proper logging
  - Agents: simplicity

- [ ] **[SIMPLICITY] Commented-out army validation in Registration.tsx** `client/src/pages/Registration.tsx` (Confidence: 85)
  - Issue: ~60 lines of commented-out code across 9 locations
  - Fix: Delete commented code (git has history)
  - Agents: simplicity

- [ ] **[SIMPLICITY] Duplicate tournament-point calculation** `client/src/components/IndividualMatchResultForm.tsx` (Confidence: 82)
  - Issue: `calculateTournamentPoints` reimplemented locally instead of using `rankingUtils`
  - Fix: Import and use the shared utility
  - Agents: simplicity

- [ ] **[TS] `any` type used extensively** `server/src/routes/matches.ts`, `teams.ts`, `client/src/pages/Pairings.tsx` (Confidence: 85)
  - Issue: `any` used for dbUpdates, pairing params, player detection, PairingSetupProps, onSave results
  - Fix: Define proper interfaces/types
  - Agents: typescript

- [ ] **[TS] useEffect missing dependency** `client/src/contexts/TournamentContext.tsx` (Confidence: 82)
  - Issue: useEffect with incomplete dependency array
  - Fix: Add missing deps or restructure effect
  - Agents: typescript

- [ ] **[TS] sortPlayerRankings mutates input array** `client/src/utils/rankingUtils.ts` (Confidence: 80)
  - Issue: `.sort()` mutates the passed-in array, which can cause unexpected behavior in React
  - Fix: Spread before sorting: `[...rankings].sort()`
  - Agents: typescript

- [ ] **[TS] Direct DOM manipulation for toasts** `client/src/components/LoginForm.tsx`, `Navigation.tsx` (Confidence: 78)
  - Issue: Creating DOM elements manually in React components for toast notifications
  - Fix: Use React state + portal, or a toast library (react-hot-toast)
  - Agents: typescript

---

## P3 - Nice-to-Have

- [ ] **[SECURITY] No CSRF protection** `server/src/server.ts` (Confidence: 72)
  - Fix: Add CSRF tokens for state-changing requests
  - Agents: security

- [ ] **[SECURITY] No security headers** `server/src/server.ts` (Confidence: 70)
  - Fix: Add helmet middleware
  - Agents: security

- [ ] **[ARCH] Multi-step mutations orchestrated from client** `client/src/contexts/TournamentContext.tsx` (Confidence: 72)
  - Fix: Move orchestration to server-side endpoints
  - Agents: architecture

- [ ] **[ARCH] Statistics.tsx uses hardcoded hex colors** `client/src/pages/Statistics.tsx` (Confidence: 70)
  - Fix: Use CSS variable system consistent with rest of app
  - Agents: architecture

- [ ] **[SIMPLICITY] Commented-out handleLoginSuccess** `client/src/components/Navigation.tsx` (Confidence: 78)
  - Fix: Delete commented code
  - Agents: simplicity

- [ ] **[SIMPLICITY] Commented-out dbDir block** `server/src/models/Tournament.ts` (Confidence: 78)
  - Fix: Delete commented code
  - Agents: simplicity

- [ ] **[SIMPLICITY] PairingSetup hardcoded to 3 matches** `client/src/pages/Pairings.tsx` (Confidence: 72)
  - Fix: Make configurable via tournament settings
  - Agents: simplicity

- [ ] **[PERF] console.log in render loop** `client/src/pages/Pairings.tsx:498-506` (Confidence: 75)
  - Fix: Remove debug logging from render path
  - Agents: performance

- [ ] **[PERF] Missing useMemo in Rankings** `client/src/pages/Rankings.tsx` (Confidence: 72)
  - Fix: Memoize ranking calculations
  - Agents: performance

- [ ] **[TS] Snake_case in client TypeScript interfaces** `client/src/types/index.ts` (Confidence: 72)
  - Fix: Use camelCase consistently in TS, convert at API boundary
  - Agents: typescript

- [ ] **[TS] Unused import of calculateIndividualTournamentPoints** `client/src/components/IndividualMatchResultForm.tsx` (Confidence: 75)
  - Fix: Remove unused import
  - Agents: typescript

- [ ] **[DATA] No unique constraint on its_pin or team name** `server/src/models/Tournament.ts` (Confidence: 70)
  - Fix: Add UNIQUE constraints to prevent duplicates
  - Agents: data-safety

---

## Cross-Cutting Analysis

### Root Causes Identified

| # | Root Cause | Findings Affected | Suggested Fix |
|---|------------|-------------------|---------------|
| 1 | **No server-side auth system** | Hardcoded password, no auth middleware, localStorage bypass, CORS wildcard | Implement JWT auth with bcrypt password hashing, add auth middleware |
| 2 | **No input validation** | SQL injection, raw req.body, `any` types, no zod schemas | Add zod validation at API boundary for all routes |
| 3 | **No transaction boundaries** | Team update data loss, team creation partial failure, batch match creation | Wrap all multi-statement operations in `db.transaction()` |
| 4 | **Dead Knex subsystem** | database.ts dead code, 4 unused deps, conflicting DB config | Delete database.ts, uninstall unused packages |
| 5 | **Debug code left in** | 30+ console.log statements, commented-out code blocks | Remove all debug logging, delete commented code |
| 6 | **No error handling strategy** | Masked errors, missing response checks, non-null assertions, silent failures | Define error handling patterns: typed errors, proper catch blocks, user notifications |
| 7 | **God context anti-pattern** | TournamentContext 510 lines, raw fetch, duplicate functions | Split context, add service layer |
| 8 | **Zero test coverage** | No unit tests, no integration tests, broken placeholder | Add test suite for business logic, models, and routes |

### Single-Fix Opportunities

1. **Auth middleware + JWT** - Fixes 5 findings (#1-5 in P1 security) (~100 lines)
2. **Zod validation schemas** - Fixes SQL injection + raw req.body + `any` types (~80 lines)
3. **Transaction wrapper utility** - Fixes 3 data safety P1s (~20 lines)
4. **Delete dead Knex code** - Fixes 2 P1s immediately (~5 minutes)
5. **Remove all console.log** - Fixes 4 P2s across server and client (~find and delete)

### Context Files (Read Before Fixing)

| File | Reason | Referenced By |
|------|--------|---------------|
| `server/src/models/Tournament.ts` | Core DB layer, all models, DDL, SQL patterns | security, data-safety, architecture, performance, silent-failure |
| `client/src/contexts/TournamentContext.tsx` | Central state management, all API interactions | architecture, performance, silent-failure, typescript, simplicity |
| `client/src/contexts/AuthContext.tsx` | Auth implementation, password storage | security, typescript, test-quality |
| `client/src/utils/rankingUtils.ts` | Core scoring/ranking business logic | test-quality, typescript, simplicity |
| `server/src/routes/teams.ts` | Team CRUD with data safety issues | data-safety, security, simplicity |

---

## Dependency Changes Detected

**`server/package.json` changed.** Run vulnerability scan before merge:

| Language | Command |
|----------|---------|
| TypeScript (server) | `cd server && npm audit` |
| TypeScript (client) | `cd client && npm audit` |

---

## Recommended Actions

1. **Immediate (Quick Wins):** Delete dead Knex code, remove unused deps, remove debug console.logs
2. **Before Merge:** Fix all P1 items - especially auth, SQL injection, transactions, and basic test coverage
3. **Follow-up:** Address P2 items (architecture refactoring, performance optimizations)
4. **Backlog:** P3 items as incremental improvements
