/**
 * Board types (FR-4).
 */

import type { TaskSummary } from './task.ts';

export interface Board {
  id: string;
  project_id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface BoardColumn {
  id: string;
  board_id: string;
  status_id: string;
  sort_order: number;
  is_hidden: boolean;
}

export interface BoardColumnWithTasks extends BoardColumn {
  tasks: TaskSummary[];
}

export interface BoardDetail extends Board {
  columns: BoardColumnWithTasks[];
}

