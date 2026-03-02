import type { Generated } from 'kysely';

// Minimal hand-written Kysely database interface for Phase 2.
// This will later be replaced by generated types from `kysely-codegen`
// once the initial migrations are in place.

export interface UsersTable {
  id: Generated<string>;
  email: string;
  name: string | null;
  password_hash: string;
  email_verified_at: Date | null;
  avatar_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface WorkspacesTable {
  id: Generated<string>;
  name: string;
  description: string | null;
  icon_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'guest';

export interface WorkspaceMembersTable {
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  created_at: Date;
  updated_at: Date;
}

export interface ProjectsTable {
  id: Generated<string>;
  workspace_id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  is_archived: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface StatusesTable {
  id: Generated<string>;
  project_id: string;
  name: string;
  color: string | null;
  sort_order: number;
  is_default: boolean;
  is_closed: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface TasksTable {
  id: Generated<string>;
  project_id: string;
  title: string;
  description: string | null;
  status_id: string;
  priority: string;
  due_date: Date | null;
  estimate_minutes: number | null;
  parent_task_id: string | null;
  version: number;
  created_at: Date;
  updated_at: Date;
}

export interface TaskAssigneesTable {
  task_id: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface TaskLabelsTable {
  task_id: string;
  label_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface TaskRelationsTable {
  id: Generated<string>;
  task_id: string;
  related_task_id: string;
  type: string;
  created_at: Date;
  updated_at: Date;
}

export interface TaskHistoryTable {
  id: Generated<string>;
  task_id: string;
  actor_user_id: string;
  field: string;
  old_value: string | null;
  new_value: string | null;
  created_at: Date;
}

export interface LabelsTable {
  id: Generated<string>;
  workspace_id: string;
  name: string;
  color: string;
  created_at: Date;
  updated_at: Date;
}

export interface CommentsTable {
  id: Generated<string>;
  task_id: string;
  author_user_id: string;
  body: string;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
}

export interface CommentEditHistoryTable {
  id: Generated<string>;
  comment_id: string;
  editor_user_id: string;
  old_body: string;
  new_body: string;
  edited_at: Date;
}

export interface BoardsTable {
  id: Generated<string>;
  project_id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface BoardColumnsTable {
  id: Generated<string>;
  board_id: string;
  status_id: string;
  sort_order: number;
  is_hidden: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Database {
  users: UsersTable;
  workspaces: WorkspacesTable;
  workspace_members: WorkspaceMembersTable;
  projects: ProjectsTable;
  statuses: StatusesTable;
  tasks: TasksTable;
  task_assignees: TaskAssigneesTable;
  task_labels: TaskLabelsTable;
  task_relations: TaskRelationsTable;
  task_history: TaskHistoryTable;
  labels: LabelsTable;
  comments: CommentsTable;
  comment_edit_history: CommentEditHistoryTable;
  boards: BoardsTable;
  board_columns: BoardColumnsTable;
}
