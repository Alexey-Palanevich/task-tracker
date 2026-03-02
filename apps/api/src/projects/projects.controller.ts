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
import type { Project, ProjectStatus, ProjectSummary } from '@task-tracker/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectsService } from './projects.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get('workspaces/:workspace_id/projects')
  async listForWorkspace(@Param('workspace_id') workspaceId: string): Promise<ProjectSummary[]> {
    return this.projectsService.listForWorkspace(workspaceId);
  }

  @Post('workspaces/:workspace_id/projects')
  async createProject(
    @Param('workspace_id') workspaceId: string,
    @Body()
    body: {
      name: string;
      description?: string | null;
      color?: string | null;
      icon?: string | null;
    },
  ): Promise<Project> {
    return this.projectsService.createProject(workspaceId, {
      name: body.name,
      description: body.description ?? null,
      color: body.color ?? null,
      icon: body.icon ?? null,
    });
  }

  @Get('projects/:id')
  async getProject(@Param('id') id: string): Promise<Project> {
    const project = await this.projectsService.getById(id);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  @Delete('projects/:id')
  async archiveProject(@Param('id') id: string): Promise<{ status: 'archived' }> {
    await this.projectsService.archiveProject(id);
    return { status: 'archived' };
  }

  @Get('projects/:id/statuses')
  async getStatuses(@Param('id') id: string): Promise<ProjectStatus[]> {
    return this.projectsService.getStatusesForProject(id);
  }

  @Post('projects/:id/statuses')
  async createStatus(
    @Param('id') _id: string,
    @Body()
    _body: {
      name: string;
      color?: string | null;
      is_default?: boolean;
      is_closed?: boolean;
    },
  ): Promise<{ status: 'not_implemented' }> {
    // Placeholder; full status management will be implemented in a later phase.
    return { status: 'not_implemented' };
  }
}

