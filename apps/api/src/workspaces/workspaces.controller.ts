import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { WorkspaceDetail, WorkspaceSummary, WorkspaceMemberResponse } from '@task-tracker/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { WorkspaceRoles } from '../auth/workspace-role.decorator';
import { WorkspaceRoleGuard } from '../auth/workspace-role.guard';
import { WorkspacesService } from './workspaces.service';
import { WorkspaceMembersService } from './workspace-members.service';

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(
    private readonly workspacesService: WorkspacesService,
    private readonly workspaceMembersService: WorkspaceMembersService,
  ) {}

  @Get()
  async list(@CurrentUser() user: { id: string }): Promise<WorkspaceSummary[]> {
    return this.workspacesService.listForUser(user.id);
  }

  @Post()
  async create(
    @CurrentUser() user: { id: string },
    @Body() body: { name: string; description?: string | null; icon_url?: string | null },
  ): Promise<WorkspaceDetail> {
    return this.workspacesService.createWorkspace(user.id, {
      name: body.name,
      description: body.description ?? null,
      icon_url: body.icon_url ?? null,
    });
  }

  @Get(':id')
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles('guest', 'member', 'admin', 'owner')
  async getOne(@Param('id') id: string): Promise<WorkspaceDetail> {
    const workspace = await this.workspacesService.getById(id);
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }
    return workspace;
  }

  @Get(':id/members')
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles('admin', 'owner')
  async listMembers(@Param('id') id: string): Promise<WorkspaceMemberResponse[]> {
    return this.workspaceMembersService.listMembers(id);
  }

  @Post(':id/members')
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles('admin', 'owner')
  // Placeholder implementation; will be expanded with full member management.
  async addMember(
    @Param('id') _id: string,
    @Body() _body: { user_id: string; role: string },
  ): Promise<{ status: 'not_implemented' }> {
    return { status: 'not_implemented' };
  }

  @Delete(':id/members/:userId')
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles('admin', 'owner')
  async removeMember(
    @Param('id') _id: string,
    @Param('userId') _userId: string,
  ): Promise<{ status: 'not_implemented' }> {
    return { status: 'not_implemented' };
  }
}

