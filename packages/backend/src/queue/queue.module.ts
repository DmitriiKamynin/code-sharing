import { Module } from '@nestjs/common';
import { RunCodeProcessor } from './run-code.processor';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule],
  providers: [RunCodeProcessor],
})
export class QueueModule {}
