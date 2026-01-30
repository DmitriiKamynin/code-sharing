import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { RoomsModule } from '../rooms/rooms.module';
import { WorkersModule } from '../workers/workers.module';

@Module({
  imports: [RoomsModule, WorkersModule],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
