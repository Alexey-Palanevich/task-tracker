import { describe, it, expect } from 'vitest';
import type { Project, ProjectStatus, ProjectSummary } from '@task-tracker/types';
import { ProjectsService } from './projects.service';

// FR-2: Project Management
describe('ProjectsService - listForWorkspace', () => {
  it('returns non-archived project summaries for a workspace', async () => {
    const workspaceId = 'ws-1';
    let requestedWorkspaceId: string | null = null;
    let archivedFilter: boolean | null = null;

    const fakeDb = {
      selectFrom(table: string) {
        expect(table).toBe('projects');
        return {
          select(_cols: string[]) {
            return this;
          },
          where(column: string, op: string, value: unknown) {
            expect(op).toBe('=');
            if (column === 'workspace_id') {
              requestedWorkspaceId = value as string;
            }
            if (column === 'is_archived') {
              archivedFilter = value as boolean;
            }
            return this;
          },
          async execute() {
            const projects: ProjectSummary[] = [
              {
                id: 'proj-1',
                workspace_id: workspaceId,
                name: 'Project 1',
                description: 'First project',
                color: '#ff0000',
                icon: '📌',
                is_archived: false,
              },
            ];
            return projects;
          },
        };
      },
    } as any;

    const service = new ProjectsService(fakeDb);

    const result = await service.listForWorkspace(workspaceId);

    expect(requestedWorkspaceId).toBe(workspaceId);
    expect(archivedFilter).toBe(false);
    expect(result).toEqual([
      {
        id: 'proj-1',
        workspace_id: workspaceId,
        name: 'Project 1',
        description: 'First project',
        color: '#ff0000',
        icon: '📌',
        is_archived: false,
      },
    ]);
  });
});

describe('ProjectsService - createProject', () => {
  it('creates a project within a workspace', async () => {
    const workspaceId = 'ws-1';
    const insertedProjects: Partial<Project>[] = [];

    const fakeDb = {
      insertInto(table: string) {
        expect(table).toBe('projects');
        return {
          values(values: Partial<Project>) {
            insertedProjects.push(values);
            return {
              returningAll() {
                return {
                  async executeTakeFirstOrThrow() {
                    return {
                      id: 'proj-1',
                      workspace_id: workspaceId,
                      name: values.name ?? 'Unnamed',
                      description: values.description ?? null,
                      color: values.color ?? null,
                      icon: values.icon ?? null,
                      is_archived: false,
                      created_at: new Date(),
                      updated_at: new Date(),
                    } satisfies Project;
                  },
                };
              },
            };
          },
        };
      },
    } as any;

    const service = new ProjectsService(fakeDb);

    const project = await service.createProject(workspaceId, {
      name: 'API Project',
      description: 'Backend API work',
      color: '#00ff00',
      icon: '🧩',
    });

    expect(insertedProjects[0]).toMatchObject({
      workspace_id: workspaceId,
      name: 'API Project',
      description: 'Backend API work',
      color: '#00ff00',
      icon: '🧩',
      is_archived: false,
    });

    expect(project.id).toBe('proj-1');
    expect(project.workspace_id).toBe(workspaceId);
    expect(project.name).toBe('API Project');
  });
});

describe('ProjectsService - archiveProject', () => {
  it('marks the project as archived', async () => {
    const updated: any[] = [];

    const fakeDb = {
      updateTable(table: string) {
        expect(table).toBe('projects');
        return {
          set(values: any) {
            updated.push(values);
            return {
              where(column: string, op: string, value: string) {
                expect(column).toBe('id');
                expect(op).toBe('=');
                expect(value).toBe('proj-1');
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

    const service = new ProjectsService(fakeDb);

    await service.archiveProject('proj-1');

    expect(updated[0]).toMatchObject({ is_archived: true });
  });
});

describe('ProjectsService - statuses', () => {
  it('lists statuses for a project', async () => {
    const projectId = 'proj-1';
    let requestedProjectId: string | null = null;

    const fakeDb = {
      selectFrom(table: string) {
        expect(table).toBe('statuses');
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
            const statuses: ProjectStatus[] = [
              {
                id: 'st-1',
                project_id: projectId,
                name: 'Todo',
                color: '#cccccc',
                sort_order: 0,
                is_default: true,
                is_closed: false,
              },
            ];
            return statuses;
          },
        };
      },
    } as any;

    const service = new ProjectsService(fakeDb);

    const result = await service.getStatusesForProject(projectId);

    expect(requestedProjectId).toBe(projectId);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Todo');
  });
});

