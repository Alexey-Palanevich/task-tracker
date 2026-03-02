import { Inject, Injectable } from '@nestjs/common';
import type { Kysely } from 'kysely';
import type { Label } from '@task-tracker/types';
import { KYSELY } from '../db/db.module';
import type { Database } from '../db/database';

@Injectable()
export class LabelsService {
  constructor(@Inject(KYSELY) private readonly db: Kysely<Database>) {}

  async listForWorkspace(workspaceId: string): Promise<Label[]> {
    const rows = await this.db
      .selectFrom('labels')
      .select(['id', 'workspace_id', 'name', 'color', 'created_at', 'updated_at'])
      .where('workspace_id', '=', workspaceId)
      .execute();

    return rows as Label[];
  }

  async createLabel(
    workspaceId: string,
    input: { name: string; color: string },
  ): Promise<Label> {
    const label = await this.db
      .insertInto('labels')
      .values({
        workspace_id: workspaceId,
        name: input.name,
        color: input.color,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return label as Label;
  }

  async updateLabel(
    workspaceId: string,
    labelId: string,
    input: { name?: string; color?: string },
  ): Promise<Label> {
    const label = await this.db
      .updateTable('labels')
      .set({
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.color !== undefined ? { color: input.color } : {}),
      })
      .where('workspace_id', '=', workspaceId)
      .where('id', '=', labelId)
      .returningAll()
      .executeTakeFirstOrThrow();

    return label as Label;
  }

  async deleteLabel(workspaceId: string, labelId: string): Promise<void> {
    await this.db
      .deleteFrom('labels')
      .where('workspace_id', '=', workspaceId)
      .where('id', '=', labelId)
      .executeTakeFirst();
  }
}

