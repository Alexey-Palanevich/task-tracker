import { Inject, Injectable } from '@nestjs/common';
import type { Kysely } from 'kysely';
import type { TaskRelation } from '@task-tracker/types';
import { KYSELY } from '../db/db.module';
import type { Database } from '../db/database';

@Injectable()
export class TaskRelationsService {
  constructor(@Inject(KYSELY) private readonly db: Kysely<Database>) {}

  async addRelation(taskId: string, relatedTaskId: string, type: string): Promise<void> {
    await this.db
      .insertInto('task_relations')
      .values({
        task_id: taskId,
        related_task_id: relatedTaskId,
        type,
      })
      .execute();
  }

  async listForTask(taskId: string): Promise<TaskRelation[]> {
    const rows = await this.db
      .selectFrom('task_relations')
      .selectAll()
      .where('task_id', '=', taskId)
      .execute();

    return rows as TaskRelation[];
  }
}

