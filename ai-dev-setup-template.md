# AI-First Development Setup: Prompt Template

A comprehensive template for setting up AI-assisted development in JavaScript/TypeScript projects.

---

## How to Use This Template

Follow this workflow to set up AI-first development in your project:

### Step 1: Copy the Template

Copy this file (`ai-dev-setup-template.md`) into your project root directory (empty or legacy project).

### Step 2: Start Plan Mode

Open your AI assistant (Claude, Cursor, Windsurf, etc.) in Plan Mode and mention this file:

> "I want to set up AI-first development infrastructure. See `ai-dev-setup-template.md` for the template."

### Step 3: Answer Clarification Questions

The AI will ask you questions to fill in the placeholders (e.g., `[PROJECT_NAME]`, `[Framework]`, etc.). Typical questions include:

- **Project name**: What is your project called?
- **Project type**: New project or existing/legacy project?
- **Framework**: Next.js, React, Node.js, Express, etc.?
- **Database**: PostgreSQL, MongoDB, MySQL, None?
- **Testing framework**: Vitest, Jest, Playwright, None?
- **Styling**: Tailwind CSS, CSS Modules, Styled Components?
- **State management**: Zustand, Redux, None?
- **AI tool**: Cursor, Windsurf, Claude Code?
- **TDD requirements**: Which areas require test-driven development?
- **Coverage requirements**: What test coverage percentages?

### Step 4: Switch to Act Mode

Once all questions are answered, the AI will ask you to **toggle to Act mode**.

### Step 5: Automatic Setup

The AI will create all required files and directories:

> ⚠️ **IMPORTANT: Scope of Setup**
>
> This template creates **ONLY** the AI development infrastructure, **NOT** application code.
>
> **What TO Create:**
>
> - Root instruction file (`CLAUDE.md` or `AGENTS.md`)
> - Rules directory (`.cursor/rules/`)
> - Documentation structure (`docs/specs/`, `docs/adrs/`)
> - IDE settings (`.vscode/settings.json`)
> - Initial placeholder spec and ADR
> - Empty project scaffolding (package.json, tsconfig.json) IF NEEDED
>
> **What NOT TO Create:**
>
> - Business logic or domain entities
> - Application use cases or services
> - Infrastructure implementations
> - UI components or pages
> - Test files with actual test cases
> - Database schemas or migrations
>
> The AI infrastructure should be **project-agnostic** and ready to guide development of ANY project.

---

## Quick Start Prompt

> ⚠️ **NOTE**: Only create the infrastructure files listed below. Do NOT implement business logic, domain entities, use cases, UI components, or tests with actual test cases. See the "Scope of Setup" section above.

Copy and adapt this prompt when setting up AI-first development for a new or existing project:

```
Set up AI-first development infrastructure for this [new/existing] JavaScript/TypeScript project.

PROJECT CONTEXT:
- Project name: [YOUR_PROJECT_NAME]
- Framework: [Next.js / React / Node.js / Express / etc.]
- Database: [PostgreSQL / MongoDB / MySQL / None]
- Testing framework: [Vitest / Jest / Playwright / None]
- Styling: [Tailwind CSS / CSS Modules / Styled Components]
- State management: [Zustand / Redux / None]

CREATE THE FOLLOWING STRUCTURE:

1. ROOT INSTRUCTION FILE (CLAUDE.md or AGENTS.md)
   See: ai-dev-setup-claude-md.md

2. RULES DIRECTORY (.cursor/rules/ or .windsurf/rules/)
   See: ai-dev-setup-rules.md
   - project-overview.mdc (alwaysApply: true)
   - [framework]-conventions.mdc (globs: src/**/*.{ts,tsx})
   - database-conventions.mdc (if applicable)
   - testing-conventions.mdc
   - spec-management.mdc (alwaysApply: true)
   - feature-workflow.mdc (alwaysApply: true)

3. SKILLS DIRECTORY (.cursor/skills/ or .agents/skills/)
   See: ai-dev-setup-skills.md
   Create domain-specific skills as needed.

4. DOCUMENTATION STRUCTURE
   See: ai-dev-setup-specs-adrs.md
   docs/
   ├── specs/
   │   ├── index.md (feature status tracking)
   │   └── 0001-[feature-name]/spec.md
   └── adr/
       ├── index.md
       └── 0001-[decision-name].md

5. PLANS DIRECTORY (.cursor/plans/ or .windsurf/plans/)
   For storing implementation plans with progress tracking.

6. IDE SETTINGS (.vscode/settings.json)
   See: ai-dev-setup-ide.md

7. SUPERPOWERS SKILLS AND AGENTS
   Install the Superpowers skill collection from https://github.com/obra/superpowers
   Note: Adapt the installation paths based on your AI tool:
   - For Cursor: skills go to `.cursor/skills/`
   - For Windsurf/Claude Code: skills go to `.agents/skills/`

Use the setup checklists in ai-dev-setup-checklists.md to track progress.
```

---

## Template Files Reference

| File                         | Contents                                     |
| ---------------------------- | -------------------------------------------- |
| `ai-dev-setup-claude-md.md`  | Root instruction file template (CLAUDE.md)   |
| `ai-dev-setup-rules.md`      | Rules templates (.cursor/rules/\*.mdc)       |
| `ai-dev-setup-specs-adrs.md` | Spec and ADR templates                       |
| `ai-dev-setup-skills.md`     | Skills templates (SKILL.md, AGENTS.md)       |
| `ai-dev-setup-ide.md`        | IDE settings templates                       |
| `ai-dev-setup-checklists.md` | Setup checklists for legacy and new projects |

---

## Summary

The AI-first development setup provides:

1. **Context** - Root instruction file gives AI immediate project understanding
2. **Rules** - Automatic application of conventions based on file patterns
3. **Skills** - Deep domain knowledge for specialized areas
4. **Documentation** - Structured specs and ADRs for change tracking
5. **Workflow** - 6-phase feature development process
6. **IDE Integration** - Consistent developer experience

This structure enables AI assistants to:

- Understand project context immediately
- Follow established conventions automatically
- Maintain documentation as part of development
- Work through complex features systematically
- Ensure quality through TDD and verification phases
