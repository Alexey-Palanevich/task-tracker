import { Inject, Injectable } from '@nestjs/common';
import type { Kysely } from 'kysely';
import type { GitLink, GitLinkKind, GitProvider } from '@task-tracker/types';
import { KYSELY } from '../db/db.module';
import type { Database } from '../db/database';

@Injectable()
export class GitLinksService {
  constructor(@Inject(KYSELY) private readonly db: Kysely<Database>) {}

  async listForTask(taskId: string): Promise<GitLink[]> {
    const rows = await this.db
      .selectFrom('git_links')
      .selectAll()
      .where('task_id', '=', taskId)
      .execute();

    return rows as GitLink[];
  }

  async addGitLink(
    taskId: string,
    input: { url: string; provider: GitProvider; kind: GitLinkKind },
  ): Promise<GitLink> {
    const link = await this.db
      .insertInto('git_links')
      .values({
        task_id: taskId,
        url: input.url,
        provider: input.provider,
        kind: input.kind,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return link as GitLink;
  }

  async removeGitLink(taskId: string, linkId: string): Promise<void> {
    await this.db
      .deleteFrom('git_links')
      .where('task_id', '=', taskId)
      .where('id', '=', linkId)
      .executeTakeFirst();
  }
}

