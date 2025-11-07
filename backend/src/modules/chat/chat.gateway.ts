import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { Server, Socket } from 'socket.io';
import { ChatgateWayService } from './service/chat.gateway.service';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:8080',
    ],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');

  constructor(
    private readonly chatGatewayService: ChatgateWayService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async afterInit(server: Server) {
    try {
      // Setup Redis adapter for scaling WebSocket across multiple instances
      const redisUrl = this.configService.getOrThrow<string>('REDIS_URL');

      const pubClient = createClient({ url: redisUrl });
      const subClient = pubClient.duplicate();

      await Promise.all([pubClient.connect(), subClient.connect()]);

      server.adapter(createAdapter(pubClient, subClient));

      this.logger.log('WebSocket Gateway initialized with Redis adapter');
    } catch (error) {
      this.logger.error('Failed to initialize Redis adapter:', error);
    }
  }

  async handleConnection(client: Socket) {
    try {
      this.logger.log(`Client attempting to connect: ${client.id}`);

      // Authenticate user on connection
      const user = await this.authenticateSocket(client);
      if (!user) {
        this.logger.warn(`Authentication failed for client: ${client.id}`);
        client.emit('authError', { message: 'Authentication failed' });
        client.disconnect(true);
        return;
      }

      // Store user data in socket
      client.data.user = user;

      this.logger.log(
        `Client connected successfully: ${client.id} (User: ${user.username})`,
      );

      // Emit connection success
      client.emit('connected', {
        message: 'Connected successfully',
        user: {
          id: user.id,
          username: user.username,
          fullname: user.fullname,
        },
      });
    } catch (error) {
      this.logger.error(`Connection error for client ${client.id}:`, error);
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const user = client.data.user;
      if (user) {
        this.logger.log(
          `Client disconnected: ${client.id} (User: ${user.username})`,
        );

        // Clean up user data when they disconnect
        await this.chatGatewayService.handleUserDisconnect(client.id, user.id);
      } else {
        this.logger.log(`Client disconnected: ${client.id} (Unauthenticated)`);
      }
    } catch (error) {
      this.logger.error(
        `Disconnect cleanup error for client ${client.id}:`,
        error,
      );
    }
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    try {
      const user = client.data.user;
      if (!user) {
        client.emit('joinConversationResponse', {
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      this.logger.log(
        `User ${user.username} attempting to join room: ${data.roomId}`,
      );

      const result = await this.chatGatewayService.joinConversation(
        client.id,
        data.roomId,
        user.id,
      );

      if (result.success) {
        // Join the Socket.IO room
        await client.join(data.roomId);

        // Notify others in the room about the user joining
        client.to(data.roomId).emit('userJoinedRoom', {
          userId: user.id,
          username: user.username,
          fullname: user.fullname,
          roomId: data.roomId,
          message: `${user.fullname} joined the conversation`,
          timestamp: new Date().toISOString(),
        });

        // Send success response back to client
        client.emit('joinConversationResponse', {
          success: true,
          roomId: data.roomId,
          message: 'Successfully joined conversation',
          roomInfo: result.roomInfo,
        });

        this.logger.log(
          `User ${user.username} successfully joined room ${data.roomId}`,
        );
      } else {
        client.emit('joinConversationResponse', {
          success: false,
          error: result.error,
        });
      }
    } catch (error) {
      this.logger.error(
        `Error joining conversation: ${error.message}`,
        error.stack,
      );
      client.emit('joinConversationResponse', {
        success: false,
        error: 'Internal server error',
      });
    }
  }

  @SubscribeMessage('leaveConversation')
  async handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    try {
      const user = client.data.user;
      if (!user) {
        client.emit('leaveConversationResponse', {
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const result = await this.chatGatewayService.leaveConversation(
        client.id,
        data.roomId,
        user.id,
      );

      if (result.success) {
        // Leave the Socket.IO room
        await client.leave(data.roomId);

        // Notify others in the room about the user leaving
        client.to(data.roomId).emit('userLeftRoom', {
          userId: user.id,
          username: user.username,
          fullname: user.fullname,
          roomId: data.roomId,
          message: `${user.fullname} left the conversation`,
          timestamp: new Date().toISOString(),
        });

        // Send success response back to client
        client.emit('leaveConversationResponse', {
          success: true,
          roomId: data.roomId,
          message: 'Successfully left conversation',
        });

        this.logger.log(`User ${user.username} left room ${data.roomId}`);
      } else {
        client.emit('leaveConversationResponse', {
          success: false,
          error: result.error,
        });
      }
    } catch (error) {
      this.logger.error(
        `Error leaving conversation: ${error.message}`,
        error.stack,
      );
      client.emit('leaveConversationResponse', {
        success: false,
        error: 'Internal server error',
      });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomId: string;
      content: string;
      receiverId: string;
      repToId?: string;
    },
  ) {
    try {
      const user = client.data.user;
      if (!user) {
        client.emit('messageError', {
          error: 'Authentication required',
        });
        return;
      }

      // Validate required fields
      if (!data.roomId || !data.content || !data.receiverId) {
        client.emit('messageError', {
          error: 'Missing required fields: roomId, content, or receiverId',
        });
        return;
      }

      const messageData = {
        ...data,
        senderId: user.id,
      };

      const result = await this.chatGatewayService.sendMessage(messageData);

      if (result.success) {
        // Broadcast message to all clients in the room (including sender)
        this.server.to(data.roomId).emit('newMessage', {
          id: result.message?.id,
          content: data.content,
          roomId: data.roomId,
          sender: {
            id: user.id,
            username: user.username,
            fullname: user.fullname,
          },
          receiverId: data.receiverId,
          repToId: data.repToId || null,
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        });

        // Send confirmation to sender
        client.emit('messageDelivered', {
          messageId: result.message?.id,
          roomId: data.roomId,
          content: data.content,
          timestamp: new Date().toISOString(),
          status: 'delivered',
        });

        this.logger.log(
          `Message sent to room ${data.roomId} by user ${user.username}`,
        );
      } else {
        client.emit('messageError', {
          error: result.error || 'Failed to send message',
          timestamp: new Date().toISOString(),
        });

        this.logger.warn(
          `Message failed for user ${user.username} in room ${data.roomId}: ${result.error}`,
        );
      }
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`, error.stack);
      client.emit('messageError', {
        error: 'Internal server error while sending message',
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('getRoomUsers')
  async handleGetRoomUsers(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    try {
      const user = client.data.user;
      if (!user) {
        client.emit('roomUsersError', {
          error: 'Authentication required',
        });
        return;
      }

      const users = await this.chatGatewayService.getRoomUsers(data.roomId);
      client.emit('roomUsersResponse', {
        roomId: data.roomId,
        users,
      });
    } catch (error) {
      this.logger.error(
        `Error getting room users: ${error.message}`,
        error.stack,
      );
      client.emit('roomUsersError', {
        error: 'Failed to get room users',
      });
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; isTyping: boolean },
  ) {
    try {
      const user = client.data.user;
      if (!user) return;

      // Broadcast typing status to other users in the room
      client.to(data.roomId).emit('userTyping', {
        userId: user.id,
        username: user.username,
        fullname: user.fullname,
        roomId: data.roomId,
        isTyping: data.isTyping,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(
        `Error handling typing event: ${error.message}`,
        error.stack,
      );
    }
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', {
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Authenticate socket connection using Access Token and Refresh Token
   */
  private async authenticateSocket(client: Socket): Promise<any> {
    try {
      const tokens = this.extractTokensFromSocket(client);
      if (!tokens.accessToken) {
        return null;
      }

      try {
        // Try to verify access token first
        const payload = await this.jwtService.verifyAsync(tokens.accessToken, {
          secret:
            this.configService.get<string>('JWT_SECRET') || 'your-secret-key',
        });

        // Get user from service
        const user = await this.chatGatewayService.getUserById(
          payload.userId || payload.sub,
        );

        if (user) {
          this.logger.log(
            `User authenticated successfully with access token: ${user.username}`,
          );
          return user;
        }
      } catch (accessTokenError) {
        this.logger.warn(
          `Access token verification failed: ${accessTokenError.message}`,
        );

        // If access token is expired/invalid, try refresh token
        if (tokens.refreshToken) {
          try {
            const refreshPayload = await this.jwtService.verifyAsync(
              tokens.refreshToken,
              {
                secret: this.configService.get<string>('JWT_SECRET'),
              },
            );

            // Get user from refresh token
            const user = await this.chatGatewayService.getUserById(
              refreshPayload.userId || refreshPayload.sub,
            );

            if (user) {
              this.logger.log(
                `User authenticated with refresh token: ${user.username}`,
              );

              // Generate new access token and send to client
              const newAccessToken = await this.jwtService.signAsync(
                { userId: user.id, username: user.username },
                {
                  secret: this.configService.get<string>('JWT_SECRET'),
                  expiresIn:
                    this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ||
                    '15m',
                },
              );

              // Send new token to client
              client.emit('tokenRefreshed', {
                accessToken: newAccessToken,
                message: 'Access token refreshed successfully',
              });

              return user;
            }
          } catch (refreshTokenError) {
            this.logger.warn(
              `Refresh token verification failed: ${refreshTokenError.message}`,
            );
          }
        }
      }

      return null;
    } catch (error) {
      this.logger.error(`Socket authentication failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Extract Access Token and Refresh Token from socket handshake
   */
  private extractTokensFromSocket(client: Socket): {
    accessToken: string | null;
    refreshToken: string | null;
  } {
    let accessToken: string | null = null;
    let refreshToken: string | null = null;

    // Try to get tokens from authorization header
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7);
    }

    // Try to get tokens from query parameters
    const accessTokenFromQuery =
      client.handshake.query.accessToken || client.handshake.query.access_token;
    if (accessTokenFromQuery && typeof accessTokenFromQuery === 'string') {
      accessToken = accessTokenFromQuery;
    }

    const refreshTokenFromQuery =
      client.handshake.query.refreshToken ||
      client.handshake.query.refresh_token;
    if (refreshTokenFromQuery && typeof refreshTokenFromQuery === 'string') {
      refreshToken = refreshTokenFromQuery;
    }

    // Try to get tokens from auth object in handshake
    const authAccessToken =
      client.handshake.auth?.accessToken || client.handshake.auth?.access_token;
    if (authAccessToken && typeof authAccessToken === 'string') {
      accessToken = authAccessToken;
    }

    const authRefreshToken =
      client.handshake.auth?.refreshToken ||
      client.handshake.auth?.refresh_token;
    if (authRefreshToken && typeof authRefreshToken === 'string') {
      refreshToken = authRefreshToken;
    }

    // Fallback: if only 'token' is provided, assume it's access token
    if (!accessToken) {
      const fallbackToken =
        client.handshake.query.token || client.handshake.auth?.token;
      if (fallbackToken && typeof fallbackToken === 'string') {
        accessToken = fallbackToken;
      }
    }

    return { accessToken, refreshToken };
  }
}
