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
    const roomId = client.handshake.query.roomId as string;
    client.roomId = roomId;
    client.join(roomId);
    console.log('Пользователь подключился:', client.id);
  }

  handleDisconnect(client: CustomSocket) {
    console.log('Пользователь отключился:', client.id);
  }

  @SubscribeMessage('code-change')
  handleCodeChange(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody() data: { roomId: string; code: string; userId: string },
  ) {
    const { roomId, code } = data;

    if (!roomId || code === undefined) {
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
