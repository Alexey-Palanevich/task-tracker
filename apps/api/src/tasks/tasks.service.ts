import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import type { Kysely } from 'kysely';
import type { Task, TaskSummary } from '@task-tracker/types';
import { KYSELY } from '../db/db.module';
import type { Database } from '../db/database';

interface TaskFilters {
  // Minimal filter set for now; can be extended later.
}

@Injectable()
export class TasksService {
  constructor(@Inject(KYSELY) private readonly db: Kysely<Database>) {}

  async listForProject(projectId: string, _filters: TaskFilters): Promise<TaskSummary[]> {
    const rows = await this.db
      .selectFrom('tasks')
      .select([
        'id',
        'project_id',
        'title',
        'status_id',
        'priority',
        'due_date',
      ])
      .where('project_id', '=', projectId)
      .execute();

    return rows.map(
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
  }

  async createTask(
    projectId: string,
    input: {
      title: string;
      description: string | null;
      status_id: string;
      priority: string;
      parent_task_id: string | null;
    },
  ): Promise<Task> {
    if (input.parent_task_id) {
      const parent = await this.db
        .selectFrom('tasks')
        .selectAll()
        .where('id', '=', input.parent_task_id)
        .executeTakeFirst();

      if (parent && (parent as Task).parent_task_id) {
        throw new BadRequestException('Subtasks can only have a single level of depth');
      }
    }

    const task = await this.db
      .insertInto('tasks')
      .values({
        project_id: projectId,
        title: input.title,
        description: input.description,
        status_id: input.status_id,
        priority: input.priority,
        parent_task_id: input.parent_task_id,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return task as Task;
  }

  async getById(taskId: string): Promise<Task | null> {
    const row = await this.db
      .selectFrom('tasks')
      .selectAll()
      .where('id', '=', taskId)
      .executeTakeFirst();

    if (!row) {
      return null;
    }

    return row as Task;
  }
}

