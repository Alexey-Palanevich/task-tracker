/**
 * Iteration types (FR-8).
 */

import type { TaskSummary } from './task';

export interface Iteration {
  id: string;
  workspace_id: string;
  name: string;
  start_date: Date;
  end_date: Date;
  created_at: Date;
  updated_at: Date;
}

export interface IterationDetail extends Iteration {
  tasks: TaskSummary[];
}

export interface IterationReport {
  iteration_id: string;
  planned_tasks: number;
  completed_tasks: number;
}

