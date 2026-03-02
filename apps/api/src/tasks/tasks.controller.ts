import { Body, Controller, Get, NotFoundException, Param, Post, UseGuards } from '@nestjs/common';
import type { Task, TaskHistoryEntry, TaskRelation, TaskSummary } from '@task-tracker/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TasksService } from './tasks.service';
import { TaskHistoryService } from './task-history.service';
import { TaskRelationsService } from './task-relations.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly taskHistoryService: TaskHistoryService,
    private readonly taskRelationsService: TaskRelationsService,
  ) {}

  @Get('projects/:project_id/tasks')
  async listForProject(@Param('project_id') projectId: string): Promise<TaskSummary[]> {
    return this.tasksService.listForProject(projectId, {});
  }

  @Post('projects/:project_id/tasks')
  async createTask(
    @Param('project_id') projectId: string,
    @Body()
    body: {
      title: string;
      description?: string | null;
      status_id: string;
      priority: string;
      parent_task_id?: string | null;
    },
  ): Promise<Task> {
    return this.tasksService.createTask(projectId, {
      title: body.title,
      description: body.description ?? null,
      status_id: body.status_id,
      priority: body.priority,
      parent_task_id: body.parent_task_id ?? null,
    });
  }

  @Get('tasks/:id')
  async getTask(@Param('id') id: string): Promise<Task> {
    const task = await this.tasksService.getById(id);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  @Get('tasks/:id/history')
  async getHistory(@Param('id') id: string): Promise<TaskHistoryEntry[]> {
    return this.taskHistoryService.listForTask(id);
  }

  @Get('tasks/:id/relations')
  async getRelations(@Param('id') id: string): Promise<TaskRelation[]> {
    return this.taskRelationsService.listForTask(id);
  }

  @Post('tasks/:id/relations')
  async addRelation(
    @Param('id') id: string,
    @Body()
    body: {
      related_task_id: string;
      type: string;
    },
  ): Promise<{ status: 'ok' }> {
    await this.taskRelationsService.addRelation(id, body.related_task_id, body.type);
    return { status: 'ok' };
  }
}

