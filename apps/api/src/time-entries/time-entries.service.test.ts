import { describe, it, expect } from 'vitest';
import type { TimeEntry } from '@task-tracker/types';
import { TimeEntriesService } from './time-entries.service';

// FR-7.1, FR-7.2, FR-7.4, FR-7.5: time logging, listing, edit/delete with soft deletion
describe('TimeEntriesService - addEntry', () => {
  it('inserts a time entry for a task with the current user as author and not deleted', async () => {
    const taskId = 'task-1';
    const userId = 'user-1';
    const inserted: any[] = [];

    const fakeDb = {
      insertInto(table: string) {
        expect(table).toBe('time_entries');
        return {
          values(values: any) {
            inserted.push(values);
            return this;
          },
          returningAll() {
            return {
              async executeTakeFirstOrThrow() {
                return {
                  id: 'te-1',
                  task_id: taskId,
                  user_id: userId,
                  duration_minutes: inserted[0].duration_minutes,
                  date: inserted[0].date,
                  description: inserted[0].description,
                  billable: inserted[0].billable,
                  is_deleted: inserted[0].is_deleted,
                  created_at: new Date(),
                  updated_at: new Date(),
                } satisfies TimeEntry;
              },
            };
          },
        };
      },
    } as any;

    const service = new TimeEntriesService(fakeDb);

    const entry = await service.addEntry(taskId, userId, {
      duration_minutes: 60,
      date: new Date('2026-03-01'),
      description: 'Work on backend',
    });

    expect(inserted[0]).toMatchObject({
      task_id: taskId,
      user_id: userId,
      duration_minutes: 60,
      description: 'Work on backend',
      is_deleted: false,
    });
    expect(entry.id).toBe('te-1');
    expect(entry.user_id).toBe(userId);
  });
}
);

describe('TimeEntriesService - listForTask', () => {
  it('returns non-deleted time entries for a task ordered by date then created_at', async () => {
    const taskId = 'task-1';
    let requestedTaskId: string | null = null;
    let deletedFilter: boolean | null = null;

    const fakeDb = {
      selectFrom(table: string) {
        expect(table).toBe('time_entries');
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
              deletedFilter = value as boolean;
            }
            return this;
          },
          orderBy(column: string, direction: 'asc' | 'desc') {
            expect(direction).toBe('asc');
            expect(['date', 'created_at']).toContain(column);
            return this;
          },
          async execute() {
            const entries: TimeEntry[] = [
              {
                id: 'te-1',
                task_id: taskId,
                user_id: 'user-1',
                duration_minutes: 30,
                date: new Date('2026-03-01'),
                description: 'First',
                billable: false,
                is_deleted: false,
                created_at: new Date(),
                updated_at: new Date(),
              },
            ];
            return entries;
          },
        };
      },
    } as any;

    const service = new TimeEntriesService(fakeDb);

    const result = await service.listForTask(taskId);

    expect(requestedTaskId).toBe(taskId);
    expect(deletedFilter).toBe(false);
    expect(result).toHaveLength(1);
    expect(result[0].description).toBe('First');
  });
});

