# Task Tracker

A self-hosted project management tool for small–medium teams. A lightweight alternative to Jira/YouTrack.

## Features

- Multiple isolated workspaces per deployment
- Projects, tasks, boards (Kanban), iterations, time tracking
- Plugin architecture for workflows, reports, and integrations
- AI-ready data export (JSON/CSV)

## Tech Stack

- **Backend:** NestJS (TypeScript) - REST API + WebSocket + plugin engine
- **Frontend:** React + TypeScript + Tailwind CSS
- **State Management:** Zustand
- **Database:** PostgreSQL via Kysely
- **Testing:** Vitest
- **Monorepo:** Turborepo + pnpm workspaces

## Prerequisites

- Node.js 20+
- pnpm 8+
- PostgreSQL 15+

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Database

Start PostgreSQL using Docker:

```bash
docker-compose -f infra/docker-compose.yml up -d
```

Apply migrations:

```bash
pnpm db:migrate
```

Seed development data (optional):

```bash
pnpm db:seed
```

### 3. Start Development Servers

Start all apps (API + Web):

```bash
pnpm dev
```

Or start individually:

```bash
# API server (NestJS)
pnpm --filter @task-tracker/api dev

# Web app (React)
pnpm --filter @task-tracker/web dev
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all dependencies |
| `pnpm build` | Build all apps and packages |
| `pnpm dev` | Start development servers |
| `pnpm test` | Run all tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Run tests with coverage |
| `pnpm lint` | Run linting |
| `pnpm lint:fix` | Fix linting issues |
| `pnpm db:migrate` | Apply database migrations |
| `pnpm db:seed` | Seed development data |

## Project Structure

```
task-tracker/
├── apps/
│   ├── api/          # NestJS backend (REST + WebSocket + plugins)
│   ├── web/          # React frontend
│   └── cli/          # Installer CLI
├── packages/
│   ├── types/        # Shared TypeScript types
│   ├── ui/           # Shared React components
│   └── config/       # Shared tooling config
├── docs/
│   ├── plans/        # Product requirements
│   ├── specs/        # Feature specifications
│   └── adrs/         # Architecture decisions
├── infra/            # Infrastructure (Docker, etc.)
└── tests/            # Integration/e2e tests
```

## CLI

The installer CLI helps deploy Task Tracker to a VPS. Build and run:

```bash
cd packages/cli
pnpm build
node dist/index.js
```

## Documentation

- [Requirements](docs/plans/2026-02-27-task-tracker-requirements.md)
- [Specs](docs/specs/)
- [ADRs](docs/adrs/)

## License

MIT
