import { describe, it, expect } from 'vitest';
import type { Label } from '@task-tracker/types';
import { LabelsService } from './labels.service';

// FR-5: Labels - workspace-level labels
describe('LabelsService - listForWorkspace', () => {
  it('returns labels for a workspace', async () => {
    const workspaceId = 'ws-1';
    let requestedWorkspaceId: string | null = null;

    const fakeDb = {
      selectFrom(table: string) {
        expect(table).toBe('labels');
        return {
          select(_cols: string[]) {
            return this;
          },
          where(column: string, op: string, value: unknown) {
            expect(column).toBe('workspace_id');
            expect(op).toBe('=');
            requestedWorkspaceId = value as string;
            return this;
          },
          async execute() {
            const labels: Label[] = [
              {
                id: 'lab-1',
                workspace_id: workspaceId,
                name: 'Bug',
                color: '#ff0000',
                created_at: new Date(),
                updated_at: new Date(),
              },
            ];
            return labels;
          },
        };
      },
    } as any;

    const service = new LabelsService(fakeDb);

    const result = await service.listForWorkspace(workspaceId);

    expect(requestedWorkspaceId).toBe(workspaceId);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Bug');
  });
});

describe('LabelsService - createLabel', () => {
  it('creates a label within a workspace', async () => {
    const workspaceId = 'ws-1';
    const inserted: Partial<Label>[] = [];

    const fakeDb = {
      insertInto(table: string) {
        expect(table).toBe('labels');
        return {
          values(values: Partial<Label>) {
            inserted.push(values);
            return {
              returningAll() {
                return {
                  async executeTakeFirstOrThrow() {
                    return {
                      id: 'lab-1',
                      workspace_id: workspaceId,
                      name: values.name ?? 'Unnamed',
                      color: values.color ?? '#000000',
                      created_at: new Date(),
                      updated_at: new Date(),
                    } satisfies Label;
                  },
                };
              },
            };
          },
        };
      },
    } as any;

    const service = new LabelsService(fakeDb);

    const label = await service.createLabel(workspaceId, {
      name: 'Feature',
      color: '#00ff00',
    });

    expect(inserted[0]).toMatchObject({
      workspace_id: workspaceId,
      name: 'Feature',
      color: '#00ff00',
    });

    expect(label.id).toBe('lab-1');
    expect(label.workspace_id).toBe(workspaceId);
  });
});

describe('LabelsService - updateLabel', () => {
  it('updates name and color for a label within a workspace', async () => {
    const workspaceId = 'ws-1';
    const labelId = 'lab-1';
    const updated: any[] = [];
    const whereClauses: { column: string; value: string }[] = [];

    const fakeDb = {
      updateTable(table: string) {
        expect(table).toBe('labels');
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
                      id: labelId,
                      workspace_id: workspaceId,
                      name: updated[0].name,
                      color: updated[0].color,
                      created_at: new Date(),
                      updated_at: new Date(),
                    } satisfies Label;
                  },
                };
              },
            };
          },
        };
      },
    } as any;

    const service = new LabelsService(fakeDb);

    const label = await service.updateLabel(workspaceId, labelId, {
      name: 'Chore',
      color: '#cccccc',
    });

    expect(updated[0]).toMatchObject({
      name: 'Chore',
      color: '#cccccc',
    });
    expect(whereClauses).toEqual([
      { column: 'workspace_id', value: workspaceId },
      { column: 'id', value: labelId },
    ]);
    expect(label.id).toBe(labelId);
  });
});

describe('LabelsService - deleteLabel', () => {
  it('deletes a label within a workspace', async () => {
    const workspaceId = 'ws-1';
    const labelId = 'lab-1';
    const whereClauses: { column: string; value: string }[] = [];

    const fakeDb = {
      deleteFrom(table: string) {
        expect(table).toBe('labels');
        return {
          where(column: string, op: string, value: string) {
            expect(op).toBe('=');
            whereClauses.push({ column, value });
            return this;
          },
          async executeTakeFirst() {
            return undefined;
          },
        };
      },
    } as any;

    const service = new LabelsService(fakeDb);

    await service.deleteLabel(workspaceId, labelId);

    expect(whereClauses).toEqual([
      { column: 'workspace_id', value: workspaceId },
      { column: 'id', value: labelId },
    ]);
  });
});

