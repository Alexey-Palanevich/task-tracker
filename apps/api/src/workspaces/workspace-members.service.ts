import { Inject, Injectable } from '@nestjs/common';
import type { Kysely } from 'kysely';
import type { WorkspaceMemberResponse, WorkspaceRole } from '@task-tracker/types';
import { KYSELY } from '../db/db.module';
import type { Database } from '../db/database';

@Injectable()
export class WorkspaceMembersService {
  constructor(@Inject(KYSELY) private readonly db: Kysely<Database>) {}

  async listMembers(workspaceId: string): Promise<WorkspaceMemberResponse[]> {
    const rows = await this.db
      .selectFrom('workspace_members')
      .innerJoin('users', 'users.id', 'workspace_members.user_id')
      .select([
        'workspace_members.role as role',
        'users.id as id',
        'users.email as email',
        'users.name as name',
        'users.avatar_url as avatar_url',
      ])
      .where('workspace_members.workspace_id', '=', workspaceId)
      .execute();

    return rows.map((row) => ({
      role: row.role as WorkspaceRole,
      user: {
        id: row.id,
        email: row.email,
        name: row.name,
        avatar_url: row.avatar_url,
      },
    }));
  }
}

