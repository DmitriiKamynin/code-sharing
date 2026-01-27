import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { Room } from './rooms.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService],
  imports: [TypeOrmModule.forFeature([Room])],  
})
export class RoomsModule {}
