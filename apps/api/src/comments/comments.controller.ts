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
import type { Comment } from '@task-tracker/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CommentsService } from './comments.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('tasks/:id/comments')
  async listForTask(@Param('id') taskId: string): Promise<Comment[]> {
    return this.commentsService.listForTask(taskId);
  }

  @Post('tasks/:id/comments')
  async addComment(
    @Param('id') taskId: string,
    @CurrentUser() user: { id: string },
    @Body() body: { content: string },
  ): Promise<Comment> {
    return this.commentsService.addComment(taskId, user.id, body.content);
  }

  @Put('tasks/:taskId/comments/:commentId')
  async updateComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: { id: string },
    @Body() body: { content: string },
  ): Promise<Comment> {
    return this.commentsService.updateComment(commentId, user.id, body.content);
  }

  @Delete('tasks/:taskId/comments/:commentId')
  async deleteComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: { id: string },
  ): Promise<{ status: 'deleted' }> {
    await this.commentsService.deleteComment(commentId, user.id);
    return { status: 'deleted' };
  }
}

