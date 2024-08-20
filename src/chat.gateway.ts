import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  private users: Map<string, string> = new Map();

  @SubscribeMessage('message')
  handleMessage(@MessageBody() message: string, @ConnectedSocket() client: Socket): void {
    const username = this.users.get(client.id) || 'Anonymous';
    const fullMessage = `${username}: ${message}`;
    this.server.emit('message', { username, message });
    console.log(`[Message] ${fullMessage}`);
  }

  @SubscribeMessage('join')
  handleJoin(@MessageBody() username: string, @ConnectedSocket() client: Socket): void {
    this.users.set(client.id, username);
    client.emit('join', `Welcome, ${username}!`);
    this.server.emit('notification', `${username} has joined the chat.`);
    console.log(`[Join] ${username} has joined the chat.`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    const username = this.users.get(client.id) || 'Anonymous';
    this.users.delete(client.id);
    this.server.emit('notification', `${username} has left the chat.`);
    console.log(`[Leave] ${username} has left the chat.`);
  }
}