import { describe, it, expect } from 'vitest';
import type { WorkspaceDetail, WorkspaceSummary } from '@task-tracker/types';
import { WorkspacesService } from './workspaces.service';

describe('WorkspacesService - listForUser (FR-1.1, FR-1.4)', () => {
  it('returns workspace summaries for a user based on membership', async () => {
    const userId = 'user-1';
    let requestedUserId: string | null = null;

    const fakeDb = {
      selectFrom(table: string) {
        expect(table).toBe('workspace_members');
        return {
          innerJoin(joinTable: string, left: string, right: string) {
            expect(joinTable).toBe('workspaces');
            expect(left).toBe('workspaces.id');
            expect(right).toBe('workspace_members.workspace_id');
            return this;
          },
          select(_cols: string[]) {
            return this;
          },
          where(column: string, op: string, value: string) {
            expect(column).toBe('workspace_members.user_id');
            expect(op).toBe('=');
            requestedUserId = value;
            return this;
          },
          async execute() {
            const workspaces: WorkspaceSummary[] = [
              {
                id: 'ws-1',
                name: 'Workspace 1',
                description: 'First workspace',
                icon_url: null,
              },
            ];
            return workspaces;
          },
        };
      },
    } as any;

    const service = new WorkspacesService(fakeDb);

    const result = await service.listForUser(userId);

    expect(requestedUserId).toBe(userId);
    expect(result).toEqual([
      {
        id: 'ws-1',
        name: 'Workspace 1',
        description: 'First workspace',
        icon_url: null,
      },
    ]);
  });
});

describe('WorkspacesService - createWorkspace (FR-1.1, FR-1.5)', () => {
  it('creates a workspace and an owner membership for the creator', async () => {
    const ownerId = 'user-1';
    const insertedWorkspaces: any[] = [];
    const insertedMembers: any[] = [];

    const fakeDb = {
      insertInto(table: string) {
        if (table === 'workspaces') {
          return {
            values(values: Partial<WorkspaceDetail>) {
              insertedWorkspaces.push(values);
              return {
                returningAll() {
                  return {
                    async executeTakeFirstOrThrow() {
                      return {
                        id: 'ws-1',
                        name: values.name ?? 'Unnamed',
                        description: values.description ?? null,
                        icon_url: values.icon_url ?? null,
                        created_at: new Date(),
                        updated_at: new Date(),
                      } satisfies WorkspaceDetail;
                    },
                  };
                },
              };
            },
          };
        }

        if (table === 'workspace_members') {
          return {
            values(values: any) {
              insertedMembers.push(values);
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
    } as any;

    const service = new WorkspacesService(fakeDb);

    const workspace = await service.createWorkspace(ownerId, {
      name: 'My Workspace',
      description: 'Example',
    });

    expect(workspace.id).toBe('ws-1');
    expect(workspace.name).toBe('My Workspace');
    expect(insertedWorkspaces[0]).toMatchObject({
      name: 'My Workspace',
      description: 'Example',
    });

    expect(insertedMembers[0]).toEqual({
      workspace_id: 'ws-1',
      user_id: ownerId,
      role: 'owner',
    });
  });
});

