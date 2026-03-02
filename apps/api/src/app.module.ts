import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './db/db.module';
import { HealthController } from './health/health.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { LabelsModule } from './labels/labels.module';
import { CommentsModule } from './comments/comments.module';
import { BoardsModule } from './boards/boards.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { TimeEntriesModule } from './time-entries/time-entries.module';
import { IterationsModule } from './iterations/iterations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DbModule,
    AuthModule,
    UsersModule,
    WorkspacesModule,
    LabelsModule,
    CommentsModule,
    BoardsModule,
    ProjectsModule,
    TasksModule,
    TimeEntriesModule,
    IterationsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}



