# ADR-0001: Tech Stack Selection

Status: Accepted  
Date: 2026-02-27

## Context

Task Tracker is a self-hosted project management application targeting small–medium development teams, with requirements for:

- A monolithic server exposing REST and WebSocket APIs.
- A rich, responsive web UI (boards, iterations, time tracking).
- Plugin architecture for workflows, reports, imports/exports, and git integration.
- AI-ready exports and future automation capabilities.

The system must support:

- Type-safe, maintainable code across frontend and backend.
- 10,000+ tasks per workspace and 50+ workspaces per deployment.
- 100 concurrent users per deployment with performant boards and real-time updates.

We need a tech stack that:

- Fits a TypeScript-first monorepo.
- Has strong ecosystem support for REST, WebSockets, and plugins.
- Plays well with PostgreSQL and supports robust migration patterns.

## Decision

We choose the following stack as the foundation for Task Tracker:

- **Backend:** NestJS (TypeScript) monolith, with modules for REST API, WebSocket, and plugin engine.
- **Frontend:** React + TypeScript + Tailwind CSS for the web application.
- **State Management:** Zustand for client-side state (filters, selections, real-time connection status).
- **Database:** PostgreSQL as the primary relational database.
- **Database Access:** Kysely as the typed SQL query builder and migration framework.
- **Monorepo Tooling:** Turborepo + pnpm workspaces to manage apps and packages.
- **Testing:** Vitest for unit and integration tests across backend and frontend.
- **Linting/Formatting:** Biome as unified linter/formatter.

These choices will be reflected in `CLAUDE.md`, `.cursor/rules/`, and future scaffolding for `apps/` and `packages/`.

## Alternatives Considered

### Option 1: Express + Hand-Rolled Structure

- **Pros:**
  - Minimal overhead, very flexible.
  - Huge ecosystem, well-known by most Node developers.
- **Cons:**
  - No built-in module system or DI; architecture discipline would be manual.
  - WebSocket integration and plugin system would require more custom wiring.
  - Harder to maintain clear boundaries as the monolith grows.
- **Why not chosen:**
  - NestJS provides stronger architectural scaffolding (modules, DI, guards, pipes, gateways) that matches the complexity and longevity of Task Tracker.

### Option 2: Next.js Full-Stack (API Routes + React)

- **Pros:**
  - Unified frontend and backend in one framework.
  - Strong React story and ecosystem.
- **Cons:**
  - Task Tracker requirements call for a long-lived monolithic API server with a plugin engine and CLI installers, which fits better with a dedicated backend.
  - Tight coupling between app router and backend concerns can complicate plugin and installer architecture.
- **Why not chosen:**
  - A dedicated NestJS backend provides clearer separation between API server, CLI installer, and potential non-web clients.

### Option 3: Prisma instead of Kysely

- **Pros:**
  - Nice developer experience and schema DSL.
  - Built-in migration tooling.
- **Cons:**
  - Less direct control over SQL and some advanced patterns.
  - Kysely’s typed SQL approach aligns better with the need for explicit, performance-conscious queries and advanced indexing patterns.
- **Why not chosen:**
  - Kysely provides a good balance between type safety and control over SQL, which is important for performance-critical boards and reporting.

## Consequences

### Positive

- Strong, opinionated backend structure (NestJS) aligns with the complexity of Task Tracker’s domain and plugin system.
- Fully typed, end-to-end TypeScript story across monorepo.
- PostgreSQL + Kysely enables robust schema design and performance tuning for large workspaces and boards.
- Turborepo simplifies coordination between `apps/` and `packages/`, enabling clear separation of concerns.
- Vitest + Biome provide a modern, fast testing and linting toolchain.

### Negative

- NestJS adds framework-specific concepts (modules, decorators) that contributors must learn.
- Kysely requires more SQL familiarity than higher-level ORMs.
- Turborepo introduces another layer of tooling that needs maintenance.

### Risks

- If future requirements demand more granular service decomposition, we will need to extract services from the NestJS monolith or introduce additional services.
- Performance tuning for complex boards and reports will require careful query design and indexing; misuse of Kysely or PostgreSQL could cause bottlenecks.

## Related

- Specs:
  - `docs/specs/0001-project-setup/spec.md` (Project Setup)
- Plans:
  - `docs/plans/2026-02-27-task-tracker-requirements.md` (MVP Requirements)

