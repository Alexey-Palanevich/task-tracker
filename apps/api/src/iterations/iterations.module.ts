import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { IterationsController } from './iterations.controller';
import { IterationsService } from './iterations.service';

@Module({
  imports: [AuthModule],
  controllers: [IterationsController],
  providers: [IterationsService],
  exports: [IterationsService],
})
export class IterationsModule {}

