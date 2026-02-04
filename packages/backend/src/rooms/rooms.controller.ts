import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { Room } from './rooms.entity';

@Controller('/api/rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  async createRoom(): Promise<{ id: string; code: string }> {
    const room = await this.roomsService.createRoom();
    return {
      id: room.shortId,
      code: room.code,
    };
  }

  @Get(':id')
  async getRoom(@Param('id') id: string): Promise<{ id: string; code: string }> {
    const room = await this.roomsService.getRoom(id);
    if (!room) {
      throw new NotFoundException('Комната не найдена');
    }
    return {
      id: room.shortId,
      code: room.code,
    };
  }
}
