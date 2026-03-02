import { describe, it, expect } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import type { WorkspaceRole } from '@task-tracker/types';
import { WorkspaceRoleGuard } from './workspace-role.guard';

type Membership = {
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
};

function createFakeDb(membership: Membership | undefined) {
  return {
    selectFrom() {
      return {
        selectAll() {
          return this;
        },
        where() {
          return this;
        },
        async executeTakeFirst() {
          return membership;
        },
      };
    },
  } as any;
}

function createFakeReflector(allowedRoles: WorkspaceRole[] | undefined) {
  return {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getAllAndOverride<T>(_key: string, _targets: unknown[]): T | undefined {
      return allowedRoles as unknown as T;
    },
  } as any;
}

function createExecutionContext(userId: string, workspaceId: string) {
  return {
    switchToHttp() {
      return {
        getRequest() {
          return {
            user: { id: userId },
            params: { id: workspaceId },
          };
        },
      };
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    getHandler() {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    getClass() {},
  } as any;
}

// FR-1.5 / FR-9.6: Workspace roles and role-based access control
describe('WorkspaceRoleGuard', () => {
  it('allows access when membership has an allowed role', async () => {
    const membership: Membership = {
      workspace_id: 'ws-1',
      user_id: 'user-1',
      role: 'admin',
    };
    const db = createFakeDb(membership);
    const reflector = createFakeReflector(['admin']);
    const guard = new WorkspaceRoleGuard(reflector, db);

    const canActivate = await guard.canActivate(createExecutionContext('user-1', 'ws-1'));

    expect(canActivate).toBe(true);
  });

  it('denies access when membership is missing', async () => {
    const db = createFakeDb(undefined);
    const reflector = createFakeReflector(['member']);
    const guard = new WorkspaceRoleGuard(reflector, db);

    await expect(
      guard.canActivate(createExecutionContext('user-1', 'ws-1')),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('denies access when membership role is insufficient', async () => {
    const membership: Membership = {
      workspace_id: 'ws-1',
      user_id: 'user-1',
      role: 'member',
    };
    const db = createFakeDb(membership);
    const reflector = createFakeReflector(['admin', 'owner']);
    const guard = new WorkspaceRoleGuard(reflector, db);

    await expect(
      guard.canActivate(createExecutionContext('user-1', 'ws-1')),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});

