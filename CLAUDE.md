# CLAUDE.md - Task Tracker Development Guidelines

## Project Overview

Task Tracker is a self-hosted project management application for small–medium teams, providing a lightweight alternative to Jira/YouTrack. Core focus areas:

- Multiple isolated workspaces per deployment
- Projects, tasks, boards (Kanban), iterations, time tracking
- Plugin architecture for workflows, reports, and integrations
- AI-ready data export (JSON/CSV) for future LLM features

Authoritative product requirements live in `docs/plans/2026-02-27-task-tracker-requirements.md`. Always consult that file first for behavior questions.

**Applications (planned monorepo layout):**

- **Web App** (`apps/web`) – React + Tailwind workspace UI
- **API Server** (`apps/api`) – NestJS monolithic backend (REST + WebSocket + plugin engine)
- **CLI Installer** (`apps/cli`) – Node CLI for one-command VPS installation

**Packages:**

- **Shared Types** (`packages/types`) – Cross-app TypeScript models and API contracts
- **Shared UI** (`packages/ui`) – Reusable React components and layout primitives
- **Shared Config** (`packages/config`) – ESLint/Biome, TS, tooling configuration (optional)

## Quick Reference

Exact scripts will be finalized when the monorepo is scaffolded; use these as the target shape.

```bash
# Install dependencies
pnpm install

# Run all builds (apps + packages)
pnpm build

# Run all tests (Vitest)
pnpm test

# Lint and format (Biome)
pnpm lint
pnpm lint:fix

# Start development (web + api)
pnpm dev

# Database operations (with Kysely migrations)
pnpm db:migrate        # apply latest migrations
pnpm db:seed           # seed development data
```

---

## Critical Rules

### 1. Tech Stack (Authoritative for this repo)

- **Backend:** NestJS (TypeScript), monolithic app exposing:
  - REST API module (`/auth`, `/workspaces`, `/projects`, `/tasks`, `/boards`, `/exports`, etc.)
  - WebSocket module for real-time boards and notifications
  - Plugin engine for workflows, reports, imports/exports, git integration
- **Frontend:** React + TypeScript + Tailwind CSS
- **State Management:** Zustand for client-side app state
- **Database:** PostgreSQL
- **DB Access:** Kysely (typed SQL query builder)
- **Testing:** Vitest (unit + integration), with **≥ 80% coverage on critical paths**
- **Monorepo:** Turborepo + pnpm workspaces
- **Lint/Format:** Biome (single source of truth)

### 2. Test-Driven Development (Required)

TDD is **mandatory** for:

- Business logic and domain services (backend)
- Core utilities (backend and frontend)

For other areas (e.g., UI-only components), TDD is strongly encouraged but not strictly required.

**Workflow:**

1. Write a failing test first (Vitest).
2. Run tests and confirm the new test fails.
3. Implement the minimal production code to make the test pass.
4. Refactor while keeping tests green.
5. Repeat for each behavior.

**Coverage requirements:**

- Critical backend services (auth, task lifecycle, board operations, time tracking): **≥ 80% line + branch coverage**
- Core frontend logic (state stores, complex hooks): **≥ 80% line coverage**

### 3. Test Integrity

**Never modify tests just to make them pass.** When a test fails:

1. Understand **why** it fails.
2. Fix the implementation, not the test.
3. If the test is genuinely incorrect or obsolete, explain why in the PR/commit message before changing it.

**Do not delete or skip failing tests** without explicit user approval. When you believe a test is invalid:

- Describe the mismatch between test and requirements.
- Reference the relevant FR in `docs/plans/2026-02-27-task-tracker-requirements.md`.

### 4. Specification-Driven Development

All non-trivial work must follow a **spec-first** workflow.

- **Specs location:** `docs/specs/NNNN-feature-name/spec.md`
- **ADRs location:** `docs/adrs/NNNN-decision-name.md`
- **Indexes:** Keep `docs/specs/index.md` and `docs/adrs/index.md` in sync.

Each `spec.md` should include:

- Context and overview (why this feature exists)
- Functional requirements (FR-IDs and mapping to the global requirements doc where relevant)
- Acceptance criteria and explicit edge cases
- Test cases table with IDs mapped to FRs
- Implementation details (files, modules, APIs touched)

Feature lifecycle statuses:

- `Proposed` → `In Progress` → `Completed` → `Deprecated`

**Do not implement new behavior without either:**

- Updating an existing spec, or
- Creating a new spec and referencing the global requirements doc.

### 5. Architecture Decisions and ADRs

Architecturally significant decisions **must** be captured as ADRs in `docs/adrs/`.

Examples:

- Changing persistence technology or migration strategy
- Introducing a new external dependency (e.g., message broker)
- Altering plugin architecture or event contract
- Security-related choices (auth flow, session management)

Follow the ADR template (Context → Decision → Alternatives → Consequences). Always link specs and ADRs where relevant.

### 6. Migration Safety (Forward-Only)

Database schema changes go **only** through the migration system (Kysely migrations).

- Forward-only migrations: **no DOWN/rollback migrations**
- Migrations must be safe for rolling deployments and self-hosted upgrades.

Safe patterns:

| Operation           | Safe approach                                                           |
| ------------------- | ----------------------------------------------------------------------- |
| Add NOT NULL column | Add nullable → backfill data → add NOT NULL constraint (3 migrations)  |
| Remove column       | Stop using column in code → deploy → drop column in a later migration  |
| Rename column       | Add new column → copy data → switch code → drop old column later       |
| Add index           | Use `CREATE INDEX CONCURRENTLY`                                         |

Never run destructive SQL directly against production databases.

### 7. Database Operations (Migrations Only)

**Forbidden direct operations (outside migrations):**

- `CREATE/DROP/ALTER TABLE`
- `CREATE/DROP INDEX`
- Changing constraints

**Allowed direct operations (for debugging only):**

- `SELECT`, `EXPLAIN`, `ANALYZE`
- Viewing schema metadata

All schema evolution must go through scripted migrations executed via `pnpm db:migrate`.

---

## Code Style

### TypeScript

- `strict` mode enabled in `tsconfig.json`
- Avoid `any`; prefer:
  - Domain-specific types from `packages/types`
  - `unknown` when type is genuinely unknown, then narrow
- Use `import type` for type-only imports
- Prefer `const` over `let` where possible

### Formatting and Linting (Biome)

Biome is the single source of truth for linting and formatting:

- 2-space indentation
- Single quotes
- Trailing commas where valid
- Semicolons required
- 100-character line width

Run before committing:

```bash
pnpm lint
pnpm lint:fix
```

### Naming Conventions

| Thing              | Convention      | Example                |
| ------------------ | --------------- | ---------------------- |
| Files              | kebab-case      | `task-board.tsx`       |
| React components   | PascalCase      | `TaskBoard.tsx`        |
| Functions/variables| camelCase       | `createWorkspace()`    |
| Constants          | SCREAMING_SNAKE | `MAX_WORKSPACES`       |
| Types/interfaces   | PascalCase      | `Workspace`, `TaskDto` |
| DB tables          | snake_case      | `workspace_members`    |
| DB columns         | snake_case      | `created_at`           |

---

## Architecture and Project Structure

### High-Level Architecture

- **Monolith**: Single NestJS process exposing REST and WebSocket APIs plus plugin engine.
- **Client**: React SPA consuming REST + WebSocket, using Zustand for state.
- **Plugin system**: Event-based with extension points (workflows, reports, import/export, git integration).

### Planned File Structure (High-Level)

```text
project-root/
├── apps/
│   ├── api/          # NestJS monolith (REST + WS + plugins)
│   ├── web/          # React frontend
│   └── cli/          # Installer CLI
├── packages/
│   ├── types/        # Shared TypeScript types and API contracts
│   ├── ui/           # Shared React components
│   └── config/       # Shared lint/TS/tooling config (optional)
├── docs/
│   ├── plans/        # High-level requirements (e.g., task-tracker-requirements.md)
│   ├── specs/        # Feature specs (NNNN-feature-name/spec.md)
│   └── adrs/         # Architecture Decision Records
├── .cursor/
│   ├── rules/        # AI rules (project-overview, workflow, testing, etc.)
│   └── plans/        # Implementation plans
└── CLAUDE.md         # This file
```

---

## Testing

### Test Locations

- **Unit tests:** `*.test.ts` next to the source file
- **Integration/e2e tests:** `tests/` at the repo root (e.g., API route tests)

### Test Naming

Use descriptive `describe`/`it` blocks and reference FR IDs when relevant:

```typescript
// FR-3.5: Task history - all changes tracked
describe('TaskHistoryService', () => {
  it('records status changes with actor and timestamp', async () => {
    // ...
  });
});
```

---

## Development Workflow

All multi-file features should follow the 6-phase workflow encoded in `.cursor/rules/feature-workflow.mdc`:

1. **Brainstorm** – Explore requirements and edge cases, referencing:
   - `docs/plans/2026-02-27-task-tracker-requirements.md`
   - Existing specs in `docs/specs/`
2. **Plan** – Write or update the spec, list files to touch, define test strategy.
3. **Implement (TDD)** – Write tests first, then production code.
4. **Check** – Run tests (`pnpm test`), lint (`pnpm lint`), and build.
5. **Refactor** – Simplify while keeping tests green.
6. **Present** – Summarize changes, link FRs, and update specs/ADRs as needed.

### Avoiding Plan Mode Loops

Plan mode can sometimes get stuck in endless refinement cycles. To prevent this:

1. **Set a maximum of 3 iterations** for any single planning cycle. After 3 rounds of refinement, present the current plan and ask the user to decide whether to proceed or clarify further.

2. **Recognize "good enough"** – A plan that covers the main requirements with reasonable confidence is better than a perfect plan that takes hours to finalize. Present the plan and invite feedback rather than infinite refinement.

3. **Ask clarifying questions proactively** – Don't loop on assumptions. If something is unclear, ask the user directly rather than generating another iteration of the plan.

4. **Escalate when stuck** – If you're cycling between options without progress, clearly state the trade-offs and ask the user to choose a direction.

Branch naming (recommended, especially once git is in active use):

| Prefix     | Use case             |
| ---------- | -------------------- |
| `feat/`    | New features         |
| `fix/`     | Bug fixes            |
| `refactor/`| Internal refactors   |
| `docs/`    | Documentation only   |
| `chore/`   | Tooling/config chores|

---

## Common Mistakes to Avoid

### Do Not

1. Implement features without a corresponding spec entry.
2. Modify or delete tests to “make them pass” without updating specs/requirements.
3. Introduce silent breaking changes to the data model (e.g., dropping columns) without ADR + migration.
4. Create new modules/files when extending existing ones is sufficient.
5. Add features that are not traceable back to the requirements document.

### Do

1. Reference the global requirements (`docs/plans/2026-02-27-task-tracker-requirements.md`) when designing features.
2. Keep specs and ADRs up to date as the single source of truth.
3. Maintain high-quality tests with meaningful assertions and FR references.
4. Run `pnpm test`, `pnpm lint`, and `pnpm build` before merging.
5. Document non-obvious behavior and constraints in specs/ADRs, not just comments.

