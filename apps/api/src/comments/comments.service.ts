import { Inject, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import type { Kysely } from 'kysely';
import type { Comment } from '@task-tracker/types';
import { KYSELY } from '../db/db.module';
import type { Database } from '../db/database';

@Injectable()
export class CommentsService {
  constructor(@Inject(KYSELY) private readonly db: Kysely<Database>) {}

  async addComment(taskId: string, userId: string, body: string): Promise<Comment> {
    const comment = await this.db
      .insertInto('comments')
      .values({
        task_id: taskId,
        author_user_id: userId,
        body,
        is_deleted: false,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return comment as Comment;
  }

  async listForTask(taskId: string): Promise<Comment[]> {
    const rows = await this.db
      .selectFrom('comments')
      .selectAll()
      .where('task_id', '=', taskId)
      .where('is_deleted', '=', false)
      .orderBy('created_at', 'asc')
      .execute();

    return rows as Comment[];
  }

  async updateComment(commentId: string, userId: string, body: string): Promise<Comment> {
    const existing = await this.db
      .selectFrom('comments')
      .selectAll()
      .where('id', '=', commentId)
      .executeTakeFirst();

    if (!existing) {
      throw new NotFoundException('Comment not found');
    }

    if (existing.author_user_id !== userId) {
      throw new ForbiddenException('Only the author can edit this comment');
    }

    await this.db
      .insertInto('comment_edit_history')
      .values({
        comment_id: commentId,
        editor_user_id: userId,
        old_body: existing.body,
        new_body: body,
      })
      .execute();

    const updated = await this.db
      .updateTable('comments')
      .set({
        body,
      })
      .where('id', '=', commentId)
      .returningAll()
      .executeTakeFirstOrThrow();

    return updated as Comment;
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    const existing = await this.db
      .selectFrom('comments')
      .selectAll()
      .where('id', '=', commentId)
      .executeTakeFirst();

    if (!existing) {
      throw new NotFoundException('Comment not found');
    }

    if (existing.author_user_id !== userId) {
      throw new ForbiddenException('Only the author can delete this comment');
    }

    await this.db
      .updateTable('comments')
      .set({
        is_deleted: true,
      })
      .where('id', '=', commentId)
      .executeTakeFirst();
  }
}

