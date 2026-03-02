import { describe, it, expect } from 'vitest';
import type { Iteration, IterationDetail, IterationReport, TaskSummary } from '@task-tracker/types';
import { IterationsService } from './iterations.service';

// FR-8: iterations CRUD, detail, and basic planned vs completed report
describe('IterationsService - listForWorkspace', () => {
  it('lists iterations for a workspace', async () => {
    const workspaceId = 'ws-1';
    let requestedWorkspaceId: string | null = null;

    const fakeDb = {
      selectFrom(table: string) {
        expect(table).toBe('iterations');
        return {
          selectAll() {
            return this;
          },
          where(column: string, op: string, value: string) {
            expect(column).toBe('workspace_id');
            expect(op).toBe('=');
            requestedWorkspaceId = value;
            return this;
          },
          orderBy(column: string, direction: 'asc' | 'desc') {
            expect(column).toBe('start_date');
            expect(direction).toBe('asc');
            return this;
          },
          async execute() {
            const iterations: Iteration[] = [
              {
                id: 'it-1',
                workspace_id: workspaceId,
                name: 'Sprint 1',
                start_date: new Date('2026-03-01'),
                end_date: new Date('2026-03-14'),
                created_at: new Date(),
                updated_at: new Date(),
              },
            ];
            return iterations;
          },
        };
      },
    } as any;

    const service = new IterationsService(fakeDb);

    const result = await service.listForWorkspace(workspaceId);

    expect(requestedWorkspaceId).toBe(workspaceId);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Sprint 1');
  });
});

describe('IterationsService - getIterationDetail', () => {
  it('returns iteration with tasks assigned to it', async () => {
    const iterationId = 'it-1';
    const workspaceId = 'ws-1';
    let requestedIterationId: string | null = null;
    let requestedIterationForTasks: string | null = null;

    const fakeDb = {
      selectFrom(table: string) {
        if (table === 'iterations') {
          return {
            selectAll() {
              return this;
            },
            where(column: string, op: string, value: string) {
              expect(column).toBe('id');
              expect(op).toBe('=');
              requestedIterationId = value;
              return this;
            },
            async executeTakeFirst() {
              const iteration: Iteration = {
                id: iterationId,
                workspace_id: workspaceId,
                name: 'Sprint 1',
                start_date: new Date('2026-03-01'),
                end_date: new Date('2026-03-14'),
                created_at: new Date(),
                updated_at: new Date(),
              };
              return iteration;
            },
          };
        }

        if (table === 'tasks') {
          return {
            select(columns: string[]) {
              expect(columns).toEqual([
                'id',
                'project_id',
                'title',
                'status_id',
                'priority',
                'due_date',
              ]);
              return this;
            },
            where(column: string, op: string, value: string) {
              expect(column).toBe('iteration_id');
              expect(op).toBe('=');
              requestedIterationForTasks = value;
              return this;
            },
            async execute() {
              const tasks: TaskSummary[] = [
                {
                  id: 'task-1',
                  project_id: 'proj-1',
                  title: 'Implement backend',
                  status_id: 'in_progress',
                  priority: 'high',
                  assignee_ids: [],
                  label_ids: [],
                  due_date: null,
                },
              ];
              return tasks;
            },
          };
        }

        throw new Error(`Unexpected table ${table}`);
      },
    } as any;

    const service = new IterationsService(fakeDb);

    const detail = (await service.getIterationDetail(iterationId)) as IterationDetail;

    expect(requestedIterationId).toBe(iterationId);
    expect(requestedIterationForTasks).toBe(iterationId);
    expect(detail.id).toBe(iterationId);
    expect(detail.tasks).toHaveLength(1);
    expect(detail.tasks[0].title).toBe('Implement backend');
  });
});

describe('IterationsService - getIterationReport', () => {
  it('computes planned vs completed tasks using status closed flag', async () => {
    const iterationId = 'it-1';

    const fakeDb = {
      selectFrom(table: string) {
        if (table === 'iterations') {
          return {
            selectAll() {
              return this;
            },
            where(column: string, op: string, value: string) {
              expect(column).toBe('id');
              expect(op).toBe('=');
              expect(value).toBe(iterationId);
              return this;
            },
            async executeTakeFirst() {
              const iteration: Iteration = {
                id: iterationId,
                workspace_id: 'ws-1',
                name: 'Sprint 1',
                start_date: new Date('2026-03-01'),
                end_date: new Date('2026-03-14'),
                created_at: new Date(),
                updated_at: new Date(),
              };
              return iteration;
            },
          };
        }

        if (table === 'tasks') {
          return {
            select(columns: string[]) {
              expect(columns).toEqual(['id', 'status_id']);
              return this;
            },
            where(column: string, op: string, value: string) {
              expect(column).toBe('iteration_id');
              expect(op).toBe('=');
              expect(value).toBe(iterationId);
              return this;
            },
            async execute() {
              return [
                { id: 'task-1', status_id: 'done' },
                { id: 'task-2', status_id: 'todo' },
              ];
            },
          };
        }

        if (table === 'statuses') {
          return {
            select(columns: string[]) {
              expect(columns).toEqual(['id', 'is_closed']);
              return this;
            },
            where(column: string, op: string, value: string[]) {
              expect(column).toBe('id');
              expect(op).toBe('in');
              expect(value).toEqual(['done', 'todo']);
              return this;
            },
            async execute() {
              return [
                { id: 'done', is_closed: true },
                { id: 'todo', is_closed: false },
              ];
            },
          };
        }

        throw new Error(`Unexpected table ${table}`);
      },
    } as any;

    const service = new IterationsService(fakeDb);

    const report = (await service.getIterationReport(iterationId)) as IterationReport;

    expect(report.iteration_id).toBe(iterationId);
    expect(report.planned_tasks).toBe(2);
    expect(report.completed_tasks).toBe(1);
  });
});

