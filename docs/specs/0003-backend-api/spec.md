# Spec 0003: Backend API

Status: Proposed
Date: 2026-02-28

## Overview

Implementation of the core backend REST API and WebSocket infrastructure to support all functional requirements (FR-1 through FR-14) from the global requirements document. This spec covers authentication, workspaces, projects, tasks, boards, labels, comments, time tracking, iterations, and export functionality.

## Requirements

### Authentication (FR-9)

- FR-9.1: Local authentication with email/password and email verification
- FR-9.2: OAuth providers: Google, GitHub (configurable)
- FR-9.3: Password reset via email
- FR-9.4: Session management with view active sessions and logout capability

### Workspace Management (FR-1)

- FR-1.1: Create multiple workspaces within a single deployment
- FR-1.2: Each workspace has isolated data
- FR-1.3: Workspace settings include name, description, and icon/logo
- FR-1.4: Users can be members of multiple workspaces
- FR-1.5: Workspace roles: Owner, Admin, Member, Guest (read-only)

### Project Management (FR-2)

- FR-2.1: Create projects within a workspace
- FR-2.2: Projects are flat (no sub-projects)
- FR-2.3: Project settings include name, description, color/icon
- FR-2.4: Projects can be archived (soft delete)
- FR-2.5: Custom task statuses per project (configurable workflow)

### Task Management (FR-3)

- FR-3.1: Tasks belong to a project
- FR-3.2: Task fields: title, description (markdown), status, priority, assignee(s), labels, due date
- FR-3.3: Tasks support multiple assignees
- FR-3.4: Task priority levels: Critical, High, Medium, Low, None
- FR-3.5: Task history: all changes tracked (who, what, when)
- FR-3.6: Task relations: blocks, blocked by, relates to, duplicates
- FR-3.7: Subtasks: tasks can have child tasks (single level only)
- FR-3.7.1: Subtasks cannot have their own subtasks
- FR-3.7.2: Deleting task with subtasks warns user; cascade delete if confirmed
- FR-3.8: Task estimates: optional time estimate field

### Boards (FR-4)

- FR-4.1: Boards display tasks grouped by status
- FR-4.2: Tasks can be dragged between columns (status changes)
- FR-4.3: Boards can be filtered by assignee, label, priority
- FR-4.4: Boards can be scoped to a project or show all workspace tasks
- FR-4.5: Column order and visibility can be customized

### Labels (FR-5)

- FR-5.1: Labels are workspace-level (shared across projects)
- FR-5.2: Labels have name and color
- FR-5.3: Tasks can have multiple labels
- FR-5.4: Labels can be created/edited/deleted by workspace admins

### Comments (FR-6)

- FR-6.1: Users can add comments to tasks
- FR-6.2: Comments support markdown formatting
- FR-6.3: Comments can mention users (@username) with notifications
- FR-6.4: Comments can be edited/deleted by author
- FR-6.5: Comment edit history preserved

### Time Tracking (FR-7)

- FR-7.1: Users can log time spent on tasks
- FR-7.2: Time entries have: duration, date, optional description
- FR-7.3: Users can start/stop timer on a task (real-time tracking)
- FR-7.4: Time reports: filter by user, project, date range
- FR-7.5: Time entries can be edited/deleted

### Iterations/Sprints (FR-8)

- FR-8.1: Iterations are time-boxed periods with start/end dates
- FR-8.2: Tasks can be assigned to an iteration
- FR-8.3: Iteration views show tasks in current iteration
- FR-8.4: Iteration reports show planned vs completed

### Export & Reporting (FR-11)

- FR-11.1: Export tasks to JSON (for AI/LLM consumption)
- FR-11.2: Export tasks to CSV
- FR-11.3: Export filtered data (by project, date range, assignee)
- FR-11.4: Dashboard with key metrics

### Git Integration (FR-14)

- FR-14.1: Tasks can be linked to external Git repositories
- FR-14.2: Link tasks to specific Pull Requests/Merge Requests
- FR-14.3: Link tasks to specific branches
- FR-14.4: Multiple PRs/MRs can be linked to a single task
- FR-14.5: Manual linking via branch name or PR/MR URL
- FR-14.6: Task view displays all linked branches and PRs/MRs

### Notifications (FR-10)

- FR-10.1: In-app notifications for task assigned, mentioned, status changed
- FR-10.2: Email notifications (configurable per user)
- FR-10.3: Notification preferences per user

## Implementation Details

### Architecture

```
Backend API (NestJS Monolith)
├── REST API Module
│   ├── Auth Controller
│   ├── Workspaces Controller
│   ├── Projects Controller
│   ├── Tasks Controller
│   ├── Boards Controller
│   ├── Labels Controller
│   ├── Comments Controller
│   ├── Time Entries Controller
│   ├── Iterations Controller
│   ├── Export Controller
│   ├── Git Links Controller
│   ├── Notifications Controller
│   └── Users Controller
├── WebSocket Module
│   ├── Board Gateway (real-time updates)
│   └── Notifications Gateway
├── Plugin Engine Module
│   ├── Event Bus
│   ├── Hook Registry
│   └── Extension Points
└── Database Layer (Kysely)
    └── Migrations
```

### Data Model

#### Core Database Tables

| Table | Purpose |
|-------|---------|
| `users` | System users with auth data |
| `workspaces` | Top-level isolated tenants |
| `workspace_members` | User-workspace membership with roles |
| `projects` | Groups of tasks within workspace |
| `statuses` | Custom task statuses per project |
| `tasks` | Work items |
| `task_assignees` | Many-to-many task-user assignments |
| `task_labels` | Many-to-many task-label relations |
| `task_relations` | Task-to-task relations (blocks, relates to, etc.) |
| `task_history` | Audit trail of task changes |
| `comments` | Task discussions |
| `comment_edit_history` | Comment edit tracking |
| `time_entries` | Logged work time |
| `iterations` | Time-boxed periods |
| `labels` | Workspace-level tags |
| `boards` | Kanban board configurations |
| `board_columns` | Board columns with order |
| `git_links` | Git repository/branch/PR links |
| `notifications` | User notifications |
| `sessions` | Active user sessions |
| `oauth_accounts` | OAuth provider associations |

### API Endpoints

#### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /auth/register | Create account | No |
| POST | /auth/login | Authenticate | No |
| POST | /auth/logout | End session | Yes |
| POST | /auth/forgot-password | Request password reset | No |
| POST | /auth/reset-password | Reset with token | No |
| GET | /auth/oauth/:provider | OAuth redirect | No |
| GET | /auth/oauth/:provider/callback | OAuth callback | No |
| GET | /auth/me | Get current user | Yes |
| GET | /auth/sessions | List active sessions | Yes |
| DELETE | /auth/sessions/:sessionId | Revoke session | Yes |

#### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /users/me | Get current user profile | Yes |
| PUT | /users/me | Update current user | Yes |
| PUT | /users/me/password | Change password | Yes |
| PUT | /users/me/notification-preferences | Update notification settings | Yes |
| GET | /users/:id | Get user by ID | Yes |
| GET | /workspaces/:id/users | List workspace users | Yes |

#### Workspaces

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /workspaces | List user workspaces | Yes |
| POST | /workspaces | Create workspace | Yes |
| GET | /workspaces/:id | Get workspace | Yes |
| PUT | /workspaces/:id | Update workspace | Yes |
| DELETE | /workspaces/:id | Delete workspace | Yes (Owner) |
| GET | /workspaces/:id/members | List members | Yes |
| POST | /workspaces/:id/members | Add member | Yes (Admin) |
| PUT | /workspaces/:id/members/:userId | Update role | Yes (Admin) |
| DELETE | /workspaces/:id/members/:userId | Remove member | Yes (Admin) |

#### Projects

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /workspaces/:id/projects | List projects | Yes |
| POST | /workspaces/:id/projects | Create project | Yes (Admin) |
| GET | /projects/:id | Get project | Yes |
| PUT | /projects/:id | Update project | Yes (Admin) |
| DELETE | /projects/:id | Archive project | Yes (Admin) |
| GET | /projects/:id/statuses | Get custom statuses | Yes |
| POST | /projects/:id/statuses | Create status | Yes (Admin) |
| PUT | /projects/:id/statuses/:statusId | Update status | Yes (Admin) |
| DELETE | /projects/:id/statuses/:statusId | Delete status | Yes (Admin) |

#### Tasks

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /projects/:id/tasks | List tasks (with filters) | Yes |
| POST | /projects/:id/tasks | Create task | Yes |
| GET | /tasks/:id | Get task | Yes |
| PUT | /tasks/:id | Update task | Yes |
| DELETE | /tasks/:id | Delete task | Yes |
| GET | /tasks/:id/history | Get change history | Yes |
| GET | /tasks/:id/comments | Get comments | Yes |
| POST | /tasks/:id/comments | Add comment | Yes |
| PUT | /tasks/:id/comments/:commentId | Update comment | Yes |
| DELETE | /tasks/:id/comments/:commentId | Delete comment | Yes |
| GET | /tasks/:id/time-entries | Get time entries | Yes |
| POST | /tasks/:id/time-entries | Log time | Yes |
| PUT | /tasks/:id/time-entries/:entryId | Update time entry | Yes |
| DELETE | /tasks/:id/time-entries/:entryId | Delete time entry | Yes |
| POST | /tasks/:id/relations | Add relation | Yes |
| DELETE | /tasks/:id/relations/:relationId | Remove relation | Yes |
| GET | /tasks/:id/git-links | Get Git links | Yes |
| POST | /tasks/:id/git-links | Add Git link | Yes |
| DELETE | /tasks/:id/git-links/:linkId | Remove Git link | Yes |

#### Boards

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /projects/:id/boards | List boards | Yes |
| POST | /projects/:id/boards | Create board | Yes |
| GET | /boards/:id | Get board with tasks | Yes |
| PUT | /boards/:id | Update board config | Yes |
| PUT | /boards/:id/columns | Update column order | Yes |

#### Labels

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /workspaces/:id/labels | List labels | Yes |
| POST | /workspaces/:id/labels | Create label | Yes (Admin) |
| PUT | /workspaces/:id/labels/:id | Update label | Yes (Admin) |
| DELETE | /workspaces/:id/labels/:id | Delete label | Yes (Admin) |

#### Iterations

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /workspaces/:id/iterations | List iterations | Yes |
| POST | /workspaces/:id/iterations | Create iteration | Yes |
| GET | /iterations/:id | Get iteration with tasks | Yes |
| PUT | /iterations/:id | Update iteration | Yes |
| DELETE | /iterations/:id | Delete iteration | Yes |
| GET | /iterations/:id/report | Get iteration report | Yes |

#### Export

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /workspaces/:id/export/json | Export to JSON | Yes |
| GET | /workspaces/:id/export/csv | Export to CSV | Yes |
| GET | /workspaces/:id/reports/dashboard | Dashboard metrics | Yes |
| GET | /workspaces/:id/reports/time | Time tracking report | Yes |

#### Notifications

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /notifications | List notifications | Yes |
| PUT | /notifications/:id/read | Mark as read | Yes |
| PUT | /notifications/read-all | Mark all as read | Yes |

#### Health

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /health | Basic health check | No |
| GET | /health/ready | Readiness check | No |
| GET | /health/live | Liveness check | No |

### WebSocket Events

#### Board Events

| Event | Direction | Description |
|-------|-----------|-------------|
| board:task-moved | Server → Client | Task status changed via drag-drop |
| board:task-updated | Server → Client | Task updated (real-time sync) |
| board:column-updated | Server → Client | Column configuration changed |

#### Notification Events

| Event | Direction | Description |
|-------|-----------|-------------|
| notification:new | Server → Client | New notification |
| notification:read | Server → Client | Notification marked read |

### Authentication Flow

1. **Registration**: POST /auth/register with email, password, name
2. **Login**: POST /auth/login returns JWT access token + refresh token
3. **Token Refresh**: POST /auth/refresh with refresh token
4. **OAuth**: GET /auth/oauth/:provider → redirect to provider → callback

### Authorization Model

- **Workspace Owner**: Full access, can delete workspace
- **Workspace Admin**: Manage members, projects, labels, settings
- **Workspace Member**: Create/edit tasks, comments, time entries
- **Workspace Guest**: Read-only access to tasks and boards

### Request/Response Patterns

#### Pagination

```typescript
// Request
GET /projects/:id/tasks?page=1&limit=20

// Response
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

#### Filtering

```typescript
GET /projects/:id/tasks?status=open&priority=high&assignee=userId
GET /workspaces/:id/tasks?label=bug&dueBefore=2026-03-01
```

#### Task Filtering Query Parameters

| Parameter | Values | Description |
|-----------|--------|-------------|
| status | string | Filter by status ID |
| priority | critical, high, medium, low, none | Filter by priority |
| assignee | userId | Filter by assignee |
| labels | labelId1,labelId2 | Filter by labels (OR) |
| iteration | iterationId | Filter by iteration |
| search | string | Search in title/description |
| dueBefore | date | Due date before |
| dueAfter | date | Due date after |

#### Concurrency Control (Optimistic Locking)

```typescript
// Request includes version
PUT /tasks/:id
{
  "title": "New title",
  "version": 5
}

// Response on conflict (409)
{
  "error": "Version conflict",
  "currentVersion": 6,
  "data": { /* current task state */ }
}
```

### Rate Limiting

- Default: 100 requests/minute per user
- Configurable via environment variable
- Headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset

### Error Responses

```typescript
// 400 Bad Request
{
  "error": "Validation error",
  "details": [
    { "field": "email", "message": "Invalid email format" }
  ]
}

// 401 Unauthorized
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}

// 403 Forbidden
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}

// 404 Not Found
{
  "error": "Not found",
  "message": "Task not found"
}

// 409 Conflict
{
  "error": "Version conflict",
  "currentVersion": 6
}

// 429 Too Many Requests
{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}

// 500 Internal Server Error
{
  "error": "Internal server error",
  "requestId": "uuid"
}
```

## API Changes

This spec defines the complete REST API surface. Key changes:

- All CRUD operations for workspaces, projects, tasks, boards, labels, iterations
- Real-time updates via WebSocket
- Export endpoints for JSON/CSV
- Dashboard metrics endpoint
- Time tracking with timer support
- Git link management

## Known Limitations

- OAuth providers require external configuration (Google, GitHub credentials)
- Email notifications require SMTP configuration
- Plugin system events not implemented in this spec (future work)
- File attachments not included (future scope)
- Webhooks not included (out of scope per requirements)
