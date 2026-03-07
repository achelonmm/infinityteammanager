# Infinity Team Manager

A web application for managing team-based tournaments for the **Infinity** tabletop miniature wargame by Corvus Belli. It handles team registration, automatic Swiss-system pairing generation, match result entry, and live rankings and statistics.

The app follows a **3-player-per-team** format: each team is paired against another team, and 3 individual player-vs-player matches are played within each team confrontation. Scoring uses tournament points, objective points, victory points, and a painted army bonus.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, React Router 7, CSS Modules |
| Backend | Express 5, TypeScript, Zod validation |
| Database | SQLite via better-sqlite3 |
| Auth | JWT (jsonwebtoken) + bcrypt password hashing |
| Icons | Lucide React |
| Testing | Jest + React Testing Library |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/achelonmm/infinityteammanager.git
cd infinityteammanager

# Install server dependencies
cd server
cp .env.example .env
npm install

# Install client dependencies
cd ../client
cp .env.example .env
npm install
```

### Running in Development

Start the server and client in two separate terminals:

```bash
# Terminal 1 - Server (http://localhost:3001)
cd server
npm run dev

# Terminal 2 - Client (http://localhost:3000)
cd client
npm start
```

The client proxies API requests to `http://localhost:3001/api` by default. The SQLite database is created automatically on first server start at `server/data/tournament.db`.

### Production Build

```bash
# Build server
cd server
npm run build    # Compiles TypeScript to server/dist/
npm start        # Runs node dist/server.js

# Build client
cd client
npm run build    # Outputs static files to client/build/
```

### Running Tests

```bash
cd client
npm test                              # Interactive watch mode
npm test -- --watchAll=false          # Single run
npm test -- --watchAll=false --coverage  # With coverage report
```

## Environment Variables

### Server (`server/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `JWT_SECRET` | `change-me-in-production` | Secret for signing JWT tokens |
| `ADMIN_PASSWORD_HASH` | *(bcrypt hash)* | Bcrypt hash of the admin password |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed CORS origins (comma-separated) |
| `DATA_DIR` | `./data` | Directory for the SQLite database file |

To generate a new password hash:

```bash
node -e "console.log(require('bcryptjs').hashSync('YourPassword', 10))"
```

### Client (`client/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `REACT_APP_API_URL` | `http://localhost:3001/api` | Base URL for API calls |

## Features

### Admin Pages (require login)

- **Dashboard** (`/`) -- Tournament overview with stat cards, team status, and army distribution
- **Tournaments** (`/tournaments`) -- Create, edit, delete, activate, and complete tournaments. Switch between tournaments. Rich cards showing team/match counts per tournament
- **Register Team** (`/registration`) -- Multi-step wizard to register a team with 3 players, army selections, and captain designation
- **Teams & Players** (`/teams`) -- Tabbed management of teams and players with search, edit, and delete
- **Pairings** (`/pairings`) -- Generate pairings (random round 1, Swiss system round 2+), set table assignments, configure individual player matchups, enter match results, advance rounds

### Public Pages

- **Rankings** (`/rankings`) -- Live team and player ranking tables with multi-tiebreaker sorting and match history modals
- **Statistics** (`/statistics`) -- Four tabs: Overview, Army Analysis, Player Performance, and Achievements

### Tournament System

- Multiple tournaments with status tracking (active/completed)
- One active tournament at a time, persisted in localStorage
- Swiss-system pairings with rematch avoidance
- Scoring: tournament points, objective points (0-10), victory points (0-300), painted army bonus
- Ranking tiebreakers: tournament pts > objective pts > VP difference > VP for > alphabetical
- CASCADE delete -- removing a tournament deletes all its teams, players, and matches

## Project Structure

```
infinityteammanager/
├── client/                          # React frontend (Create React App)
│   └── src/
│       ├── pages/                   # Route-level page components
│       ├── components/              # Shared UI components (modals, forms, nav)
│       ├── contexts/                # React Context providers (auth, tournament, teams, matches, toast)
│       ├── services/api.ts          # Centralized API client
│       ├── types/index.ts           # TypeScript interfaces
│       ├── hooks/                   # Custom React hooks
│       ├── utils/                   # Pure utility functions + tests
│       └── styles/design-tokens.css # CSS custom properties (dark theme)
│
├── server/                          # Express backend API
│   ├── data/tournament.db           # SQLite database (auto-created)
│   └── src/
│       ├── server.ts                # Express app setup, CORS, rate limiting
│       ├── routes/                  # REST endpoints (tournaments, teams, players, matches, auth)
│       ├── services/                # Business logic layer
│       ├── models/                  # SQLite queries via better-sqlite3
│       ├── middleware/auth.ts       # JWT authentication middleware
│       ├── validation/schemas.ts    # Zod request validation schemas
│       └── utils/caseMapper.ts      # snake_case (DB) <-> camelCase (API) mapping
│
└── plans/                           # Implementation plan documents
```

## API Endpoints

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | No | Login with admin password, returns JWT |

### Tournaments

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/tournaments` | No | List all tournaments with team/match counts |
| GET | `/api/tournaments/active` | No | Get the currently active tournament |
| GET | `/api/tournaments/:id` | No | Full tournament with teams, players, and matches |
| POST | `/api/tournaments` | Yes | Create a tournament |
| PUT | `/api/tournaments/:id` | Yes | Update tournament name/round/status |
| POST | `/api/tournaments/:id/activate` | Yes | Set as active (deactivates others) |
| POST | `/api/tournaments/:id/complete` | Yes | Mark as completed |
| DELETE | `/api/tournaments/:id` | Yes | Delete tournament and all related data |

### Teams

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/teams` | Yes | Create team with players |
| PUT | `/api/teams/:id` | Yes | Update team and/or players |
| DELETE | `/api/teams/:id` | Yes | Delete team |

### Players

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| PUT | `/api/players/:id` | Yes | Update player details |
| DELETE | `/api/players/:id` | Yes | Delete player |

### Matches

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/matches/team` | Yes | Create a team match |
| POST | `/api/matches/team/batch` | Yes | Batch create team matches |
| PUT | `/api/matches/team/:id` | Yes | Update team match |
| DELETE | `/api/matches/team/:id` | Yes | Delete team match |
| DELETE | `/api/matches/team/batch/:tournamentId/:round` | Yes | Delete all matches in a round |
| POST | `/api/matches/individual/batch` | Yes | Batch create individual matches |
| PUT | `/api/matches/individual/:id` | Yes | Update individual match scores |

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | No | Server health check |

## Database Schema

The SQLite database contains 5 tables with foreign key cascading:

```
tournaments
  ├── teams (tournament_id FK CASCADE)
  │     └── players (team_id FK CASCADE)
  └── team_matches (tournament_id FK CASCADE)
        └── individual_matches (team_match_id FK CASCADE)
```

Tables are created automatically on server startup. The schema is idempotent (`CREATE TABLE IF NOT EXISTS`).

## Authentication

The app uses a single-admin password model:

1. Admin logs in with a password at `/api/auth/login`
2. Server validates against the bcrypt hash in `ADMIN_PASSWORD_HASH` env var
3. On success, returns a JWT (`{ role: 'admin' }`, 24h expiry)
4. Client stores the token in localStorage and sends it as `Authorization: Bearer <token>` on mutation requests
5. `requireAuth` middleware validates the JWT on protected endpoints
6. Rate limiting: 300 requests per 15 minutes on all API routes
