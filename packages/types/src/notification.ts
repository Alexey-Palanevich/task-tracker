/**
 * Notification types (FR-10).
 */

export type NotificationType =
  | 'task_assigned'
  | 'comment_mention'
  | 'task_status_changed';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  /**
   * Serialized JSON payload with contextual data,
   * e.g. task id, project id, actor id.
   */
  data: Record<string, unknown>;
  is_read: boolean;
  read_at: Date | null;
  created_at: Date;
}

