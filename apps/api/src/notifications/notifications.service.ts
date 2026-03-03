import { Inject, Injectable } from '@nestjs/common';
import type { Kysely } from 'kysely';
import type { Notification } from '@task-tracker/types';
import { KYSELY } from '../db/db.module';
import type { Database } from '../db/database';

@Injectable()
export class NotificationsService {
  constructor(@Inject(KYSELY) private readonly db: Kysely<Database>) {}

  async listForUser(userId: string): Promise<Notification[]> {
    const rows = await this.db
      .selectFrom('notifications')
      .selectAll()
      .where('user_id', '=', userId)
      .orderBy('created_at', 'desc')
      .execute();

    return rows as Notification[];
  }

  async markRead(notificationId: string, userId: string): Promise<Notification> {
    const updated = await this.db
      .updateTable('notifications')
      .set({
        is_read: true,
        read_at: new Date(),
      })
      .where('id', '=', notificationId)
      .where('user_id', '=', userId)
      .returningAll()
      .executeTakeFirstOrThrow();

    return updated as Notification;
  }

  async markAllRead(userId: string): Promise<void> {
    await this.db
      .updateTable('notifications')
      .set({
        is_read: true,
        read_at: new Date(),
      })
      .where('user_id', '=', userId)
      .executeTakeFirst();
  }
}

