/**
 * Comment types (FR-6).
 */

export interface Comment {
  id: string;
  task_id: string;
  author_user_id: string;
  body: string;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
}

export interface CommentEditHistoryEntry {
  id: string;
  comment_id: string;
  editor_user_id: string;
  old_body: string;
  new_body: string;
  edited_at: Date;
}

