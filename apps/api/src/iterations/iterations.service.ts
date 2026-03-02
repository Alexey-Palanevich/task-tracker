import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Kysely } from 'kysely';
import type { Iteration, IterationDetail, IterationReport, TaskSummary } from '@task-tracker/types';
import { KYSELY } from '../db/db.module';
import type { Database } from '../db/database';

@Injectable()
export class IterationsService {
  constructor(@Inject(KYSELY) private readonly db: Kysely<Database>) {}

  async listForWorkspace(workspaceId: string): Promise<Iteration[]> {
    const rows = await this.db
      .selectFrom('iterations')
      .selectAll()
      .where('workspace_id', '=', workspaceId)
      .orderBy('start_date', 'asc')
      .execute();

    return rows as Iteration[];
  }

  async createIteration(
    workspaceId: string,
    input: { name: string; start_date: Date; end_date: Date },
  ): Promise<Iteration> {
    const iteration = await this.db
      .insertInto('iterations')
      .values({
        workspace_id: workspaceId,
        name: input.name,
        start_date: input.start_date,
        end_date: input.end_date,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return iteration as Iteration;
  }

  async getIterationDetail(iterationId: string): Promise<IterationDetail> {
    const iterationRow = await this.db
      .selectFrom('iterations')
      .selectAll()
      .where('id', '=', iterationId)
      .executeTakeFirst();

    if (!iterationRow) {
      throw new NotFoundException('Iteration not found');
    }

    const taskRows = await this.db
      .selectFrom('tasks')
      .select(['id', 'project_id', 'title', 'status_id', 'priority', 'due_date'])
      .where('iteration_id', '=', iterationId)
      .execute();

    const tasks: TaskSummary[] = taskRows.map(
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

    return {
      ...(iterationRow as Iteration),
      tasks,
    };
  }

  async updateIteration(
    iterationId: string,
    input: { name?: string; start_date?: Date; end_date?: Date },
  ): Promise<Iteration> {
    const updated = await this.db
      .updateTable('iterations')
      .set({
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.start_date !== undefined ? { start_date: input.start_date } : {}),
        ...(input.end_date !== undefined ? { end_date: input.end_date } : {}),
      })
      .where('id', '=', iterationId)
      .returningAll()
      .executeTakeFirstOrThrow();

    return updated as Iteration;
  }

  async deleteIteration(iterationId: string): Promise<void> {
    const existing = await this.db
      .selectFrom('iterations')
      .selectAll()
      .where('id', '=', iterationId)
      .executeTakeFirst();

    if (!existing) {
      throw new NotFoundException('Iteration not found');
    }

    await this.db.deleteFrom('iterations').where('id', '=', iterationId).executeTakeFirst();
  }

  async getIterationReport(iterationId: string): Promise<IterationReport> {
    const iteration = await this.db
      .selectFrom('iterations')
      .selectAll()
      .where('id', '=', iterationId)
      .executeTakeFirst();

    if (!iteration) {
      throw new NotFoundException('Iteration not found');
    }

    const taskRows = await this.db
      .selectFrom('tasks')
      .select(['id', 'status_id'])
      .where('iteration_id', '=', iterationId)
      .execute();

    const statusIds = Array.from(new Set(taskRows.map((t) => t.status_id)));

    const statusRows = await this.db
      .selectFrom('statuses')
      .select(['id', 'is_closed'])
      .where('id', 'in', statusIds)
      .execute();

    const closedStatusIds = new Set(statusRows.filter((s) => s.is_closed).map((s) => s.id));

    const plannedTasks = taskRows.length;
    const completedTasks = taskRows.filter((t) => closedStatusIds.has(t.status_id)).length;

    return {
      iteration_id: iterationId,
      planned_tasks: plannedTasks,
      completed_tasks: completedTasks,
    };
  }
}

