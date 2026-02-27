# CLAUDE.md Template

Root instruction file template for AI-assisted development.

---

## Template

```markdown
# CLAUDE.md - [PROJECT_NAME] Development Guidelines

## Project Overview

[Brief description of what the project does and its purpose]

**Applications:**

- **[App Name]** (`apps/[app-name]`) - [Description]

**Packages:**

- **[Package Name]** (`packages/[package-name]`) - [Description]

## Quick Reference

\`\`\`bash

# Run all builds

npm run build

# Run tests

npm run test

# Lint and format

npm run lint
npm run lint:fix

# Start development

npm run dev

# Database operations (if applicable)

npm run db:migrate
npm run db:seed
\`\`\`

---

## Critical Rules

### 1. Test-Driven Development (Required for [specific areas])

**TDD is mandatory** for [list areas where TDD is required].

**Workflow:**

1. Write failing test first
2. Run test to confirm it fails
3. Write minimal code to pass
4. Refactor while keeping tests green
5. Repeat

**Coverage requirements:**

- [Area]: [X]%

### 2. Test Integrity

**NEVER modify tests just to make them pass.** If a test fails:

1. Understand WHY it fails
2. Fix the implementation, not the test
3. If the test is genuinely wrong, explain why before changing it

**NEVER delete or skip failing tests** without explicit user approval. If you believe a test is incorrect:

- Explain the issue
- Wait for confirmation before removing

### 3. Specification-Driven Development

**All work must follow the spec-first workflow:**

1. **Specs live in feature folders** under each package's `docs/specs/` directory
2. **Feature folder structure:**
   \`\`\`
   docs/specs/NNNN-feature-name/
   ├── spec.md # Main specification (all-in-one)
   ├── plan.md # Optional: implementation plan
   └── artifacts/ # Optional: supporting docs, diagrams, etc.
   \`\`\`

Each `spec.md` includes:

- Frontmatter: id, title, status, created, updated, keywords, related-adrs
- Context: Why the feature exists
- Requirements: Detailed FR sections with numbered IDs
- Acceptance Criteria: What must be verified
- Test Cases: Table mapping test cases to FRs
- Implementation Notes: Actual file paths, design decisions, divergences

3. **index.md maintenance** - Each package must maintain `docs/specs/index.md`:

- Lists all feature folders with status, keywords, and summary
- Provides entry point for Claude to find requirements
- Must be updated when features are added or status changes

4. **Feature lifecycle:**

- `Proposed` - Feature is designed but not yet implemented
- `In Progress` - Currently under development
- `Completed` - Feature is complete and merged
- `Deprecated` - Feature is no longer supported

**When implementing, reference these specs. Do not deviate without discussion.**

### 4. Architecture Decisions

Consult ADRs in `docs/adrs/` before making architectural choices.

### 5. Migration Safety (CI Enforced)

**Forward-only**: Never write DOWN/rollback migrations. Fix issues with new forward migrations.

**Backwards-compatible**: Every migration must work with current AND previous app version.

**Safe patterns:**

| Operation           | Safe Approach                                                 |
| ------------------- | ------------------------------------------------------------- |
| Add NOT NULL column | Add nullable → backfill → add constraint (3 migrations)       |
| Remove column       | Deploy app ignoring it → DROP with `migration-reviewed` label |
| Rename column       | Add new → copy → deploy using new → DROP old                  |
| Add index           | Always use `CONCURRENTLY`                                     |

**CI blocks these (unless `migration-reviewed` label):**

- `DROP COLUMN/TABLE`
- `RENAME` operations
- `NOT NULL` without default
- Non-concurrent index creation

**Run locally before pushing:**
\`\`\`bash
npm run lint:migrations
\`\`\`

### 6. Database Operations (Migration Script Only)

**NEVER run migrations or destructive SQL directly on the database.** All schema changes must go through the migration system.

**Allowed direct operations (read-only):**

- SELECT queries for debugging
- EXPLAIN/ANALYZE for query planning
- Viewing table structure with `\d`

**Forbidden direct operations:**

- CREATE/DROP/ALTER TABLE
- CREATE/DROP INDEX
- INSERT/UPDATE/DELETE (except through app)
- Any DDL statements

**Always use the migration script:**

\`\`\`bash

# Local development

npm run db:migrate

# The script handles:

# - Transactional migrations via Kysely

# - Non-transactional migrations (CONCURRENTLY) separately

# - Proper error handling and rollback

\`\`\`

**If migrations fail:** Fix the migration file and reset the database, don't run SQL directly.

---

## Code Style

### TypeScript

- Strict mode enabled
- Avoid `any` - use `unknown` if type is uncertain
- Use `import type` for type-only imports
- Prefer `const` over `let`

### Biome Configuration

Biome handles linting and formatting:

- 2-space indentation
- Single quotes
- Trailing commas (ES5)
- Semicolons required
- 100-character line width

Run `npm run lint:fix` before committing.

### Naming Conventions

| Type             | Convention      | Example               |
| ---------------- | --------------- | --------------------- |
| Files            | kebab-case      | `event-queue.ts`      |
| Components       | PascalCase      | `KPICard.tsx`         |
| Functions        | camelCase       | `calculateProgress()` |
| Constants        | SCREAMING_SNAKE | `MAX_BATCH_SIZE`      |
| Types/Interfaces | PascalCase      | `TriggerEvent`        |
| Database tables  | snake_case      | `user_events`         |

---

## Architecture Patterns

### State Management

[Describe state management approach]

## Testing

### Test File Location

- Unit tests: `*.test.ts` next to source
- Integration tests: `__tests__/` directory
- E2E tests: `e2e/` directory

### Test Naming

\`\`\`typescript
describe('ComponentName', () => {
describe('methodName', () => {
it('should do X when Y', () => {});
it('should throw when Z is invalid', () => {});
});
});
\`\`\`

---

## Common Mistakes to Avoid

### DO NOT

1. **Modify tests to pass** - Fix the implementation
2. **Skip failing tests** - Get approval first
3. **Use `any` type** - Use proper types or `unknown`
4. **Create new files when editing existing ones works** - Prefer edits
5. **Add features beyond what's specified** - Follow the specs

### DO

1. **Write tests first** for [specific areas]
2. **Reference specs** when implementing features
3. **Check ADRs** for architectural decisions
4. **Run `npm run lint:fix`** before committing
5. **Add proper error handling** - graceful degradation
6. **Commit with descriptive messages** following conventional commits

---

## Development Workflow

### Overview

All features follow: **Spec → Plan → Branch → TDD → Verify → PR → Review → Merge**

### 1. Specification (Required for new features)

Create a feature specification in `docs/specs/NNNN-feature-name/` using the spec template (see "Spec Management Rule" section):

- Functional Requirements with numbered IDs
- Test Cases table
- Implementation Checklist

For architectural decisions, create ADR in `docs/adrs/`.

**Skills**: `superpowers:brainstorming` to explore requirements.

### 2. Planning

Create implementation plan before coding:

- Identify files to modify
- Define test strategy
- Get user approval

**Skills**: `superpowers:writing-plans` for complex features.

### 3. Branch Setup

\`\`\`bash
git checkout develop && git pull
git checkout -b feat/<feature-name>
\`\`\`

#### Branch Naming Conventions

| Prefix      | Use Case             |
| ----------- | -------------------- |
| `feat/`     | New features         |
| `fix/`      | Bug fixes            |
| `refactor/` | Code restructuring   |
| `docs/`     | Documentation only   |
| `test/`     | Test additions/fixes |
| `chore/`    | Code style cleanup   |

### 4. Test-Driven Development

**Mandatory for development.**

Link tests to FR IDs:
\`\`\`typescript
// FR-X.Y.Z: <requirement from spec>
describe('featureName', () => {
it('should <behavior> (FR-X.Y.1)', () => {
// Test implementation
});
});
\`\`\`

TDD cycle:

1. Write failing test with FR reference
2. `npm test` - confirm failure
3. Implement minimal code
4. `npm test` - confirm pass
5. Refactor
6. Repeat

**Note**: FR linkage required for new tests only.

**Skills**: `superpowers:test-driven-development`

### 5. Verification

Before committing:
\`\`\`bash
npm run test # All tests pass
npm run lint # No lint errors
npm run build # Build succeeds
\`\`\`

Manual verification:

- API: Test with curl/REST client
- Frontend: Browser testing with `npm run dev` or using Playwright MCP

**Skills**: `superpowers:verification-before-completion`

### 6. Commits

Logical chunks with conventional format:
\`\`\`
<type>(<scope>): <description>

Implements FR-X.Y.Z.
[optional body]

Co-Authored-By: [Model credentials]
\`\`\`

### 7. Pull Request

\`\`\`bash
git push -u origin feat/<feature-name>
gh pr create --base develop
\`\`\`

Use PR template - includes FR traceability table. Add 'ai' label to the PR.

**Skills**: `superpowers:finishing-a-development-branch`

### 8. Code Review

Request automated review focusing on:

- FR implementation completeness
- Test-to-requirement linkage
- Security vulnerabilities (OWASP Top 10)
- Code patterns compliance

Reviews are posted directly to PR via `gh` CLI.

**Skills**: `code-review:code-review`, `superpowers:requesting-code-review`

### 9. Address Feedback

Severity triage:

| Level      | Action                  |
| ---------- | ----------------------- |
| Critical   | Must fix before merge   |
| Major      | Should fix before merge |
| Minor      | Fix or justify skipping |
| Suggestion | Consider for future     |

After fixes, request re-review if major changes made.

**Skills**: `superpowers:receiving-code-review`

### 10. Merge

1. Ensure CI passes
2. Get approval
3. Squash-merge (preferred) or rebase-merge
4. Delete feature branch

### Branch Protection (Recommended)

Configure on `develop` and `main`:

- Require pull request reviews (1+ approvals)
- Require status checks to pass (CI)
- Require branches to be up to date
- Do not allow bypassing settings

### Skill Quick Reference

| Phase           | Skill                                        |
| --------------- | -------------------------------------------- |
| Requirements    | `superpowers:brainstorming`                  |
| Planning        | `superpowers:writing-plans`                  |
| Development     | `superpowers:test-driven-development`        |
| Debugging       | `superpowers:systematic-debugging`           |
| Verification    | `superpowers:verification-before-completion` |
| Code Quality    | `superpowers:code-simplifier`                |
| PR Creation     | `superpowers:finishing-a-development-branch` |
| Code Review     | `code-review:code-review`                    |
| Review Response | `superpowers:receiving-code-review`          |
| Parallel Tasks  | `superpowers:dispatching-parallel-agents`    |

---

## File Structure Reference

### Frontend file structure

\`\`\`
project-root/
├── src/
│ ├── app/ # Application routes/pages
│ ├── components/ # Reusable UI components
│ ├── lib/ # Shared utilities
│ ├── hooks/ # Custom hooks
│ ├── stores/ # State management
│ └── types/ # TypeScript types
├── docs/
│ ├── specs/ # Feature specifications
│ └── adr/ # Architecture decisions
├── tests/ # Test files
└── CLAUDE.md # This file
\`\`\`

### Backend file structure

\`\`\`
project-root/
├── src/
│ ├── apps/ # Application routes/APIs
│ │ ├── [specific-app]/ # implements business value like a microservice.
│ │ └── [specific-app-2]/
│ ├── core/ # Reusable core logic
│ ├── lib/ # Shared utilities
│ ├── webhooks/ # separate webhooks handlers
│ ├── init/ # backend setup - docker, docker-compose, k8s, etc. setup
├── docs/
│ ├── specs/ # Feature specifications
│ └── adr/ # Architecture decisions
├── tests/ # e2e Test files
└── CLAUDE.md # This file
\`\`\`
```
