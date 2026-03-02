import { Inject, Injectable } from '@nestjs/common';
import type { Kysely } from 'kysely';
import type { Project, ProjectStatus, ProjectSummary } from '@task-tracker/types';
import { KYSELY } from '../db/db.module';
import type { Database } from '../db/database';

@Injectable()
export class ProjectsService {
  constructor(@Inject(KYSELY) private readonly db: Kysely<Database>) {}

  async listForWorkspace(workspaceId: string): Promise<ProjectSummary[]> {
    const rows = await this.db
      .selectFrom('projects')
      .select([
        'id',
        'workspace_id',
        'name',
        'description',
        'color',
        'icon',
        'is_archived',
      ])
      .where('workspace_id', '=', workspaceId)
      .where('is_archived', '=', false)
      .execute();

    return rows as ProjectSummary[];
  }

  async createProject(
    workspaceId: string,
    input: { name: string; description?: string | null; color?: string | null; icon?: string | null },
  ): Promise<Project> {
    const project = await this.db
      .insertInto('projects')
      .values({
        workspace_id: workspaceId,
        name: input.name,
        description: input.description ?? null,
        color: input.color ?? null,
        icon: input.icon ?? null,
        is_archived: false,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return project as Project;
  }

  async archiveProject(projectId: string): Promise<void> {
    await this.db
      .updateTable('projects')
      .set({ is_archived: true })
      .where('id', '=', projectId)
      .executeTakeFirst();
  }

  async getById(projectId: string): Promise<Project | null> {
    const row = await this.db
      .selectFrom('projects')
      .selectAll()
      .where('id', '=', projectId)
      .executeTakeFirst();

    if (!row) {
      return null;
    }

    return row as Project;
  }

  async getStatusesForProject(projectId: string): Promise<ProjectStatus[]> {
    const rows = await this.db
      .selectFrom('statuses')
      .select(['id', 'project_id', 'name', 'color', 'sort_order', 'is_default', 'is_closed'])
      .where('project_id', '=', projectId)
      .execute();

    return rows as ProjectStatus[];
  }
}

