import { Inject, Injectable } from '@nestjs/common';
import type { Kysely } from 'kysely';
import type { WorkspaceDetail, WorkspaceSummary } from '@task-tracker/types';
import { KYSELY } from '../db/db.module';
import type { Database } from '../db/database';

@Injectable()
export class WorkspacesService {
  constructor(@Inject(KYSELY) private readonly db: Kysely<Database>) {}

  async listForUser(userId: string): Promise<WorkspaceSummary[]> {
    const rows = await this.db
      .selectFrom('workspace_members')
      .innerJoin('workspaces', 'workspaces.id', 'workspace_members.workspace_id')
      .select([
        'workspaces.id as id',
        'workspaces.name as name',
        'workspaces.description as description',
        'workspaces.icon_url as icon_url',
      ])
      .where('workspace_members.user_id', '=', userId)
      .execute();

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      icon_url: row.icon_url,
    }));
  }

  async createWorkspace(
    ownerId: string,
    input: { name: string; description?: string | null; icon_url?: string | null },
  ): Promise<WorkspaceDetail> {
    const workspace = await this.db
      .insertInto('workspaces')
      .values({
        name: input.name,
        description: input.description ?? null,
        icon_url: input.icon_url ?? null,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    await this.db
      .insertInto('workspace_members')
      .values({
        workspace_id: workspace.id,
        user_id: ownerId,
        role: 'owner',
      })
      .execute();

    return workspace as WorkspaceDetail;
  }

  async getById(workspaceId: string): Promise<WorkspaceDetail | null> {
    const row = await this.db
      .selectFrom('workspaces')
      .selectAll()
      .where('id', '=', workspaceId)
      .executeTakeFirst();

    if (!row) {
      return null;
    }

    return row as WorkspaceDetail;
  }
}

