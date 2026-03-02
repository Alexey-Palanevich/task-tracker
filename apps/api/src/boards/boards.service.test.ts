import { describe, it, expect } from 'vitest';
import type { Board, BoardDetail, BoardColumnWithTasks, TaskSummary } from '@task-tracker/types';
import { BoardsService } from './boards.service';

// FR-4: Boards - grouped by status, configurable columns
describe('BoardsService - listForProject', () => {
  it('returns boards for a project', async () => {
    const projectId = 'proj-1';
    let requestedProjectId: string | null = null;

    const fakeDb = {
      selectFrom(table: string) {
        expect(table).toBe('boards');
        return {
          select(_cols: string[]) {
            return this;
          },
          where(column: string, op: string, value: unknown) {
            expect(column).toBe('project_id');
            expect(op).toBe('=');
            requestedProjectId = value as string;
            return this;
          },
          async execute() {
            const boards: Board[] = [
              {
                id: 'board-1',
                project_id: projectId,
                name: 'Default',
                created_at: new Date(),
                updated_at: new Date(),
              },
            ];
            return boards;
          },
        };
      },
    } as any;

    const service = new BoardsService(fakeDb);

    const result = await service.listForProject(projectId);

    expect(requestedProjectId).toBe(projectId);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Default');
  });
});

describe('BoardsService - createBoard', () => {
  it('creates a board for a project', async () => {
    const projectId = 'proj-1';
    const inserted: Partial<Board>[] = [];

    const fakeDb = {
      insertInto(table: string) {
        expect(table).toBe('boards');
        return {
          values(values: Partial<Board>) {
            inserted.push(values);
            return {
              returningAll() {
                return {
                  async executeTakeFirstOrThrow() {
                    return {
                      id: 'board-1',
                      project_id: projectId,
                      name: values.name ?? 'New board',
                      created_at: new Date(),
                      updated_at: new Date(),
                    } satisfies Board;
                  },
                };
              },
            };
          },
        };
      },
    } as any;

    const service = new BoardsService(fakeDb);

    const board = await service.createBoard(projectId, { name: 'Kanban' });

    expect(inserted[0]).toMatchObject({
      project_id: projectId,
      name: 'Kanban',
    });
    expect(board.id).toBe('board-1');
  });
});

describe('BoardsService - getBoardDetail', () => {
  it('returns board with columns and tasks grouped by status', async () => {
    const boardId = 'board-1';
    const projectId = 'proj-1';

    let selectedBoardId: string | null = null;
    let selectedProjectForTasks: string | null = null;

    const fakeDb = {
      selectFrom(table: string) {
        if (table === 'boards') {
          return {
            selectAll() {
              return this;
            },
            where(column: string, op: string, value: string) {
              expect(column).toBe('id');
              expect(op).toBe('=');
              selectedBoardId = value;
              return this;
            },
            async executeTakeFirst() {
              const board: Board = {
                id: boardId,
                project_id: projectId,
                name: 'Default',
                created_at: new Date(),
                updated_at: new Date(),
              };
              return board;
            },
          };
        }

        if (table === 'board_columns') {
          return {
            selectAll() {
              return this;
            },
            where(column: string, op: string, value: string) {
              expect(column).toBe('board_id');
              expect(op).toBe('=');
              expect(value).toBe(boardId);
              return this;
            },
            orderBy(column: string, direction: 'asc' | 'desc') {
              expect(column).toBe('sort_order');
              expect(direction).toBe('asc');
              return this;
            },
            async execute() {
              const columns: BoardColumnWithTasks[] = [
                {
                  id: 'col-todo',
                  board_id: boardId,
                  status_id: 'todo',
                  sort_order: 0,
                  is_hidden: false,
                  tasks: [],
                },
                {
                  id: 'col-doing',
                  board_id: boardId,
                  status_id: 'doing',
                  sort_order: 1,
                  is_hidden: false,
                  tasks: [],
                },
              ];
              return columns;
            },
          };
        }

        if (table === 'tasks') {
          return {
            select(_cols: string[]) {
              return this;
            },
            where(column: string, op: string, value: string) {
              if (column === 'project_id') {
                expect(op).toBe('=');
                selectedProjectForTasks = value;
              }
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

    const service = new BoardsService(fakeDb);

    const detail = (await service.getBoardDetail(boardId)) as BoardDetail;

    expect(selectedBoardId).toBe(boardId);
    expect(selectedProjectForTasks).toBe(projectId);
    expect(detail.columns).toHaveLength(2);
    const todoColumn = detail.columns.find((c) => c.status_id === 'todo');
    expect(todoColumn?.tasks).toHaveLength(1);
    expect(todoColumn?.tasks[0].id).toBe('task-1');
  });
});

describe('BoardsService - updateColumns', () => {
  it('updates sort order and visibility for board columns', async () => {
    const boardId = 'board-1';
    const updated: any[] = [];
    const whereClauses: { column: string; value: string }[] = [];

    const fakeDb = {
      updateTable(table: string) {
        expect(table).toBe('board_columns');
        return {
          set(values: any) {
            updated.push(values);
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
        };
      },
    } as any;

    const service = new BoardsService(fakeDb);

    await service.updateColumns(boardId, [
      { id: 'col-todo', sort_order: 1, is_hidden: false },
      { id: 'col-doing', sort_order: 0, is_hidden: true },
    ]);

    expect(updated).toContainEqual({ sort_order: 1, is_hidden: false });
    expect(updated).toContainEqual({ sort_order: 0, is_hidden: true });
    expect(whereClauses).toEqual([
      { column: 'board_id', value: boardId },
      { column: 'id', value: 'col-todo' },
      { column: 'board_id', value: boardId },
      { column: 'id', value: 'col-doing' },
    ]);
  });
});

