# Skills Templates

Templates for domain-specific skills in `.cursor/skills/` or `.agents/skills/`.

---

## 1. Skill Template (`skills/[domain]/SKILL.md`)

```markdown
---
name: [skill-name]
description: [Brief description of when to invoke this skill]
---

# [Skill Name]

[Detailed description of the domain knowledge]

## Quick Reference

### [Subtopic 1]

[Quick reference content with code examples]

### [Subtopic 2]

[More reference content]

## Common Patterns

### Pattern 1: [Name]

**Use case:** [When to use]

**Implementation:**

\`\`\`[language]
// Code example
\`\`\`

## When to Use This Skill

Invoke this skill when:

- [Condition 1]
- [Condition 2]
- [Condition 3]
```

---

## 2. Skill Quick Reference (`skills/[domain]/AGENTS.md`)

```markdown
# [Skill Name]

Quick reference for [domain] patterns and best practices.

## [Key Topic 1]

| Item | Description   |
| ---- | ------------- |
| [A]  | [Description] |
| [B]  | [Description] |

## Common Patterns

\`\`\`[language]
// Most common pattern
\`\`\`

## Debugging Tips

\`\`\`[language]
// Useful debugging commands/approaches
\`\`\`
```

---

## 3. Example: React Hooks Skill

### `skills/react-hooks/SKILL.md`

```markdown
---
name: react-hooks
description: Use when implementing custom React hooks or solving hook-related issues
---

# React Hooks

Comprehensive guide for implementing React hooks following best practices.

## Quick Reference

### Basic Hook Structure

\`\`\`typescript
import { useState, useCallback, useEffect } from 'react';

interface UseFeatureOptions {
initialValue?: string;
onChange?: (value: string) => void;
}

export function useFeature(options: UseFeatureOptions = {}) {
const [value, setValue] = useState(options.initialValue ?? '');

const handleChange = useCallback((newValue: string) => {
setValue(newValue);
options.onChange?.(newValue);
}, [options.onChange]);

return { value, handleChange };
}
\`\`\`

### Hook Rules

1. **Call hooks at the top level** - Not inside loops, conditions, or nested functions
2. **Call hooks from React functions** - Either function components or custom hooks
3. **Prefix custom hooks with `use`** - Convention for React to check for rule violations

## Common Patterns

### Pattern 1: Fetching Data

**Use case:** Loading data from an API with loading and error states

**Implementation:**

\`\`\`typescript
interface UseFetchResult<T> {
data: T | null;
isLoading: boolean;
error: Error | null;
refetch: () => void;
}

export function useFetch<T>(url: string): UseFetchResult<T> {
const [data, setData] = useState<T | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<Error | null>(null);

const fetchData = useCallback(async () => {
setIsLoading(true);
setError(null);
try {
const response = await fetch(url);
if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
const json = await response.json();
setData(json);
} catch (e) {
setError(e instanceof Error ? e : new Error('Unknown error'));
} finally {
setIsLoading(false);
}
}, [url]);

useEffect(() => {
fetchData();
}, [fetchData]);

return { data, isLoading, error, refetch: fetchData };
}
\`\`\`

### Pattern 2: Debounced Value

**Use case:** Handling user input with a delay (search, auto-save)

**Implementation:**

\`\`\`typescript
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
const [debouncedValue, setDebouncedValue] = useState(value);

useEffect(() => {
const timer = setTimeout(() => setDebouncedValue(value), delay);
return () => clearTimeout(timer);
}, [value, delay]);

return debouncedValue;
}
\`\`\`

## When to Use This Skill

Invoke this skill when:

- Creating a new custom hook
- Debugging hook dependency arrays
- Converting class components to hooks
- Optimizing re-renders with useMemo/useCallback
```

---

### `skills/react-hooks/AGENTS.md`

```markdown
# React Hooks

Quick reference for React hooks patterns and best practices.

## Hook Dependencies

| Hook          | Dependencies Guide                     |
| ------------- | -------------------------------------- |
| `useEffect`   | Include all values from component      |
| `useCallback` | Include all values used in callback    |
| `useMemo`     | Include all values used in calculation |

## Common Patterns

\`\`\`typescript
// Fetch with cleanup
useEffect(() => {
const controller = new AbortController();
fetch(url, { signal: controller.signal })
.then(res => res.json())
.then(setData);
return () => controller.abort();
}, [url]);

// Toggle hook
const useToggle = (initial = false) =>
useState(initial) as [boolean, () => void];
\`\`\`

## Debugging Tips

\`\`\`bash

# React DevTools Profiler

# Check for unnecessary re-renders

# ESLint plugin

npm install -D eslint-plugin-react-hooks
\`\`\`
```
