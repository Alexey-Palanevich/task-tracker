import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { Task, TimeReportEntry, WorkspaceDashboardMetrics } from '@task-tracker/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExportService } from './export.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('workspaces/:id/export/json')
  async exportJson(
    @Param('id') workspaceId: string,
  ): Promise<{ tasks: Task[] }> {
    const tasks = await this.exportService.exportTasksAsJson(workspaceId);
    return { tasks };
  }

  @Get('workspaces/:id/export/csv')
  @Header('Content-Type', 'text/csv')
  async exportCsv(@Param('id') workspaceId: string): Promise<string> {
    return this.exportService.exportTasksAsCsv(workspaceId);
  }

  @Get('workspaces/:id/reports/dashboard')
  async dashboard(
    @Param('id') workspaceId: string,
  ): Promise<WorkspaceDashboardMetrics> {
    return this.exportService.getWorkspaceDashboard(workspaceId);
  }

  @Get('workspaces/:id/reports/time')
  async timeReport(
    @Param('id') workspaceId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<TimeReportEntry[]> {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    return this.exportService.getWorkspaceTimeReport(workspaceId, {
      from: fromDate,
      to: toDate,
    });
  }
}

