import { describe, it, expect } from 'vitest';
import type { TaskRelation } from '@task-tracker/types';
import { TaskRelationsService } from './task-relations.service';

// FR-3.6: Task relations - blocks, blocked by, relates to, duplicates
describe('TaskRelationsService - addRelation', () => {
  it('inserts a relation row between tasks', async () => {
    const inserted: any[] = [];

    const fakeDb = {
      insertInto(table: string) {
        expect(table).toBe('task_relations');
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

    const service = new TaskRelationsService(fakeDb);

    await service.addRelation('task-1', 'task-2', 'blocks');

    expect(inserted[0]).toMatchObject({
      task_id: 'task-1',
      related_task_id: 'task-2',
      type: 'blocks',
    });
  });
});

describe('TaskRelationsService - listForTask', () => {
  it('returns relations for a task', async () => {
    const taskId = 'task-1';
    let requestedTaskId: string | null = null;

    const fakeDb = {
      selectFrom(table: string) {
        expect(table).toBe('task_relations');
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
            const rows: TaskRelation[] = [
              {
                id: 'rel-1',
                task_id: taskId,
                related_task_id: 'task-2',
                type: 'blocks',
                created_at: new Date(),
              },
            ];
            return rows;
          },
        };
      },
    } as any;

    const service = new TaskRelationsService(fakeDb);

    const result = await service.listForTask(taskId);

    expect(requestedTaskId).toBe(taskId);
    expect(result).toHaveLength(1);
    expect(result[0].related_task_id).toBe('task-2');
  });
});

