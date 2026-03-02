/**
 * Project-related types (FR-2).
 */

export interface Project {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  is_archived: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ProjectSummary {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  is_archived: boolean;
}

export interface ProjectDetail extends Project {}

export interface ProjectStatus {
  id: string;
  project_id: string;
  name: string;
  color: string | null;
  sort_order: number;
  is_default: boolean;
  is_closed: boolean;
}

