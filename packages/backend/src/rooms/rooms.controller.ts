import { Controller, Get, Post, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { RoomsService, Room } from './rooms.service';

@Controller('api/rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  createRoom(@Body() body: { name?: string }): Room {
    return this.roomsService.createRoom(body.name);
  }

  @Get(':id')
  getRoom(@Param('id') id: string): Room {
    const room = this.roomsService.getRoom(id);
    if (!room) {
      throw new NotFoundException('Комната не найдена');
    }
    return room;
  }
}
