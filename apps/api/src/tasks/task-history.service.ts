import { Inject, Injectable } from '@nestjs/common';
import type { Kysely } from 'kysely';
import type { TaskHistoryEntry } from '@task-tracker/types';
import { KYSELY } from '../db/db.module';
import type { Database } from '../db/database';

@Injectable()
export class TaskHistoryService {
  constructor(@Inject(KYSELY) private readonly db: Kysely<Database>) {}

  async recordFieldChange(
    taskId: string,
    actorUserId: string,
    field: string,
    oldValue: string | null,
    newValue: string | null,
  ): Promise<void> {
    await this.db
      .insertInto('task_history')
      .values({
        task_id: taskId,
        actor_user_id: actorUserId,
        field,
        old_value: oldValue,
        new_value: newValue,
      })
      .execute();
  }

  async listForTask(taskId: string): Promise<TaskHistoryEntry[]> {
    const rows = await this.db
      .selectFrom('task_history')
      .selectAll()
      .where('task_id', '=', taskId)
      .execute();

    return rows as TaskHistoryEntry[];
  }
}

