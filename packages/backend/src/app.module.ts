import { Module } from '@nestjs/common';
import { EventsModule } from './events/events.module';
import { RoomsModule } from './rooms/rooms.module';

@Module({
  imports: [EventsModule, RoomsModule],
})
export class AppModule {}
