# Spec 0001: Project Setup

Status: Proposed  
Date: 2026-02-27

Status: In Progress
Date: 2026-02-27

## Overview

Bootstrap the Task Tracker monorepo with foundational infrastructure for:

- Framework and tooling setup (NestJS, React, Turborepo, pnpm, Biome, Vitest).
- Database integration (PostgreSQL + Kysely) with migration patterns.
- AI-first workflow support (CLAUDE.md, `.cursor/rules/`, specs, ADRs).
- IDE configuration for a consistent development experience.

This spec focuses on project infrastructure only. Domain-specific features (workspaces, tasks, boards, etc.) are specified in `docs/plans/2026-02-27-task-tracker-requirements.md` and will be implemented in later specs.

## Requirements

- Monorepo structure with Turborepo and pnpm workspaces.
- Backend application skeleton using NestJS with TypeScript.
- Frontend application skeleton using React + TypeScript + Tailwind CSS.
- PostgreSQL integration via Kysely, with a migration directory structure.
- Vitest test runner configured for backend and frontend.
- Biome configured as the primary linter/formatter.
- AI-first development infrastructure:
  - `CLAUDE.md` with project guidelines.
  - `.cursor/rules/` containing project overview, workflow, specs, testing, and tech-specific rules.
  - `docs/specs/` and `docs/adrs/` with index files.

## Implementation Details

### Monorepo Structure

- Initialize a Turborepo-based monorepo with pnpm workspaces.
- Planned layout:
  - `apps/api/` – NestJS monolithic backend (REST + WebSocket + plugin engine).
  - `apps/web/` – React frontend (Tailwind, Zustand).
  - `apps/cli/` – CLI installer for VPS deployments.
  - `packages/types/` – Shared TypeScript models and API contracts.
  - `packages/ui/` – Shared UI components.

### Backend (NestJS)

- Create a NestJS app skeleton in `apps/api/` with:
  - Root module and basic health check endpoint.
  - Initial configuration for environment variables.
- Integrate Kysely for data access and define a location for migrations (e.g., `apps/api/src/db/migrations/`).

### Frontend (React)

- Create a React + TypeScript app skeleton in `apps/web/` with:
  - Tailwind CSS configured.
  - Basic layout component and placeholder pages.
  - Zustand store infrastructure ready for global state.

### Tooling and Infrastructure

- Add and configure:
  - Biome for linting and formatting.
  - Vitest for unit and integration tests.
  - TypeScript `tsconfig` files for root and per-app where appropriate.
  - Shared path aliases (e.g., `@/`).
- Ensure scripts are present for:
  - `pnpm build`
  - `pnpm test`
  - `pnpm lint`

### Documentation and AI Infrastructure

- Ensure the following files/directories exist and are populated:
  - `CLAUDE.md` with project guidelines and workflow.
  - `.cursor/rules/` with:
    - `project-overview.mdc`
    - `feature-workflow.mdc`
    - `spec-management.mdc`
    - `testing-conventions.mdc`
    - `nestjs-conventions.mdc`
    - `database-conventions.mdc`
    - `react-conventions.mdc`
  - `docs/specs/index.md` with entry for this spec.
  - `docs/adrs/index.md` with entry for ADR-0001 (Tech Stack Selection).
  - `docs/adrs/0001-tech-stack.md` describing the chosen stack.

## API Changes

For this spec, API changes are limited to:

- Defining a placeholder health check endpoint on the backend (e.g., `GET /health`) once the NestJS app is scaffolded.
- Full domain-specific API surface is defined in `docs/plans/2026-02-27-task-tracker-requirements.md` and will be implemented in subsequent specs.

## Known Limitations

- No business domain endpoints (workspaces, tasks, boards, etc.) are implemented as part of this spec.
- The plugin engine architecture will be elaborated and implemented in a dedicated spec.
- CI/CD workflows (tests, lint, build on push) and deployment scripts (CLI, web installer) will be covered in future specs.

