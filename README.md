# Circles

A modern messaging and community platform. Build intentional communities around shared interests, projects, and teams.

## Architecture

This is a **pnpm monorepo** using [Turborepo](https://turbo.build):

```
circles/
├── apps/
│   ├── api/        # Express + TypeScript REST API
│   └── web/        # Next.js 14 frontend
└── packages/
    └── database/   # Prisma schema + shared client
```

### Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | Next.js 14 (App Router), Tailwind CSS, TypeScript |
| Backend     | Express, TypeScript                 |
| Database    | PostgreSQL via Prisma ORM           |
| Auth        | JWT (Bearer tokens)                 |
| Monorepo    | pnpm workspaces + Turborepo         |

## Getting Started

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9
- PostgreSQL

### Setup

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example apps/api/.env
cp .env.example apps/web/.env.local

# Edit the .env files with your DATABASE_URL and JWT_SECRET

# Push database schema
pnpm db:push

# Generate Prisma client
pnpm db:generate
```

### Development

```bash
# Run all apps in parallel
pnpm dev

# Or individually
pnpm --filter @circles/api dev      # API on :4000
pnpm --filter @circles/web dev      # Web on :3000
```

## Phase 1 Features

- **Auth**: Register, login, logout, JWT-based sessions
- **User profiles**: Display name, bio, avatar, status message
- **Circles**: Create, discover, join, and leave communities
- **Channels**: Text channels within each circle (auto-creates #general)
- **Notifications**: In-app notification feed with read/unread state

## API Reference

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Sign out |
| GET  | `/api/auth/me` | Current user |

### Circles
| Method | Path | Description |
|--------|------|-------------|
| GET    | `/api/circles` | List/discover circles |
| POST   | `/api/circles` | Create a circle |
| GET    | `/api/circles/:slug` | Get circle detail |
| POST   | `/api/circles/:slug/join` | Join circle |
| DELETE | `/api/circles/:slug/leave` | Leave circle |
| GET    | `/api/circles/:slug/members` | List members |
| POST   | `/api/circles/:slug/channels` | Create channel |

### Notifications
| Method | Path | Description |
|--------|------|-------------|
| GET    | `/api/notifications` | List notifications |
| PATCH  | `/api/notifications/:id/read` | Mark as read |
| POST   | `/api/notifications/read-all` | Mark all as read |

## Roadmap

- **Phase 2**: Real-time messaging (Socket.IO), voice/video (WebRTC), events, search
- **Phase 3**: AI features, integrations, mobile apps
