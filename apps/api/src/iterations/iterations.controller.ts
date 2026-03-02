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
import type { Iteration, IterationDetail, IterationReport } from '@task-tracker/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IterationsService } from './iterations.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class IterationsController {
  constructor(private readonly iterationsService: IterationsService) {}

  @Get('workspaces/:id/iterations')
  async listForWorkspace(@Param('id') workspaceId: string): Promise<Iteration[]> {
    return this.iterationsService.listForWorkspace(workspaceId);
  }

  @Post('workspaces/:id/iterations')
  async createIteration(
    @Param('id') workspaceId: string,
    @Body()
    body: {
      name: string;
      start_date: string;
      end_date: string;
    },
  ): Promise<Iteration> {
    return this.iterationsService.createIteration(workspaceId, {
      name: body.name,
      start_date: new Date(body.start_date),
      end_date: new Date(body.end_date),
    });
  }

  @Get('iterations/:id')
  async getIteration(@Param('id') iterationId: string): Promise<IterationDetail> {
    return this.iterationsService.getIterationDetail(iterationId);
  }

  @Put('iterations/:id')
  async updateIteration(
    @Param('id') iterationId: string,
    @Body()
    body: {
      name?: string;
      start_date?: string;
      end_date?: string;
    },
  ): Promise<Iteration> {
    return this.iterationsService.updateIteration(iterationId, {
      name: body.name,
      start_date: body.start_date ? new Date(body.start_date) : undefined,
      end_date: body.end_date ? new Date(body.end_date) : undefined,
    });
  }

  @Delete('iterations/:id')
  async deleteIteration(@Param('id') iterationId: string): Promise<{ status: 'deleted' }> {
    await this.iterationsService.deleteIteration(iterationId);
    return { status: 'deleted' };
  }

  @Get('iterations/:id/report')
  async getIterationReport(@Param('id') iterationId: string): Promise<IterationReport> {
    return this.iterationsService.getIterationReport(iterationId);
  }
}

