import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Kysely } from 'kysely';
import type { Board, BoardDetail, BoardColumnWithTasks, TaskSummary } from '@task-tracker/types';
import { KYSELY } from '../db/db.module';
import type { Database } from '../db/database';

@Injectable()
export class BoardsService {
  constructor(@Inject(KYSELY) private readonly db: Kysely<Database>) {}

  async listForProject(projectId: string): Promise<Board[]> {
    const rows = await this.db
      .selectFrom('boards')
      .select(['id', 'project_id', 'name', 'created_at', 'updated_at'])
      .where('project_id', '=', projectId)
      .execute();

    return rows as Board[];
  }

  async createBoard(projectId: string, input: { name: string }): Promise<Board> {
    const board = await this.db
      .insertInto('boards')
      .values({
        project_id: projectId,
        name: input.name,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return board as Board;
  }

  async getBoardDetail(boardId: string): Promise<BoardDetail> {
    const boardRow = await this.db
      .selectFrom('boards')
      .selectAll()
      .where('id', '=', boardId)
      .executeTakeFirst();

    if (!boardRow) {
      throw new NotFoundException('Board not found');
    }

    const columnsRows = await this.db
      .selectFrom('board_columns')
      .selectAll()
      .where('board_id', '=', boardId)
      .orderBy('sort_order', 'asc')
      .execute();

    const tasksRows = await this.db
      .selectFrom('tasks')
      .select(['id', 'project_id', 'title', 'status_id', 'priority', 'due_date'])
      .where('project_id', '=', boardRow.project_id)
      .execute();

    const tasks: TaskSummary[] = tasksRows.map(
      (row) =>
        ({
          id: row.id,
          project_id: row.project_id,
          title: row.title,
          status_id: row.status_id,
          priority: row.priority,
          due_date: row.due_date,
          assignee_ids: [],
          label_ids: [],
        }) as TaskSummary,
    );

    const columns: BoardColumnWithTasks[] = (columnsRows as any[]).map((col) => ({
      ...col,
      tasks: tasks.filter((task) => task.status_id === col.status_id && !col.is_hidden),
    }));

    return {
      ...(boardRow as Board),
      columns,
    };
  }

  async updateBoard(boardId: string, input: { name?: string }): Promise<Board> {
    const board = await this.db
      .updateTable('boards')
      .set({
        ...(input.name !== undefined ? { name: input.name } : {}),
      })
      .where('id', '=', boardId)
      .returningAll()
      .executeTakeFirstOrThrow();

    return board as Board;
  }

  async updateColumns(
    boardId: string,
    columns: { id: string; sort_order: number; is_hidden: boolean }[],
  ): Promise<void> {
    for (const column of columns) {
      await this.db
        .updateTable('board_columns')
        .set({
          sort_order: column.sort_order,
          is_hidden: column.is_hidden,
        })
        .where('board_id', '=', boardId)
        .where('id', '=', column.id)
        .executeTakeFirst();
    }
  }
}

