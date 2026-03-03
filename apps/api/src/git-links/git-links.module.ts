import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { GitLinksController } from './git-links.controller';
import { GitLinksService } from './git-links.service';

@Module({
  imports: [AuthModule],
  controllers: [GitLinksController],
  providers: [GitLinksService],
  exports: [GitLinksService],
})
export class GitLinksModule {}

