import { Injectable } from '@nestjs/common';

export interface Room {
  id: string;
  name: string;
  created: string;
  code?: string;
  language?: string;
  participants?: Array<{
    id: string;
    username: string;
    joinedAt: string;
  }>;
}

@Injectable()
export class RoomsService {
  private rooms: Map<string, Room> = new Map();

  createRoom(name?: string): Room {
    const id = this.generateRoomId();
    const room: Room = {
      id,
      name: name || `Комната ${id}`,
      created: new Date().toISOString(),
      code: '// Добро пожаловать в совместный редактор кода!\n// Начните писать код здесь...\n\nfunction hello() {\n    console.log("Привет, мир!");\n}\n\nhello();',
      language: 'javascript',
      participants: [],
    };

    this.rooms.set(id, room);
    return room;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  updateRoomCode(roomId: string, code: string): boolean {
    const room = this.rooms.get(roomId);
    if (room) {
      room.code = code;
      return true;
    }
    return false;
  }

  private generateRoomId(): string {
    return Math.random().toString(36).substring(2, 10);
  }
}
