import { describe, it, expect } from 'vitest';
import type { GitLink } from '@task-tracker/types';
import { GitLinksService } from './git-links.service';

// FR-14: Git links - link tasks to branches and PRs/MRs
describe('GitLinksService - listForTask', () => {
  it('returns git links for a task', async () => {
    const taskId = 'task-1';
    let requestedTaskId: string | null = null;

    const fakeDb = {
      selectFrom(table: string) {
        expect(table).toBe('git_links');
        return {
          selectAll() {
            return this;
          },
          where(column: string, op: string, value: unknown) {
            expect(column).toBe('task_id');
            expect(op).toBe('=');
            requestedTaskId = value as string;
            return this;
          },
          async execute() {
            const links: GitLink[] = [
              {
                id: 'gl-1',
                task_id: taskId,
                url: 'https://github.com/org/repo/pull/1',
                provider: 'github',
                kind: 'pull_request',
                created_at: new Date(),
                updated_at: new Date(),
              },
            ];
            return links;
          },
        };
      },
    } as any;

    const service = new GitLinksService(fakeDb);

    const result = await service.listForTask(taskId);

    expect(requestedTaskId).toBe(taskId);
    expect(result).toHaveLength(1);
    expect(result[0].url).toContain('/pull/1');
  });
});

describe('GitLinksService - addGitLink', () => {
  it('creates a git link for a task', async () => {
    const taskId = 'task-1';
    const inserted: Partial<GitLink>[] = [];

    const fakeDb = {
      insertInto(table: string) {
        expect(table).toBe('git_links');
        return {
          values(values: Partial<GitLink>) {
            inserted.push(values);
            return {
              returningAll() {
                return {
                  async executeTakeFirstOrThrow() {
                    return {
                      id: 'gl-1',
                      task_id: taskId,
                      url: values.url ?? '',
                      provider: values.provider ?? 'other',
                      kind: values.kind ?? 'other',
                      created_at: new Date(),
                      updated_at: new Date(),
                    } satisfies GitLink;
                  },
                };
              },
            };
          },
        };
      },
    } as any;

    const service = new GitLinksService(fakeDb);

    const link = await service.addGitLink(taskId, {
      url: 'https://gitlab.com/org/repo/-/merge_requests/5',
      provider: 'gitlab',
      kind: 'merge_request',
    });

    expect(inserted[0]).toMatchObject({
      task_id: taskId,
      url: 'https://gitlab.com/org/repo/-/merge_requests/5',
      provider: 'gitlab',
      kind: 'merge_request',
    });
    expect(link.id).toBe('gl-1');
  });
});

describe('GitLinksService - removeGitLink', () => {
  it('deletes a git link for a task', async () => {
    const taskId = 'task-1';
    const linkId = 'gl-1';
    const whereClauses: { column: string; value: string }[] = [];

    const fakeDb = {
      deleteFrom(table: string) {
        expect(table).toBe('git_links');
        return {
          where(column: string, op: string, value: string) {
            expect(op).toBe('=');
            whereClauses.push({ column, value });
            return this;
          },
          async executeTakeFirst() {
            return undefined;
          },
        };
      },
    } as any;

    const service = new GitLinksService(fakeDb);

    await service.removeGitLink(taskId, linkId);

    expect(whereClauses).toEqual([
      { column: 'task_id', value: taskId },
      { column: 'id', value: linkId },
    ]);
  });
});

