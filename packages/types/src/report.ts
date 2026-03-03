/**
 * Reporting and export types (FR-11).
 */

export interface WorkspaceDashboardMetrics {
  workspace_id: string;
  total_projects: number;
  total_tasks: number;
  open_tasks: number;
  closed_tasks: number;
}

export interface TimeReportEntry {
  workspace_id: string;
  user_id: string;
  total_minutes: number;
}

