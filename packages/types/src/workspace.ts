/**
 * Workspace and membership types (FR-1, FR-9).
 */

import type { UserPublic } from './user.js';

export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'guest';

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface WorkspaceMember {
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  created_at: Date;
  updated_at: Date;
}

export interface WorkspaceSummary {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
}

export interface WorkspaceDetail extends Workspace {}

export interface WorkspaceMemberResponse {
  user: UserPublic;
  role: WorkspaceRole;
}

