import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import type { Label } from '@task-tracker/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WorkspaceRoles } from '../auth/workspace-role.decorator';
import { WorkspaceRoleGuard } from '../auth/workspace-role.guard';
import { LabelsService } from './labels.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  @Get('workspaces/:id/labels')
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles('guest', 'member', 'admin', 'owner')
  async listForWorkspace(@Param('id') workspaceId: string): Promise<Label[]> {
    return this.labelsService.listForWorkspace(workspaceId);
  }

  @Post('workspaces/:id/labels')
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles('admin', 'owner')
  async createLabel(
    @Param('id') workspaceId: string,
    @Body() body: { name: string; color: string },
  ): Promise<Label> {
    return this.labelsService.createLabel(workspaceId, {
      name: body.name,
      color: body.color,
    });
  }

  @Put('workspaces/:id/labels/:labelId')
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles('admin', 'owner')
  async updateLabel(
    @Param('id') workspaceId: string,
    @Param('labelId') labelId: string,
    @Body() body: { name?: string; color?: string },
  ): Promise<Label> {
    return this.labelsService.updateLabel(workspaceId, labelId, {
      name: body.name,
      color: body.color,
    });
  }

  @Delete('workspaces/:id/labels/:labelId')
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles('admin', 'owner')
  async deleteLabel(
    @Param('id') workspaceId: string,
    @Param('labelId') labelId: string,
  ): Promise<{ status: 'deleted' }> {
    await this.labelsService.deleteLabel(workspaceId, labelId);
    return { status: 'deleted' };
  }
}

