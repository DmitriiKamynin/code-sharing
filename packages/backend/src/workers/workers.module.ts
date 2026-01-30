import { Module } from '@nestjs/common';
import { WorkersService } from './workers.service';
import { BullModule } from '@nestjs/bullmq';

@Module({
  providers: [WorkersService],
  exports: [WorkersService, BullModule],
  imports: [
    BullModule.registerQueue({
      name: 'run-code-queue',
    }),
  ],
})
export class WorkersModule {}
