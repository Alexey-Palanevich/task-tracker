/**
 * Git link types (FR-14).
 */

export type GitProvider = 'github' | 'gitlab' | 'other';

export type GitLinkKind = 'branch' | 'pull_request' | 'merge_request' | 'other';

export interface GitLink {
  id: string;
  task_id: string;
  url: string;
  provider: GitProvider;
  kind: GitLinkKind;
  created_at: Date;
  updated_at: Date;
}

