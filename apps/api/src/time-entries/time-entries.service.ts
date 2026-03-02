import { Inject, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import type { Kysely } from 'kysely';
import type { TimeEntry } from '@task-tracker/types';
import { KYSELY } from '../db/db.module';
import type { Database } from '../db/database';

@Injectable()
export class TimeEntriesService {
  constructor(@Inject(KYSELY) private readonly db: Kysely<Database>) {}

  async listForTask(taskId: string): Promise<TimeEntry[]> {
    const rows = await this.db
      .selectFrom('time_entries')
      .selectAll()
      .where('task_id', '=', taskId)
      .where('is_deleted', '=', false)
      .orderBy('date', 'asc')
      .orderBy('created_at', 'asc')
      .execute();

    return rows as TimeEntry[];
  }

  async addEntry(
    taskId: string,
    userId: string,
    input: {
      duration_minutes: number;
      date: Date;
      description?: string | null;
    },
  ): Promise<TimeEntry> {
    const entry = await this.db
      .insertInto('time_entries')
      .values({
        task_id: taskId,
        user_id: userId,
        duration_minutes: input.duration_minutes,
        date: input.date,
        description: input.description ?? null,
        billable: false,
        is_deleted: false,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return entry as TimeEntry;
  }

  async updateEntry(
    entryId: string,
    userId: string,
    input: {
      duration_minutes?: number;
      date?: Date;
      description?: string | null;
    },
  ): Promise<TimeEntry> {
    const existing = await this.db
      .selectFrom('time_entries')
      .selectAll()
      .where('id', '=', entryId)
      .where('is_deleted', '=', false)
      .executeTakeFirst();

    if (!existing) {
      throw new NotFoundException('Time entry not found');
    }

    if (existing.user_id !== userId) {
      throw new ForbiddenException('Only the author can edit this time entry');
    }

    const updated = await this.db
      .updateTable('time_entries')
      .set({
        ...(input.duration_minutes !== undefined ? { duration_minutes: input.duration_minutes } : {}),
        ...(input.date !== undefined ? { date: input.date } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
      })
      .where('id', '=', entryId)
      .returningAll()
      .executeTakeFirstOrThrow();

    return updated as TimeEntry;
  }

  async deleteEntry(entryId: string, userId: string): Promise<void> {
    const existing = await this.db
      .selectFrom('time_entries')
      .selectAll()
      .where('id', '=', entryId)
      .executeTakeFirst();

    if (!existing) {
      throw new NotFoundException('Time entry not found');
    }

    if (existing.user_id !== userId) {
      throw new ForbiddenException('Only the author can delete this time entry');
    }

    await this.db
      .updateTable('time_entries')
      .set({
        is_deleted: true,
      })
      .where('id', '=', entryId)
      .executeTakeFirst();
  }
}

