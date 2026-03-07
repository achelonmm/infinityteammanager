# Implementation Plan: Tournament Management

**Created:** 2026-03-07
**Status:** Draft
**Estimated Effort:** M

## Summary

Add a tournament management system that allows the admin to create, edit, delete, and switch between tournaments. The app currently hardcodes a single tournament (`CURRENT_TOURNAMENT_ID = 'main-tournament'`). This feature replaces that with a persistent multi-tournament model where exactly one tournament is "active" at a time, completed tournaments become read-only history, and the selected tournament is stored in localStorage.

The backend already has full CRUD for tournaments. The work is primarily: (1) a database migration to add `status`, (2) extending the API to return team/match counts in the list, (3) a new `TournamentsContext` for list management, (4) refactoring `TournamentDataContext` to use localStorage-based selection instead of the hardcoded constant, and (5) a new `/tournaments` admin page.

## Research Findings

### Repository Patterns
- Pages follow a consistent structure: CSS Modules + global utility classes, `container animate-fade-in` wrapper, `card` sections, Lucide icons
- CRUD pages (e.g., `TeamsPlayers.tsx`) use modals via the `Modal` component for edit/create forms
- All mutations go through context functions that call `apiService.*` then `loadTournament()` to refresh state
- IDs are generated client-side using `${prefix}_${Date.now()}_${random}` pattern
- Delete confirmations use `toast.confirm()` with `variant: 'danger'`

### Backend State
- All 5 REST endpoints exist: `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`
- Validation schemas exist in `schemas.ts` (zod)
- CASCADE DELETE is wired at the DB level for all child tables
- `POST /api/tournaments` silently returns existing record on duplicate ID (returns `{ tournament, created: false }` but the route only forwards the tournament object)

### Gaps Identified
- No `status` column on `tournaments` table
- No team/match count in the list endpoint response
- `TournamentDataContext` hardcodes `CURRENT_TOURNAMENT_ID`
- No `UNIQUE` constraint on tournament name
- No indication in navigation of which tournament is active

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Active tournament model | One active at a time | Simpler UX for sequential tournament management |
| Status values | `active` / `completed` | Two states cover the use case; `draft` deferred |
| Persistence | localStorage | Matches existing auth pattern, survives refresh |
| Tournament cards | Rich (with counts) | Better UX, small API change |
| ID generation | Client-side (existing pattern) | Consistency with teams/players pattern |
| Name uniqueness | Enforce via UNIQUE constraint | Prevents confusion in list view |

## Implementation Order

### Step 1: Database migration — Add `status` column and UNIQUE name constraint

- **Implement:** `server/src/models/db.ts` — Add `ALTER TABLE tournaments ADD COLUMN status TEXT NOT NULL DEFAULT 'active'` in the `db.exec()` block after table creation. Add a check constraint (`CHECK(status IN ('active', 'completed'))`). Add `CREATE UNIQUE INDEX IF NOT EXISTS idx_tournaments_name ON tournaments(name)`.
- **Implement:** `server/src/models/types.ts` — Add `status: 'active' | 'completed'` to the `Tournament` interface.
- **Implement:** `server/src/utils/caseMapper.ts` — Add `status` mapping if needed (it's the same in both cases, so may not need explicit mapping, but verify).
- **Validation:** Server starts without errors. Existing `main-tournament` record gets `status = 'active'`.

### Step 2: Update backend types, validation, and service layer

- **Implement:** `server/src/validation/schemas.ts` — Add `status` to `createTournamentSchema` (optional, defaults to `'active'`) and `updateTournamentSchema`. Make `id` optional on create (generate server-side UUID as fallback if not provided, but keep backward compat).
- **Implement:** `server/src/services/tournamentService.ts`:
  - `create()`: Return 409 conflict response instead of silently returning existing record on duplicate name.
  - `getAll()`: Extend to return `teamCount` and `matchCount` via SQL JOINs/subqueries. Sort by `status` (active first), then `created_at DESC`.
  - Add `setActive(id)`: Sets the target tournament's status to `'active'` and sets all others to `'completed'` (within a transaction).
- **Implement:** `server/src/routes/tournaments.ts` — Add `POST /:id/activate` route (requireAuth). Update POST response to return 409 on duplicate name. Update GET list to include counts.
- **Implement:** `server/src/models/TournamentModel.ts` — Add `findAllWithCounts()` method that joins team and match counts. Add `setStatus(id, status)` method.
- **Validation:** API returns tournaments with `status`, `teamCount`, `matchCount`. POST with duplicate name returns 409. Activate endpoint works.

### Step 3: Update frontend types and API service

- **Implement:** `client/src/types/index.ts` — Add `status: 'active' | 'completed'` to `Tournament` interface. Add `teamCount?: number` and `matchCount?: number` fields for list responses. Remove `teams` and `teamMatches` from a new `TournamentSummary` type (or keep optional).
- **Implement:** `client/src/services/api.ts` — Add `activateTournament(id)` method. Update `createTournament` to handle 409 response. Ensure `getTournaments()` returns the enriched list.
- **Validation:** TypeScript compiles without errors.

### Step 4: Create TournamentsContext for list management

- **Implement:** `client/src/contexts/TournamentsContext.tsx` (new file) — A context dedicated to the tournament list (plural, separate from `TournamentDataContext` which manages the single active tournament's full data).
  - State: `tournaments: TournamentSummary[]`, `loading: boolean`, `error: string | null`
  - Actions: `loadTournaments()`, `createTournament(name)`, `updateTournament(id, updates)`, `deleteTournament(id)`, `activateTournament(id)`
  - On `activateTournament`: call API, refresh list, then trigger `switchTournament(id)` on `TournamentDataContext`
- **Implement:** `client/src/App.tsx` — Wrap the app with `TournamentsProvider` (outside `TournamentDataProvider` or as a sibling).
- **Validation:** Context compiles, provides tournament list data.

### Step 5: Refactor TournamentDataContext — Replace hardcoded ID with localStorage

- **Implement:** `client/src/contexts/TournamentDataContext.tsx`:
  - Remove `const CURRENT_TOURNAMENT_ID = 'main-tournament'`
  - Add `getActiveTournamentId()` helper: reads from `localStorage('infinityActiveTournamentId')`, falls back to fetching the active tournament from API
  - Add `switchTournament(id: string)` action: saves to localStorage, clears current state, calls `loadTournament(id)`
  - On mount (`initializeTournament`): use localStorage value if present, otherwise fetch the active tournament from the list
  - Expose `activeTournamentId` in context value
- **Validation:** App boots using localStorage tournament. Switching works. Refresh preserves selection.

### Step 6: Create the Tournaments page component

- **Implement:** `client/src/pages/Tournaments.tsx` (new file) — Follow `TeamsPlayers.tsx` patterns:
  - Page title with `Trophy` icon (from lucide-react)
  - Search/filter bar in a `card`
  - Tournament list as cards in a grid, grouped: "Active" section first, then "Completed" section
  - Each card shows: name, status badge (green for active, gray for completed), current round, team count, match count, created date
  - Action buttons per card: "Open" (switches to this tournament), "Edit" (opens modal), "Delete" (confirmation dialog)
  - "New Tournament" button in the section header
  - Empty state with CTA
  - Loading skeleton state
- **Implement:** `client/src/pages/Tournaments.module.css` (new file) — CSS Module following the design token palette (cyan accents, dark surfaces, gradient borders).
- **Validation:** Page renders with mock data, all states visible.

### Step 7: Create/Edit Tournament form modal

- **Implement:** `client/src/components/TournamentForm.tsx` (new file) — Follow `EditTeamForm.tsx` pattern:
  - Uses `Modal` component, `size="sm"`
  - Fields: Tournament name (required)
  - Mode: "create" or "edit" (reuse same component)
  - On create: calls `createTournament(name)` from `TournamentsContext`
  - On edit: calls `updateTournament(id, { name })` from `TournamentsContext`
  - Error handling for 409 duplicate name
  - Submit button with loading spinner
- **Implement:** `client/src/components/TournamentForm.module.css` (new file)
- **Validation:** Create and edit flows work end-to-end.

### Step 8: Wire routing and navigation

- **Implement:** `client/src/App.tsx` — Add `/tournaments` route wrapped in `<ProtectedRoute>`, rendering `<Tournaments />`
- **Implement:** `client/src/components/Navigation.tsx`:
  - Add `{ path: '/tournaments', label: 'Tournaments', icon: <Trophy size={16} /> }` to `adminNavItems`
  - Add an active tournament indicator in the nav header/sidebar showing the current tournament name
- **Validation:** Navigation shows "Tournaments" link for admin. Clicking navigates to the page. Active tournament name visible.

### Step 9: Handle delete safety and tournament switching edge cases

- **Implement:** Delete confirmation in `Tournaments.tsx`: Show team count and match count in the confirmation message ("This will permanently delete X teams, Y players, and all match history").
- **Implement:** When deleting the currently active tournament: auto-switch to the next active tournament, or show empty state if none remain.
- **Implement:** When switching tournaments, navigate to Dashboard (`/`) and clear stale state in `MatchesContext` (particularly the local `pairings` buffer).
- **Implement:** Add guard in `TournamentDataContext` for null tournament state (no tournament selected).
- **Validation:** Deleting active tournament doesn't crash the app. Switching tournaments clears stale data.

### Step 10: Mark tournament as completed

- **Implement:** Add "Mark as Completed" action button on active tournament cards in the list.
- **Implement:** When marking as completed: if it's the currently active tournament, prompt admin to select a new active tournament (or auto-select another active one).
- **Implement:** Completed tournaments in the list show a "Reactivate" option.
- **Validation:** Status transitions work. Only one active tournament at a time is enforced.

### Final: Integration testing and cleanup

- [ ] All tournament CRUD operations work end-to-end
- [ ] Tournament switching persists across page refresh
- [ ] Deleting active tournament gracefully handles state
- [ ] Navigation shows active tournament indicator
- [ ] Empty states render correctly
- [ ] Loading skeletons render correctly
- [ ] Lint clean (`npm run lint` in both client and server)
- [ ] Existing tests pass (`npm test` in client)
- [ ] No TypeScript errors

## Acceptance Criteria

- [ ] Admin can create a new tournament with a unique name
- [ ] Admin can see a list of all tournaments with name, status, round, team/match counts, and date
- [ ] Admin can edit a tournament's name
- [ ] Admin can delete a tournament (with cascade warning showing affected data counts)
- [ ] Admin can switch between tournaments — all pages reflect the selected tournament
- [ ] Admin can mark a tournament as completed (moves to history)
- [ ] Admin can reactivate a completed tournament
- [ ] Only one tournament is active at a time
- [ ] Selected tournament persists in localStorage across page refreshes
- [ ] The /tournaments page is admin-only (ProtectedRoute)
- [ ] Navigation shows a "Tournaments" link and the active tournament name
- [ ] Empty state shown when no tournaments exist
- [ ] Tournament name uniqueness enforced (409 error on duplicate)

## Security Considerations

- All mutating tournament endpoints already require `requireAuth` (JWT)
- `GET /api/tournaments` remains public (consistent with rankings/statistics being public)
- No sensitive data exposed in tournament list
- CASCADE delete is already enforced at DB level

## Performance Considerations

- Tournament list with counts uses SQL JOINs (single query) instead of N+1 requests
- localStorage read on boot is synchronous and fast
- Tournament switch clears and reloads data (one API call for the full tournament)
- No pagination needed initially (tournament counts will be low, typically < 50)

## Related Files

**Server (modify):**
- `server/src/models/db.ts` — Schema migration
- `server/src/models/types.ts` — Type update
- `server/src/models/TournamentModel.ts` — New queries
- `server/src/services/tournamentService.ts` — New methods, enriched list
- `server/src/routes/tournaments.ts` — New activate route, updated responses
- `server/src/validation/schemas.ts` — Schema updates
- `server/src/utils/caseMapper.ts` — Mapping update (if needed)

**Client (modify):**
- `client/src/types/index.ts` — Type update
- `client/src/services/api.ts` — New API methods
- `client/src/contexts/TournamentDataContext.tsx` — Remove hardcoded ID, add switchTournament
- `client/src/App.tsx` — New route, new provider
- `client/src/components/Navigation.tsx` — New nav item, active indicator

**Client (new):**
- `client/src/contexts/TournamentsContext.tsx` — Tournament list context
- `client/src/pages/Tournaments.tsx` — Tournament management page
- `client/src/pages/Tournaments.module.css` — Page styles
- `client/src/components/TournamentForm.tsx` — Create/edit modal form
- `client/src/components/TournamentForm.module.css` — Form styles

---

## Next Steps

When ready to implement, run:
- `/wiz:work plans/tournament-management.md` — Execute the plan
- `/wiz:deepen-plan` — Get more detail on specific sections
- `/wiz:brainstorming` — Discuss plan details
