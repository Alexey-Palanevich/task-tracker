import { describe, it, expect } from 'vitest';
import type { Task, WorkspaceDashboardMetrics, TimeReportEntry } from '@task-tracker/types';
import { ExportService } from './export.service';

// FR-11: Export & reporting - JSON/CSV exports and basic reports
describe('ExportService - exportTasksAsJson', () => {
  it('returns tasks for a workspace', async () => {
    const workspaceId = 'ws-1';
    let requestedWorkspaceId: string | null = null;

    const fakeDb = {
      selectFrom(table: string) {
        expect(table).toBe('tasks');
        return {
          innerJoin(joinTable: string, left: string, right: string) {
            expect(joinTable).toBe('projects');
            expect(left).toBe('projects.id');
            expect(right).toBe('tasks.project_id');
            return this;
          },
          selectAll(_table?: string) {
            return this;
          },
          where(column: string, op: string, value: string) {
            expect(column).toBe('projects.workspace_id');
            expect(op).toBe('=');
            requestedWorkspaceId = value;
            return this;
          },
          async execute() {
            const tasks: Task[] = [
              {
                id: 'task-1',
                project_id: 'proj-1',
                title: 'Implement export',
                description: null,
                status_id: 'todo',
                priority: 'high',
                assignee_ids: [],
                label_ids: [],
                due_date: null,
                estimate_minutes: null,
                parent_task_id: null,
                iteration_id: null,
                version: 1,
                created_at: new Date(),
                updated_at: new Date(),
              },
            ];
            return tasks;
          },
        };
      },
    } as any;

    const service = new ExportService(fakeDb);

    const result = await service.exportTasksAsJson(workspaceId);

    expect(requestedWorkspaceId).toBe(workspaceId);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Implement export');
  });
});

describe('ExportService - exportTasksAsCsv', () => {
  it('returns CSV with header and rows', async () => {
    const service = new ExportService({} as any);

    (service as any).exportTasksAsJson = async () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          project_id: 'proj-1',
          title: 'Implement export',
          description: null,
          status_id: 'todo',
          priority: 'high',
          assignee_ids: [],
          label_ids: [],
          due_date: new Date('2026-03-02T10:00:00Z'),
          estimate_minutes: null,
          parent_task_id: null,
          iteration_id: null,
          version: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      return tasks;
    };

    const csv = await service.exportTasksAsCsv('ws-1');

    const lines = csv.split('\n');
    expect(lines[0]).toBe('id,project_id,title,status_id,priority,due_date');
    expect(lines[1]).toContain('task-1');
    expect(lines[1]).toContain('Implement export');
  });
});

describe('ExportService - getWorkspaceDashboard', () => {
  it('derives basic metrics from exported tasks', async () => {
    const service = new ExportService({} as any);

    (service as any).exportTasksAsJson = async () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          project_id: 'proj-1',
          title: 'Task 1',
          description: null,
          status_id: 'todo',
          priority: 'high',
          assignee_ids: [],
          label_ids: [],
          due_date: null,
          estimate_minutes: null,
          parent_task_id: null,
          iteration_id: null,
          version: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'task-2',
          project_id: 'proj-2',
          title: 'Task 2',
          description: null,
          status_id: 'in_progress',
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
        },
      ];
      return tasks;
    };

    const metrics = (await service.getWorkspaceDashboard('ws-1')) as WorkspaceDashboardMetrics;

    expect(metrics.workspace_id).toBe('ws-1');
    expect(metrics.total_projects).toBe(2);
    expect(metrics.total_tasks).toBe(2);
    expect(metrics.open_tasks).toBe(2);
    expect(metrics.closed_tasks).toBe(0);
  });
});

describe('ExportService - getWorkspaceTimeReport', () => {
  it('aggregates time entries by user', async () => {
    const workspaceId = 'ws-1';
    const requestedTables: string[] = [];

    const fakeDb = {
      selectFrom(table: string) {
        requestedTables.push(table);
        expect(table).toBe('time_entries');
        return {
          select(_cols: string[]) {
            return this;
          },
          async execute() {
            return [
              {
                task_id: 'task-1',
                user_id: 'user-1',
                duration_minutes: 30,
                date: new Date('2026-03-01'),
                description: null,
                billable: false,
                is_deleted: false,
                created_at: new Date(),
                updated_at: new Date(),
              },
              {
                task_id: 'task-2',
                user_id: 'user-1',
                duration_minutes: 45,
                date: new Date('2026-03-02'),
                description: null,
                billable: false,
                is_deleted: false,
                created_at: new Date(),
                updated_at: new Date(),
              },
              {
                task_id: 'task-3',
                user_id: 'user-2',
                duration_minutes: 60,
                date: new Date('2026-03-02'),
                description: null,
                billable: false,
                is_deleted: false,
                created_at: new Date(),
                updated_at: new Date(),
              },
            ];
          },
        };
      },
    } as any;

    const service = new ExportService(fakeDb);

    const report = (await service.getWorkspaceTimeReport(workspaceId, {})) as TimeReportEntry[];

    expect(requestedTables).toEqual(['time_entries']);
    expect(report).toHaveLength(2);
    const user1 = report.find((r) => r.user_id === 'user-1');
    const user2 = report.find((r) => r.user_id === 'user-2');
    expect(user1?.total_minutes).toBe(75);
    expect(user2?.total_minutes).toBe(60);
    expect(user1?.workspace_id).toBe(workspaceId);
  });
});

