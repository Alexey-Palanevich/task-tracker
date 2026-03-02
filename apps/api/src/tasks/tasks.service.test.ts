import { describe, it, expect } from 'vitest';
import type { Task, TaskSummary } from '@task-tracker/types';
import { TasksService } from './tasks.service';

// FR-3.1, FR-3.2, FR-3.3, FR-3.7: basic task lifecycle with subtasks
describe('TasksService - listForProject', () => {
  it('lists tasks for a project', async () => {
    const projectId = 'proj-1';
    let requestedProjectId: string | null = null;

    const fakeDb = {
      selectFrom(table: string) {
        expect(table).toBe('tasks');
        return {
          select(_cols: string[]) {
            return this;
          },
          where(column: string, op: string, value: string) {
            expect(column).toBe('project_id');
            expect(op).toBe('=');
            requestedProjectId = value;
            return this;
          },
          async execute() {
            const tasks: TaskSummary[] = [
              {
                id: 'task-1',
                project_id: projectId,
                title: 'Implement backend',
                status_id: 'todo',
                priority: 'high',
                assignee_ids: ['user-1'],
                label_ids: [],
                due_date: null,
              },
            ];
            return tasks;
          },
        };
      },
    } as any;

    const service = new TasksService(fakeDb);

    const result = await service.listForProject(projectId, {});

    expect(requestedProjectId).toBe(projectId);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Implement backend');
  });
});

describe('TasksService - createTask with optional parent', () => {
  it('creates a root task', async () => {
    const projectId = 'proj-1';
    const inserted: Partial<Task>[] = [];

    const fakeDb = {
      insertInto(table: string) {
        expect(table).toBe('tasks');
        return {
          values(values: Partial<Task>) {
            inserted.push(values);
            return {
              returningAll() {
                return {
                  async executeTakeFirstOrThrow() {
                    return {
                      id: 'task-1',
                      project_id: projectId,
                      title: values.title ?? 'Untitled',
                      description: values.description ?? null,
                      status_id: values.status_id ?? 'todo',
                      priority: values.priority ?? 'medium',
                      assignee_ids: [],
                      label_ids: [],
                      due_date: null,
                      estimate_minutes: null,
                      parent_task_id: null,
                      iteration_id: null,
                      version: 1,
                      created_at: new Date(),
                      updated_at: new Date(),
                    } satisfies Task;
                  },
                };
              },
            };
          },
        };
      },
    } as any;

    const service = new TasksService(fakeDb);

    const task = await service.createTask(projectId, {
      title: 'Implement backend',
      description: 'Initial implementation',
      status_id: 'todo',
      priority: 'high',
      parent_task_id: null,
    });

    expect(inserted[0]).toMatchObject({
      project_id: projectId,
      title: 'Implement backend',
      description: 'Initial implementation',
      status_id: 'todo',
      priority: 'high',
      parent_task_id: null,
    });
    expect(task.id).toBe('task-1');
  });

  it('creates a subtask only when parent is a root task', async () => {
    const projectId = 'proj-1';
    const parentTask = {
      id: 'task-1',
      project_id: projectId,
      title: 'Parent',
      description: null,
      status_id: 'todo',
      priority: 'medium',
      assignee_ids: [],
      label_ids: [],
      due_date: null,
      estimate_minutes: null,
      parent_task_id: null,
      iteration_id: null,
      version: 1,
      created_at: new Date(),
      updated_at: new Date(),
    } satisfies Task;

    const inserted: Partial<Task>[] = [];
    let selectedParentId: string | null = null;

    const fakeDb = {
      selectFrom(table: string) {
        expect(table).toBe('tasks');
        return {
          selectAll() {
            return this;
          },
          where(column: string, op: string, value: string) {
            expect(column).toBe('id');
            expect(op).toBe('=');
            selectedParentId = value;
            return this;
          },
          async executeTakeFirst() {
            return parentTask;
          },
        };
      },
      insertInto(table: string) {
        expect(table).toBe('tasks');
        return {
          values(values: Partial<Task>) {
            inserted.push(values);
            return {
              returningAll() {
                return {
                  async executeTakeFirstOrThrow() {
                    return {
                      id: 'task-2',
                      project_id: projectId,
                      title: values.title ?? 'Untitled',
                      description: values.description ?? null,
                      status_id: values.status_id ?? 'todo',
                      priority: values.priority ?? 'medium',
                      assignee_ids: [],
                      label_ids: [],
                      due_date: null,
                      estimate_minutes: null,
                      parent_task_id: values.parent_task_id ?? null,
                      iteration_id: null,
                      version: 1,
                      created_at: new Date(),
                      updated_at: new Date(),
                    } satisfies Task;
                  },
                };
              },
            };
          },
        };
      },
    } as any;

    const service = new TasksService(fakeDb);

    const task = await service.createTask(projectId, {
      title: 'Child',
      description: null,
      status_id: 'todo',
      priority: 'medium',
      parent_task_id: 'task-1',
    });

    expect(selectedParentId).toBe('task-1');
    expect(inserted[0]).toMatchObject({
      parent_task_id: 'task-1',
    });
    expect(task.parent_task_id).toBe('task-1');
  });

  it('rejects creating a subtask of a subtask', async () => {
    const projectId = 'proj-1';
    const parentTask: Task = {
      id: 'task-1',
      project_id: projectId,
      title: 'Parent',
      description: null,
      status_id: 'todo',
      priority: 'medium',
      assignee_ids: [],
      label_ids: [],
      due_date: null,
      estimate_minutes: null,
      parent_task_id: 'root-task',
      iteration_id: null,
      version: 1,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const fakeDb = {
      selectFrom() {
        return {
          selectAll() {
            return this;
          },
          where() {
            return this;
          },
          async executeTakeFirst() {
            return parentTask;
          },
        };
      },
      insertInto() {
        throw new Error('should not insert');
      },
    } as any;

    const service = new TasksService(fakeDb);

    await expect(
      service.createTask(projectId, {
        title: 'Invalid subtask',
        description: null,
        status_id: 'todo',
        priority: 'medium',
        parent_task_id: 'task-1',
      }),
    ).rejects.toThrowError(/Subtasks can only have a single level/);
  });
});

