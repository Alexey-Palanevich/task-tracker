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
import type { TimeEntry } from '@task-tracker/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { TimeEntriesService } from './time-entries.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class TimeEntriesController {
  constructor(private readonly timeEntriesService: TimeEntriesService) {}

  @Get('tasks/:id/time-entries')
  async listForTask(@Param('id') taskId: string): Promise<TimeEntry[]> {
    return this.timeEntriesService.listForTask(taskId);
  }

  @Post('tasks/:id/time-entries')
  async addEntry(
    @Param('id') taskId: string,
    @CurrentUser() user: { id: string },
    @Body()
    body: {
      duration_minutes: number;
      date: string;
      description?: string | null;
    },
  ): Promise<TimeEntry> {
    return this.timeEntriesService.addEntry(taskId, user.id, {
      duration_minutes: body.duration_minutes,
      date: new Date(body.date),
      description: body.description ?? null,
    });
  }

  @Put('tasks/:taskId/time-entries/:entryId')
  async updateEntry(
    @Param('entryId') entryId: string,
    @CurrentUser() user: { id: string },
    @Body()
    body: {
      duration_minutes?: number;
      date?: string;
      description?: string | null;
    },
  ): Promise<TimeEntry> {
    return this.timeEntriesService.updateEntry(entryId, user.id, {
      duration_minutes: body.duration_minutes,
      date: body.date ? new Date(body.date) : undefined,
      description: body.description,
    });
  }

  @Delete('tasks/:taskId/time-entries/:entryId')
  async deleteEntry(
    @Param('entryId') entryId: string,
    @CurrentUser() user: { id: string },
  ): Promise<{ status: 'deleted' }> {
    await this.timeEntriesService.deleteEntry(entryId, user.id);
    return { status: 'deleted' };
  }
}

