import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Kysely } from 'kysely';
import type { WorkspaceRole } from '@task-tracker/types';
import { KYSELY } from '../db/db.module';
import type { Database } from '../db/database';
import { WORKSPACE_ROLES_KEY } from './workspace-role.decorator';

@Injectable()
export class WorkspaceRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(KYSELY) private readonly db: Kysely<Database>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles =
      this.reflector.getAllAndOverride<WorkspaceRole[]>(WORKSPACE_ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as { id: string } | undefined;
    const params = request.params ?? {};
    const workspaceId: string | undefined = params.workspaceId ?? params.id;

    if (!user?.id || !workspaceId) {
      throw new ForbiddenException('Missing workspace context');
    }

    const membership = await this.db
      .selectFrom('workspace_members')
      .selectAll()
      .where('workspace_id', '=', workspaceId)
      .where('user_id', '=', user.id)
      .executeTakeFirst();

    if (!membership) {
      throw new ForbiddenException('Workspace membership required');
    }

    if (!requiredRoles.includes(membership.role as WorkspaceRole)) {
      throw new ForbiddenException('Insufficient workspace role');
    }

    return true;
  }
}

