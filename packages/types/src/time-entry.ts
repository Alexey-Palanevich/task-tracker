/**
 * Time entry types (FR-7).
 */

export interface TimeEntry {
  id: string;
  task_id: string;
  user_id: string;
  duration_minutes: number;
  date: Date;
  description: string | null;
  billable: boolean;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

