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

export interface Database {
  users: UsersTable;
  workspaces: WorkspacesTable;
  workspace_members: WorkspaceMembersTable;
}
