import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import type { Board, BoardDetail } from '@task-tracker/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BoardsService } from './boards.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Get('projects/:id/boards')
  async listForProject(@Param('id') projectId: string): Promise<Board[]> {
    return this.boardsService.listForProject(projectId);
  }

  @Post('projects/:id/boards')
  async createBoard(
    @Param('id') projectId: string,
    @Body() body: { name: string },
  ): Promise<Board> {
    return this.boardsService.createBoard(projectId, { name: body.name });
  }

  @Get('boards/:id')
  async getBoard(@Param('id') boardId: string): Promise<BoardDetail> {
    return this.boardsService.getBoardDetail(boardId);
  }

  @Put('boards/:id')
  async updateBoard(
    @Param('id') boardId: string,
    @Body() body: { name?: string },
  ): Promise<Board> {
    return this.boardsService.updateBoard(boardId, { name: body.name });
  }

  @Put('boards/:id/columns')
  async updateColumns(
    @Param('id') boardId: string,
    @Body()
    body: {
      columns: { id: string; sort_order: number; is_hidden: boolean }[];
    },
  ): Promise<{ status: 'ok' }> {
    await this.boardsService.updateColumns(boardId, body.columns);
    return { status: 'ok' };
  }
}

