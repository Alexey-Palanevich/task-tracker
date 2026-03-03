import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { GitLink, GitLinkKind, GitProvider } from '@task-tracker/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GitLinksService } from './git-links.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class GitLinksController {
  constructor(private readonly gitLinksService: GitLinksService) {}

  @Get('tasks/:id/git-links')
  async listForTask(@Param('id') taskId: string): Promise<GitLink[]> {
    return this.gitLinksService.listForTask(taskId);
  }

  @Post('tasks/:id/git-links')
  async addGitLink(
    @Param('id') taskId: string,
    @Body()
    body: {
      url: string;
      provider: GitProvider;
      kind: GitLinkKind;
    },
  ): Promise<GitLink> {
    return this.gitLinksService.addGitLink(taskId, {
      url: body.url,
      provider: body.provider,
      kind: body.kind,
    });
  }

  @Delete('tasks/:taskId/git-links/:linkId')
  async removeGitLink(
    @Param('taskId') taskId: string,
    @Param('linkId') linkId: string,
  ): Promise<{ status: 'deleted' }> {
    await this.gitLinksService.removeGitLink(taskId, linkId);
    return { status: 'deleted' };
  }
}

