import { describe, it, expect } from 'vitest';
import type { TaskHistoryEntry } from '@task-tracker/types';
import { TaskHistoryService } from './task-history.service';

// FR-3.5: Task history - all changes tracked
describe('TaskHistoryService - recordFieldChange', () => {
  it('inserts a history row with actor, field, and values', async () => {
    const inserted: any[] = [];

    const fakeDb = {
      insertInto(table: string) {
        expect(table).toBe('task_history');
        return {
          values(values: any) {
            inserted.push(values);
            return {
              async execute() {
                // no-op
              },
            };
          },
        };
      },
    } as any;

    const service = new TaskHistoryService(fakeDb);

    await service.recordFieldChange('task-1', 'user-1', 'title', 'Old', 'New');

    expect(inserted[0]).toMatchObject({
      task_id: 'task-1',
      actor_user_id: 'user-1',
      field: 'title',
      old_value: 'Old',
      new_value: 'New',
    });
  });
});

describe('TaskHistoryService - listForTask', () => {
  it('returns history entries for a task', async () => {
    const taskId = 'task-1';
    let requestedTaskId: string | null = null;

    const fakeDb = {
      selectFrom(table: string) {
        expect(table).toBe('task_history');
        return {
          selectAll() {
            return this;
          },
          where(column: string, op: string, value: string) {
            expect(column).toBe('task_id');
            expect(op).toBe('=');
            requestedTaskId = value;
            return this;
          },
          async execute() {
            const entries: TaskHistoryEntry[] = [
              {
                id: 'hist-1',
                task_id: taskId,
                actor_user_id: 'user-1',
                field: 'title',
                old_value: 'Old',
                new_value: 'New',
                created_at: new Date(),
              },
            ];
            return entries;
          },
        };
      },
    } as any;

    const service = new TaskHistoryService(fakeDb);

    const result = await service.listForTask(taskId);

    expect(requestedTaskId).toBe(taskId);
    expect(result).toHaveLength(1);
    expect(result[0].field).toBe('title');
  });
});

