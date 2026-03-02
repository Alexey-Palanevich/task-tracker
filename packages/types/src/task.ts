/**
 * Task-related types (FR-3).
 */

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low' | 'none';

export type TaskRelationType = 'blocks' | 'blocked_by' | 'relates_to' | 'duplicates';

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status_id: string;
  priority: TaskPriority;
  assignee_ids: string[];
  label_ids: string[];
  due_date: Date | null;
  estimate_minutes: number | null;
  parent_task_id: string | null;
  iteration_id: string | null;
  version: number;
  created_at: Date;
  updated_at: Date;
}

export interface TaskSummary {
  id: string;
  project_id: string;
  title: string;
  status_id: string;
  priority: TaskPriority;
  assignee_ids: string[];
  label_ids: string[];
  due_date: Date | null;
}

export interface TaskHistoryEntry {
  id: string;
  task_id: string;
  actor_user_id: string;
  field: string;
  old_value: string | null;
  new_value: string | null;
  created_at: Date;
}

export interface TaskRelation {
  id: string;
  task_id: string;
  related_task_id: string;
  type: TaskRelationType;
  created_at: Date;
}

