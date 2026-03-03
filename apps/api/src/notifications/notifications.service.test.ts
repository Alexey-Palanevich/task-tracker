import { describe, it, expect } from 'vitest';
import type { Notification } from '@task-tracker/types';
import { NotificationsService } from './notifications.service';

// FR-10: Notifications - list and mark as read
describe('NotificationsService - listForUser', () => {
  it('returns notifications for a user ordered by newest first', async () => {
    const userId = 'user-1';
    let requestedUserId: string | null = null;

    const fakeDb = {
      selectFrom(table: string) {
        expect(table).toBe('notifications');
        return {
          selectAll() {
            return this;
          },
          where(column: string, op: string, value: unknown) {
            expect(column).toBe('user_id');
            expect(op).toBe('=');
            requestedUserId = value as string;
            return this;
          },
          orderBy(column: string, direction: 'asc' | 'desc') {
            expect(column).toBe('created_at');
            expect(direction).toBe('desc');
            return this;
          },
          async execute() {
            const notifications: Notification[] = [
              {
                id: 'n2',
                user_id: userId,
                type: 'task_assigned',
                data: { task_id: 'task-2' },
                is_read: false,
                read_at: null,
                created_at: new Date('2026-03-02T10:05:00Z'),
              },
              {
                id: 'n1',
                user_id: userId,
                type: 'comment_mention',
                data: { task_id: 'task-1' },
                is_read: true,
                read_at: new Date('2026-03-02T10:00:00Z'),
                created_at: new Date('2026-03-02T09:55:00Z'),
              },
            ];
            return notifications;
          },
        };
      },
    } as any;

    const service = new NotificationsService(fakeDb);

    const result = await service.listForUser(userId);

    expect(requestedUserId).toBe(userId);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('n2');
  });
});

describe('NotificationsService - markRead', () => {
  it('marks a notification as read for the current user', async () => {
    const userId = 'user-1';
    const notificationId = 'n1';
    const updated: any[] = [];
    const whereClauses: { column: string; value: string }[] = [];

    const fakeDb = {
      updateTable(table: string) {
        expect(table).toBe('notifications');
        return {
          set(values: any) {
            updated.push(values);
            return {
              where(column: string, op: string, value: string) {
                expect(op).toBe('=');
                whereClauses.push({ column, value });
                return this;
              },
              returningAll() {
                return {
                  async executeTakeFirstOrThrow() {
                    return {
                      id: notificationId,
                      user_id: userId,
                      type: 'task_assigned',
                      data: { task_id: 'task-1' },
                      is_read: true,
                      read_at: updated[0].read_at,
                      created_at: new Date('2026-03-02T09:55:00Z'),
                    } satisfies Notification;
                  },
                };
              },
            };
          },
        };
      },
    } as any;

    const service = new NotificationsService(fakeDb);

    const notification = await service.markRead(notificationId, userId);

    expect(updated[0].is_read).toBe(true);
    expect(updated[0].read_at).toBeInstanceOf(Date);
    expect(whereClauses).toEqual([
      { column: 'id', value: notificationId },
      { column: 'user_id', value: userId },
    ]);
    expect(notification.id).toBe(notificationId);
    expect(notification.is_read).toBe(true);
  });
});

describe('NotificationsService - markAllRead', () => {
  it('marks all notifications for the user as read', async () => {
    const userId = 'user-1';
    const updated: any[] = [];
    const whereClauses: { column: string; value: string }[] = [];

    const fakeDb = {
      updateTable(table: string) {
        expect(table).toBe('notifications');
        return {
          set(values: any) {
            updated.push(values);
            return {
              where(column: string, op: string, value: string) {
                expect(column).toBe('user_id');
                expect(op).toBe('=');
                whereClauses.push({ column, value });
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

    const service = new NotificationsService(fakeDb);

    await service.markAllRead(userId);

    expect(updated[0].is_read).toBe(true);
    expect(updated[0].read_at).toBeInstanceOf(Date);
    expect(whereClauses).toEqual([{ column: 'user_id', value: userId }]);
  });
});

