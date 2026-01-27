import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './rooms.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
  ) {}

  createRoom(): Room {
    const shortId = this.generateRoomShortId();
    const room: Room = {
      id: uuidv4(),
      shortId,
      code: '// Добро пожаловать в совместный редактор кода!\n// Начните писать код здесь...\n\nfunction hello() {\n    console.log("Привет, мир!");\n}\n\nhello();',
    };

    this.roomRepository.save(room);
    return room;
  }

  getRoom(roomId: string): Promise<Room | undefined> {
    return this.roomRepository.findOne({ where: { shortId: roomId } });
  }

  async updateRoomCode(roomId: string, code: string): Promise<boolean> {
    const room = await this.roomRepository.findOne({ where: { shortId: roomId } });
    if (!room) {
      return false;
    }
    room.code = code;
    await this.roomRepository.save(room);
    return true;
  }

  private generateRoomShortId(): string {
    return Math.random().toString(36).substring(2, 10);
  }
}
