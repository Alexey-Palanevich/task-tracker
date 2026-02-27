# Specs and ADRs Templates

Templates for feature specifications and Architecture Decision Records.

---

## 1. Spec Index (`docs/specs/index.md`)

```markdown
# Feature Specifications

| #    | Name                                        | Status   | Date       |
| ---- | ------------------------------------------- | -------- | ---------- |
| 0001 | [Feature Name](./0001-feature-name/spec.md) | Proposed | YYYY-MM-DD |

<!-- Status options: Proposed, In Progress, Completed, Deprecated -->
```

---

## 2. ADR Index (`docs/adrs/index.md`)

```markdown
# Architecture Decision Records

| #    | Title                                      | Status   | Date       |
| ---- | ------------------------------------------ | -------- | ---------- |
| 0001 | [Decision Title](./0001-decision-title.md) | Accepted | YYYY-MM-DD |

<!-- Status options: Proposed, Accepted, Deprecated, Superseded -->
```

---

## 3. Feature Spec Template (`docs/specs/NNNN-feature-name/spec.md`)

```markdown
# Spec NNNN: Feature Name

Status: Proposed | In Progress | Completed | Deprecated
Date: YYYY-MM-DD

## Overview

[What is this feature and why does it exist?]

## Requirements

### FR-1: [Requirement Category]

- **FR-1.1**: [Specific requirement]
- **FR-1.2**: [Specific requirement]

### FR-2: [Requirement Category]

- **FR-2.1**: [Specific requirement]
- **FR-2.2**: [Specific requirement]

## Acceptance Criteria

- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

## Test Cases

| ID   | Description             | FR Reference | Status |
| ---- | ----------------------- | ------------ | ------ |
| TC-1 | [Test case description] | FR-1.1       | [ ]    |
| TC-2 | [Test case description] | FR-1.2       | [ ]    |
| TC-3 | [Test case description] | FR-2.1       | [ ]    |

## Implementation Details

### Files to Modify

- `src/path/to/file.ts` - [Description of changes]

### Files to Create

- `src/path/to/new-file.ts` - [Description]

## API Changes

[Document any API changes if applicable]

| Method | Endpoint        | Description   |
| ------ | --------------- | ------------- |
| GET    | `/api/resource` | [Description] |

## Known Limitations

- [List any known limitations or edge cases]

## Related ADRs

- [ADR-0001: Decision Title](../adrs/0001-decision-title.md)
```

---

## 4. Initial Spec Template (`docs/specs/0001-project-setup/spec.md`)

```markdown
# Spec 0001: Project Setup

Status: Completed
Date: YYYY-MM-DD

## Overview

Bootstrap the project with foundational infrastructure: framework setup, database, testing, AI-coding conventions, and initial pages.

## Requirements

- [Framework] with TypeScript
- [Database] via [ORM] with migration support
- [Testing framework] for unit and integration tests
- [UI framework/library]
- State management solution
- Feature specs and ADR documentation structure

## Implementation Details

### Infrastructure

[Describe key infrastructure decisions]

### Database

[Describe database setup, entities, migrations]

### API Routes

| Method | Route             | Description   |
| ------ | ----------------- | ------------- |
| GET    | `/api/[resource]` | [Description] |

### Components

| Component         | Path                    | Type          |
| ----------------- | ----------------------- | ------------- |
| `[ComponentName]` | `src/components/[path]` | Client/Server |

## API Changes

Initial API surface created.

## Known Limitations

- [List any known limitations]
```

---

## 5. ADR Template (`docs/adrs/NNNN-decision-name.md`)

```markdown
# ADR-NNNN: [Decision Title]

Status: Proposed | Accepted | Deprecated | Superseded
Date: YYYY-MM-DD

## Context

[What is the issue that we're seeing that is motivating this decision?]

- What is the problem?
- Why do we need to make a decision?
- What constraints exist?

## Decision

[What is the change that we're proposing and/or doing?]

- What option are we choosing?
- Why this option over alternatives?
- What trade-offs are we accepting?

## Alternatives Considered

### Option 1: [Name]

- **Pros**: [List pros]
- **Cons**: [List cons]
- **Why not chosen**: [Reason]

### Option 2: [Name]

- **Pros**: [List pros]
- **Cons**: [List cons]
- **Why not chosen**: [Reason]

## Consequences

### Positive

- [What becomes easier?]

### Negative

- [What becomes more difficult?]

### Risks

- [What risks does this introduce?]

## Related

- Related ADRs: [Link to related ADRs]
- Related Specs: [Link to related specs]
```
