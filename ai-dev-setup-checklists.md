# Setup Checklists

Checklists for setting up AI-first development infrastructure.

---

## Checklist: Adding AI Features to Legacy Projects

### Phase 1: Analysis

- [ ] Identify existing tech stack (framework, database, testing)
- [ ] Review current code conventions and patterns
- [ ] Document existing file structure
- [ ] Identify key architectural decisions already made

### Phase 2: Documentation Setup

- [ ] Create `CLAUDE.md` with project-specific context
- [ ] Create `docs/specs/` directory with index
- [ ] Create `docs/adrs/` directory with index
- [ ] Document existing architecture as ADRs

### Phase 3: Rules Setup

- [ ] Create `.cursor/rules/` or `.windsurf/rules/` directory
- [ ] Add `project-overview.mdc` (alwaysApply: true)
- [ ] Add `feature-workflow.mdc` (alwaysApply: true)
- [ ] Add `spec-management.mdc` (alwaysApply: true)
- [ ] Add framework-specific rules (globs-based)
- [ ] Add database-conventions.mdc (if applicable)

### Phase 4: Skills Setup (Optional)

- [ ] Create `.cursor/skills/` or `.agents/skills/` directory
- [ ] Add domain-specific skills for your project
- [ ] Create both SKILL.md and AGENTS.md for each skill

### Phase 5: IDE Configuration

- [ ] Create/update `.vscode/settings.json`
- [ ] Configure format on save
- [ ] Configure linting integration
- [ ] Configure import organization

### Phase 6: Workflow Integration

- [ ] Document existing testing approach in rules
- [ ] Define TDD requirements based on project needs
- [ ] Establish commit message format
- [ ] Define branch naming conventions

---

## Checklist: New Project Setup

### Phase 1: Project Scaffolding

- [ ] Initialize project with framework CLI
- [ ] Set up TypeScript configuration
- [ ] Configure linting (ESLint/Biome)
- [ ] Configure formatting (Prettier)
- [ ] Set up testing framework

### Phase 2: AI Infrastructure

- [ ] Create `CLAUDE.md` from template
- [ ] Create `.cursor/rules/` directory
- [ ] Add all rule files
- [ ] Create `.cursor/skills/` directory (if needed)
- [ ] Create `docs/specs/` and `docs/adrs/` directories

### Phase 3: Initial Documentation

- [ ] Create initial spec: `docs/specs/0001-project-setup/spec.md`
- [ ] Create initial ADR: `docs/adrs/0001-tech-stack.md`
- [ ] Update both index files

### Phase 4: IDE Setup

- [ ] Create `.vscode/settings.json`
- [ ] Add `.vscode/extensions.json` (recommended extensions)
- [ ] Configure debug settings if needed

### Phase 5: Git Configuration

- [ ] Create `.gitignore` with appropriate entries
- [ ] Consider adding `.gitattributes`
- [ ] Set up commit hooks (husky, lint-staged) if desired

---

## Quick Reference: Files to Create

### Required Files

| File                                    | Purpose                         |
| --------------------------------------- | ------------------------------- |
| `CLAUDE.md` or `AGENTS.md`              | Root instruction file           |
| `.cursor/rules/project-overview.mdc`    | Project overview and tech stack |
| `.cursor/rules/feature-workflow.mdc`    | 6-phase development workflow    |
| `.cursor/rules/spec-management.mdc`     | Spec and ADR conventions        |
| `.cursor/rules/testing-conventions.mdc` | Testing patterns                |
| `docs/specs/index.md`                   | Feature specs index             |
| `docs/adrs/index.md`                    | Architecture decisions index    |

### Optional Files

| File                                        | Purpose                           |
| ------------------------------------------- | --------------------------------- |
| `.cursor/rules/[framework]-conventions.mdc` | Framework-specific rules          |
| `.cursor/rules/database-conventions.mdc`    | Database patterns (if applicable) |
| `.cursor/skills/[domain]/SKILL.md`          | Domain-specific knowledge         |
| `.cursor/skills/[domain]/AGENTS.md`         | Quick reference guide             |
| `.vscode/settings.json`                     | IDE settings                      |
| `.vscode/extensions.json`                   | Recommended extensions            |
| `.editorconfig`                             | Cross-editor formatting           |
