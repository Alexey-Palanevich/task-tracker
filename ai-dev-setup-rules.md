# Rules Templates

Templates for `.cursor/rules/` or `.windsurf/rules/` directory files.

---

## 1. Project Overview Rule (`.cursor/rules/project-overview.mdc`)

```markdown
---
description: Project overview, tech stack, and core conventions
alwaysApply: true
---

# [PROJECT_NAME]

[One-line description of the project]

## Tech Stack

- [Framework] ([Version])
- [Database] via [ORM]
- [Other key technologies]

## Naming Conventions

- Files and directories: **kebab-case**, no capital letters (e.g. `map-canvas.tsx`)
- Route params: **snake_case** to align with DB columns (e.g. `[project_id]`)
- DB columns: **snake_case** (e.g. `created_at`, `updated_at`)
- TypeScript interfaces/types: PascalCase
- Variables and functions: camelCase

## Key Directories

- `src/lib/` - Shared utilities
- `src/components/` - React components
- `docs/specs/` - Feature specifications
- `docs/adrs/` - Architecture Decision Records

## Before implementing a feature

- Check `docs/specs/` for existing specs
- Create or update a spec for the feature
```

---

## 2. Feature Workflow Rule (`.cursor/rules/feature-workflow.mdc`)

```markdown
---
description: Structured workflow for complex features that span more than one file
alwaysApply: true
---

# Feature Development Workflow

When a new feature request arrives, assess its scope. If the change touches **more than one file**, follow all six phases below in order. For single-file changes, implement directly.

## Phase 1 — Brainstorm

Goal: uncover edge cases and missing requirements before any code is written.

1. Read all relevant docs in `docs/specs/` and `docs/adrs/` to understand context.
2. Ask the user targeted questions about edge cases, constraints, and expected behavior.
3. After the user answers, identify **new** corner cases raised by those answers and ask again.
4. Repeat until no new edge cases surface. Summarize the agreed-upon scope and constraints.

Do **not** proceed until the user confirms the brainstorm is complete.

## Phase 2 — Plan

Goal: produce an implementation plan and a spec.

1. Create a detailed plan listing every file to add or modify, with a short description of each change.
2. Highlight dependencies between changes (e.g., "API route must exist before the hook can call it").
3. Present the plan and wait for user approval.
4. Once approved, create or update a spec in `docs/specs/` following `spec-management` rule conventions.

## Phase 3 — Implement (TDD)

Goal: deliver the feature with test coverage.

1. For each unit of work, **write the test first** (unit test is mandatory; integration/e2e where practical).
2. Then write the minimal production code to make the test pass.
3. Commit logical increments — don't batch unrelated changes.

## Phase 4 — Check

Goal: confirm the system is still healthy.

1. Run the full test suite: `npm test` (or project-specific command).
2. Run the build: `npm run build` to catch static/type errors.
3. If any failure exists, root-cause it, fix it, then re-run this phase from step 1.

## Phase 5 — Refactor

Goal: simplify without changing behavior.

1. Review all changes made in Phase 3 and look for duplication, unnecessary complexity, or naming improvements.
2. Apply simplifications.
3. If any code changed, re-run Phase 4 (Check) before continuing.

## Phase 6 — Present

Goal: hand off to the user for manual verification.

1. Ask the user to try the feature themselves.
2. If the user requests changes, implement them and then **update the spec** in `docs/specs/` to reflect the final state.
3. Re-run Phase 4 (Check) after any post-presentation changes.
```

---

## 3. Spec Management Rule (`.cursor/rules/spec-management.mdc`)

```markdown
---
description: How to create and maintain feature specs and ADRs
alwaysApply: true
---

# Spec and ADR Management

## When to Create

- **Spec**: Before implementing any new feature or significant change
- **ADR**: When making architecturally significant decisions (tech choices, patterns)

## Specs Location

- Feature specs: `docs/specs/NNNN-feature-name/spec.md` (sequential numbering)
- ADRs: `docs/adrs/NNNN-decision-name.md` (4-digit numbering)
- Update `docs/specs/index.md` and `docs/adrs/index.md` when adding new entries

## Spec Format

\`\`\`markdown

# Spec NNNN: Feature Name

Status: Proposed | In Progress | Completed | Deprecated
Date: YYYY-MM-DD

## Overview

[What and why]

## Requirements

- [Bullet list of requirements]

## Implementation Details

[Key files changed, approach]

## API Changes

[If any]

## Known Limitations

[If any]
\`\`\`

## ADR Format

\`\`\`markdown

# ADR-NNNN: Title

Status: Proposed | Accepted | Deprecated | Superseded
Date: YYYY-MM-DD

## Context

[What is the issue that we're seeing that is motivating this decision?]

## Decision

[What is the change that we're proposing and/or doing?]

## Consequences

[What becomes easier or more difficult to do because of this change?]
\`\`\`
```

---

## 4. Testing Conventions Rule (`.cursor/rules/testing-conventions.mdc`)

```markdown
---
description: Unit testing conventions
alwaysApply: true
---

# Testing Conventions

## Framework

- **[Vitest/Jest]** with coverage plugin
- Config: `[vitest.config.mts/jest.config.ts]` at project root

## Directory Structure

- Unit tests: `*.test.ts` next to source
- Integration and e2e Tests live in `tests/` at the project root (sibling of `src/`)

## Commands

- `npm test` — run all tests once
- `npm run test:watch` — run in watch mode
- `npm run test:coverage` — run with coverage report

## Writing Tests

- Import from testing framework: `describe`, `it`, `expect`, `vi`/`jest`, `beforeEach`
- Use `@/` path alias (same as production code)
- Mock external dependencies with `vi.mock()`/`jest.mock()` and `vi.fn()`/`jest.fn()`
- Each test file should cover: happy path, edge cases, error conditions

## TDD in Feature Workflow

- During Phase 3 (Implement) of the Feature Development Workflow (see `feature-workflow.mdc`), write the test **before** the production code
- Unit tests are mandatory for every new utility function and lib module
- Integration tests are encouraged for API routes and complex hooks
```

---

## 5. Framework-Specific Rule (`.cursor/rules/[framework]-conventions.mdc`)

Create this rule file for your specific framework. Example for Next.js:

```markdown
---
description: Next.js App Router conventions and patterns
globs: src/**/*.{ts,tsx}
alwaysApply: false
---

# Next.js Conventions

## Server vs Client Components

- Default to Server Components (no "use client" directive)
- Use "use client" only when needed: event handlers, hooks, browser APIs
- Fetch data in Server Components, pass as props to Client Components

## Data Fetching

- Use Server Components + async/await for page-level data
- Use Server Actions for mutations (form submissions, status changes)

## API Routes

- Place in `src/app/api/` following RESTful patterns
- Route params use snake_case: `[project_id]`, `[user_id]`
- Return `NextResponse.json()` with appropriate status codes
- Validate request bodies before processing

## File Naming

- All files kebab-case: `project-list.tsx`, `use-geojson.ts`
- Page files: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
- Route handlers: `route.ts`
```

---

## 6. Database Conventions Rule (`.cursor/rules/database-conventions.mdc`)

Create this rule file if your project uses a database. Example for PostgreSQL/Kysely:

```markdown
---
description: Database conventions and migration patterns
globs: src/**/*.{ts,tsx}
alwaysApply: false
---

# Database Conventions

## Naming

- Tables: **snake_case** (e.g., `user_events`)
- Columns: **snake_case** (e.g., `created_at`, `updated_at`)
- Primary keys: `id` (UUID or serial)
- Foreign keys: `[table]_id` (e.g., `user_id`)
- Indexes: `idx_[table]_[columns]` (e.g., `idx_users_email`)

## Migrations

- Use Kysely migration system
- Migrations live in `src/db/migrations/`
- Always use `CONCURRENTLY` for index creation
- Never write DOWN/rollback migrations

## Query Patterns

- Use typed Kysely query builder
- Prefer `select` with explicit columns over `select *`
- Use transactions for multi-step operations
- Handle connection errors gracefully
```
