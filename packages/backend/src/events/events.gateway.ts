import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomsService } from '../rooms/rooms.service';

interface CustomSocket extends Socket {
  roomId?: string;
  username?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly roomsService: RoomsService) {}

  handleConnection(client: CustomSocket) {
    console.log('Пользователь подключился:', client.id);
  }

  handleDisconnect(client: CustomSocket) {
    console.log('Пользователь отключился:', client.id);
    
    if (client.roomId) {
      this.roomsService.removeParticipant(client.roomId, client.id);
      client.to(client.roomId).emit('participant-left', client.id);
    }
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody() data: { roomId: string; username: string },
  ) {
    const { roomId, username } = data;

    if (!roomId || !username) {
      client.emit('error', { message: 'Неверные данные для присоединения к комнате' });
      return;
    }

    // Получаем или создаем комнату
    let room = this.roomsService.getRoom(roomId);
    if (!room) {
      room = this.roomsService.createRoom(`Комната ${roomId}`);
    }

    // Добавляем участника
    const participant = {
      id: client.id,
      username: username,
      joinedAt: new Date().toISOString(),
    };

    this.roomsService.addParticipant(roomId, participant);
    client.roomId = roomId;
    client.username = username;
    client.join(roomId);

    // Отправляем информацию о комнате новому участнику
    client.emit('room-joined', {
      room: {
        id: room.id,
        code: room.code,
        language: room.language,
      },
      participants: room.participants || [],
    });

    // Уведомляем других участников о новом участнике
    client.to(roomId).emit('participant-joined', participant);

    console.log(`Пользователь ${username} присоединился к комнате ${roomId}`);
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody() data: { roomId: string },
  ) {
    const { roomId } = data;

    if (roomId && client.roomId === roomId) {
      this.roomsService.removeParticipant(roomId, client.id);
      client.to(roomId).emit('participant-left', client.id);
      client.leave(roomId);
      client.roomId = undefined;
      console.log(`Пользователь покинул комнату ${roomId}`);
    }
  }

  @SubscribeMessage('code-change')
  handleCodeChange(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody() data: { roomId: string; code: string; userId: string },
  ) {
    const { roomId, code } = data;

    if (!roomId || !code) {
      console.warn('Неверные данные для code-change:', data);
      return;
    }

    const updated = this.roomsService.updateRoomCode(roomId, code);
    if (updated) {
      // Отправляем изменение всем участникам кроме отправителя
      client.to(roomId).emit('code-change', data);
      console.log(`Код обновлен в комнате ${roomId} пользователем ${data.userId}`);
    } else {
      console.warn(`Не удалось обновить код в комнате ${roomId}`);
    }
  }

  @SubscribeMessage('language-change')
  handleLanguageChange(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody() data: { roomId: string; language: string; userId: string },
  ) {
    const { roomId, language } = data;

    if (this.roomsService.updateRoomLanguage(roomId, language)) {
      // Отправляем изменение всем участникам кроме отправителя
      client.to(roomId).emit('language-change', data);
    }
  }

  @SubscribeMessage('get-room-state')
  handleGetRoomState(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody() data: { roomId: string },
  ) {
    const { roomId } = data;
    const room = this.roomsService.getRoom(roomId);

    if (room) {
      client.emit('room-state', {
        roomId,
        code: room.code,
        language: room.language,
      });
    }
  }

  @SubscribeMessage('update')
  updateCode(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody() data: any,
  ): boolean {
    if (client.roomId) {
      return client.to(client.roomId).emit('update', data);
    }
    return false;
  }

  @SubscribeMessage('run')
  runCode(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody() data: any,
  ): boolean {
    if (client.roomId) {
      return client.to(client.roomId).emit('run', 'code runed without errors');
    }
    return false;
  }
}
