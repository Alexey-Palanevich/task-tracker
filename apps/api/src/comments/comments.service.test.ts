import { describe, it, expect } from 'vitest';
import type { Comment } from '@task-tracker/types';
import { CommentsService } from './comments.service';

// FR-6: Comments - add, edit, delete with history
describe('CommentsService - addComment', () => {
  it('inserts a comment for a task with the current user as author', async () => {
    const taskId = 'task-1';
    const userId = 'user-1';
    const inserted: any[] = [];

    const fakeDb = {
      insertInto(table: string) {
        expect(table).toBe('comments');
        return {
          values(values: any) {
            inserted.push(values);
            return this;
          },
          returningAll() {
            return {
              async executeTakeFirstOrThrow() {
                return {
                  id: 'com-1',
                  task_id: taskId,
                  author_user_id: userId,
                  body: inserted[0].body,
                  created_at: new Date(),
                  updated_at: new Date(),
                  is_deleted: false,
                } satisfies Comment;
              },
            };
          },
        };
      },
    } as any;

    const service = new CommentsService(fakeDb);

    const comment = await service.addComment(taskId, userId, 'Hello **world**');

    expect(inserted[0]).toMatchObject({
      task_id: taskId,
      author_user_id: userId,
      body: 'Hello **world**',
    });
    expect(comment.id).toBe('com-1');
    expect(comment.author_user_id).toBe(userId);
  });
});

describe('CommentsService - listForTask', () => {
  it('returns non-deleted comments for a task', async () => {
    const taskId = 'task-1';
    let requestedTaskId: string | null = null;

    const fakeDb = {
      selectFrom(table: string) {
        expect(table).toBe('comments');
        return {
          selectAll() {
            return this;
          },
          where(column: string, op: string, value: unknown) {
            expect(op).toBe('=');
            if (column === 'task_id') {
              requestedTaskId = value as string;
            }
            if (column === 'is_deleted') {
              expect(value).toBe(false);
            }
            return this;
          },
          orderBy(column: string, direction: 'asc' | 'desc') {
            expect(column).toBe('created_at');
            expect(direction).toBe('asc');
            return this;
          },
          async execute() {
            const comments: Comment[] = [
              {
                id: 'com-1',
                task_id: taskId,
                author_user_id: 'user-1',
                body: 'First',
                created_at: new Date(),
                updated_at: new Date(),
                is_deleted: false,
              },
            ];
            return comments;
          },
        };
      },
    } as any;

    const service = new CommentsService(fakeDb);

    const result = await service.listForTask(taskId);

    expect(requestedTaskId).toBe(taskId);
    expect(result).toHaveLength(1);
    expect(result[0].body).toBe('First');
  });
});

describe('CommentsService - updateComment', () => {
  it('updates a comment when the current user is the author and records history', async () => {
    const commentId = 'com-1';
    const userId = 'user-1';
    const existingComment: Comment = {
      id: commentId,
      task_id: 'task-1',
      author_user_id: userId,
      body: 'Old body',
      created_at: new Date(),
      updated_at: new Date(),
      is_deleted: false,
    };

    let selectedCommentId: string | null = null;
    const historyInserted: any[] = [];
    const updated: any[] = [];

    const fakeDb = {
      selectFrom(table: string) {
        expect(table).toBe('comments');
        return {
          selectAll() {
            return this;
          },
          where(column: string, op: string, value: string) {
            expect(column).toBe('id');
            expect(op).toBe('=');
            selectedCommentId = value;
            return this;
          },
          async executeTakeFirst() {
            return existingComment;
          },
        };
      },
      insertInto(table: string) {
        if (table === 'comment_edit_history') {
          return {
            values(values: any) {
              historyInserted.push(values);
              return {
                async execute() {
                  // no-op
                },
              };
            },
          };
        }
        throw new Error(`Unexpected table ${table}`);
      },
      updateTable(table: string) {
        expect(table).toBe('comments');
        return {
          set(values: any) {
            updated.push(values);
            return {
              where(column: string, op: string, value: string) {
                expect(column).toBe('id');
                expect(op).toBe('=');
                expect(value).toBe(commentId);
                return this;
              },
              returningAll() {
                return {
                  async executeTakeFirstOrThrow() {
                    return {
                      ...existingComment,
                      body: values.body,
                      updated_at: new Date(),
                    } satisfies Comment;
                  },
                };
              },
            };
          },
        };
      },
    } as any;

    const service = new CommentsService(fakeDb);

    const updatedComment = await service.updateComment(commentId, userId, 'New body');

    expect(selectedCommentId).toBe(commentId);
    expect(historyInserted[0]).toMatchObject({
      comment_id: commentId,
      editor_user_id: userId,
      old_body: 'Old body',
      new_body: 'New body',
    });
    expect(updated[0]).toMatchObject({ body: 'New body' });
    expect(updatedComment.body).toBe('New body');
  });
});

describe('CommentsService - deleteComment', () => {
  it('marks a comment as deleted when the current user is the author', async () => {
    const commentId = 'com-1';
    const userId = 'user-1';
    const existingComment: Comment = {
      id: commentId,
      task_id: 'task-1',
      author_user_id: userId,
      body: 'Body',
      created_at: new Date(),
      updated_at: new Date(),
      is_deleted: false,
    };

    let selectedCommentId: string | null = null;
    const updated: any[] = [];

    const fakeDb = {
      selectFrom() {
        return {
          selectAll() {
            return this;
          },
          where(column: string, op: string, value: string) {
            expect(column).toBe('id');
            expect(op).toBe('=');
            selectedCommentId = value;
            return this;
          },
          async executeTakeFirst() {
            return existingComment;
          },
        };
      },
      updateTable(table: string) {
        expect(table).toBe('comments');
        return {
          set(values: any) {
            updated.push(values);
            return {
              where(column: string, op: string, value: string) {
                expect(column).toBe('id');
                expect(op).toBe('=');
                expect(value).toBe(commentId);
                return this;
              },
              async executeTakeFirst() {
                return undefined;
              },
            };
          },
        };
      },
    } as any;

    const service = new CommentsService(fakeDb);

    await service.deleteComment(commentId, userId);

    expect(selectedCommentId).toBe(commentId);
    expect(updated[0]).toMatchObject({ is_deleted: true });
  });
});

