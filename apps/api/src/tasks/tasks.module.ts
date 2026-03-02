import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TaskHistoryService } from './task-history.service';
import { TaskRelationsService } from './task-relations.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TasksController],
  providers: [TasksService, TaskHistoryService, TaskRelationsService],
  exports: [TasksService, TaskHistoryService, TaskRelationsService],
})
export class TasksModule {}

