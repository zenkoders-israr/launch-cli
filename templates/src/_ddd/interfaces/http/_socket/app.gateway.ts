import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { UseGuards, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { WsCurrentUser } from './decorators/ws-current-user.decorator';

@WebSocketGateway({
  cors: { origin: process.env.CORS_ORIGINS?.split(',') ?? '*', credentials: true },
  namespace: '/',
})
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(AppGateway.name);

  afterInit() {
    this.logger.log('WebSocket gateway initialised');
  }

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token ?? client.handshake.headers?.authorization?.replace('Bearer ', '');
    if (!token) {
      this.logger.warn(`Client ${client.id} connected without token — disconnecting`);
      client.disconnect();
      return;
    }
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('ping')
  handlePing(
    @ConnectedSocket() client: Socket,
    @WsCurrentUser() user: { id: string; email: string },
    @MessageBody() data: unknown,
  ) {
    this.logger.log(`ping from user ${user.email}`);
    client.emit('pong', { message: 'pong', userId: user.id, echo: data });
  }

  emit(event: string, payload: unknown) {
    this.server.emit(event, payload);
  }

  emitToRoom(room: string, event: string, payload: unknown) {
    this.server.to(room).emit(event, payload);
  }
}
