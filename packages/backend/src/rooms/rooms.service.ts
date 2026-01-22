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

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values()).map(room => ({
      id: room.id,
      name: room.name,
      created: room.created,
      participants: room.participants || [],
    }));
  }

  updateRoomCode(roomId: string, code: string): boolean {
    const room = this.rooms.get(roomId);
    if (room) {
      room.code = code;
      return true;
    }
    return false;
  }

  updateRoomLanguage(roomId: string, language: string): boolean {
    const room = this.rooms.get(roomId);
    if (room) {
      room.language = language;
      return true;
    }
    return false;
  }

  addParticipant(roomId: string, participant: { id: string; username: string; joinedAt: string }): boolean {
    const room = this.rooms.get(roomId);
    if (room) {
      if (!room.participants) {
        room.participants = [];
      }
      room.participants.push(participant);
      return true;
    }
    return false;
  }

  removeParticipant(roomId: string, participantId: string): boolean {
    const room = this.rooms.get(roomId);
    if (room && room.participants) {
      room.participants = room.participants.filter(p => p.id !== participantId);
      
      // Удаляем комнату если она пустая
      if (room.participants.length === 0) {
        this.rooms.delete(roomId);
      }
      return true;
    }
    return false;
  }

  deleteRoom(roomId: string): boolean {
    return this.rooms.delete(roomId);
  }

  private generateRoomId(): string {
    return Math.random().toString(36).substring(2, 10);
  }
}
