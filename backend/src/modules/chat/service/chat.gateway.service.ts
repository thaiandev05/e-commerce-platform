import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { MessageService } from './message_service/message.service';
import { RoomService } from './room.service';

@Injectable()
export class ChatgateWayService implements OnModuleDestroy {
  private readonly logger = new Logger(ChatgateWayService.name);
  private readonly redis: Redis;
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly messageService: MessageService,
    private readonly roomService: RoomService,
  ) {
    const redisUrl = this.configService.getOrThrow<string>('REDIS_URL');
    this.redis = new Redis(redisUrl);

    this.redis.on('error', (error) => {
      console.log('Redis connection error:', error);
    });
  }

  async onModuleDestroy() {
    await this.redis.disconnect();
  }

  async joinConversation(socketId: string, roomId: string, userId: string) {
    try {
      // Validate room exists in database
      const room = await this.prismaService.room.findUnique({
        where: { id: roomId },
        include: {
          support: {
            select: { id: true, username: true, fullname: true },
          },
          client: {
            select: { id: true, username: true, fullname: true },
          },
          Message: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              content: true,
              createdAt: true,
              sender: {
                select: { id: true, username: true },
              },
            },
          },
        },
      });

      if (!room) {
        this.logger.warn(`Room ${roomId} not found`);
        return {
          success: false,
          error: 'Room not found',
        };
      }

      // Verify user has permission to join this room
      const hasPermission =
        room.supportId === userId || room.clientId === userId;
      if (!hasPermission) {
        this.logger.warn(
          `User ${userId} does not have permission to join room ${roomId}`,
        );
        return {
          success: false,
          error: 'Access denied: You are not authorized to join this room',
        };
      }

      // Redis operations for room management
      const pipeline = this.redis.pipeline();

      // Store socket-to-room mapping
      const socketKey = `socket:${socketId}`; // luu metadate cua socket
      const roomKey = `room:${roomId}`; // danh sach cac soket dang trong phong
      const userRoomsKey = `user:${userId}:rooms`; // danh sach cac phong ma user dang tham gia
      const roomUsersKey = `room:${roomId}:users`; // danh sach cac user trong phong

      // Set socket metadata with expiration (24 hours)
      pipeline.hset(socketKey, {
        userId,
        roomId,
        joinedAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
      });
      pipeline.expire(socketKey, 86400); // 24 hours

      // Add socket to room set
      pipeline.sadd(roomKey, socketId);
      pipeline.expire(roomKey, 86400);

      // Add room to user's active rooms
      pipeline.sadd(userRoomsKey, roomId);
      pipeline.expire(userRoomsKey, 86400);

      // Add user to room's active users with metadata
      pipeline.hset(
        roomUsersKey,
        userId,
        JSON.stringify({
          socketId,
          joinedAt: new Date().toISOString(),
          username:
            room.supportId === userId
              ? room.support.username
              : room.client.username,
          fullname:
            room.supportId === userId
              ? room.support.fullname
              : room.client.fullname,
          role: room.supportId === userId ? 'support' : 'client',
        }),
      );
      pipeline.expire(roomUsersKey, 86400);

      // Store room activity
      const activityKey = `room:${roomId}:activity`;
      pipeline.zadd(activityKey, Date.now(), `${userId}:joined`);
      pipeline.expire(activityKey, 86400);

      // Execute all Redis operations atomically
      await pipeline.exec();

      // Update room last activity in database
      await this.prismaService.room.update({
        where: { id: roomId },
        data: { updatedAt: new Date() },
      });

      this.logger.log(
        `User ${userId} successfully joined room ${roomId} with socket ${socketId}`,
      );

      return {
        success: true,
        roomInfo: {
          id: room.id,
          nameRoom: room.nameRoom,
          socketRoomId: room.socketRoomId,
          totalMessages: room.totalMessages,
          support: room.support,
          client: room.client,
          lastMessage: room.Message[0] || null,
          createdAt: room.createdAt,
          updatedAt: room.updatedAt,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error joining conversation: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        error: 'Internal server error while joining room',
      };
    }
  }

  async setUserOnline(userId: string, isOnline: boolean) {
    try {
      const status = isOnline ? 'online' : 'offline';
      const timestamp = new Date().toISOString();

      await this.redis.hset(
        'user_status',
        userId,
        JSON.stringify({
          status,
          lastSeen: timestamp,
        }),
      );

      // update database last seen
      if (!isOnline) {
        await this.prismaService.user.update({
          where: { id: userId },
          data: { lastActived: new Date() },
        });
      }
    } catch (error) {
      this.logger.log('Error set user online', error);
    }
  }

  // get status user
  async isUserOnline(userId: string) {
    const data = await this.redis.hget('user_status', userId);
    if (!data) return false;

    try {
      const { status } = JSON.parse(data);
      return status === 'online';
    } catch (error) {
      return false;
    }
  }

  /**
   * Handle user disconnect - cleanup Redis data
   */
  async handleUserDisconnect(socketId: string, userId: string) {
    try {
      const pipeline = this.redis.pipeline();

      // Get socket metadata to find associated room
      const socketKey = `socket:${socketId}`;
      const socketData = await this.redis.hgetall(socketKey);

      if (socketData.roomId) {
        const roomKey = `room:${socketData.roomId}`;
        const roomUsersKey = `room:${socketData.roomId}:users`;
        const activityKey = `room:${socketData.roomId}:activity`;

        // Remove socket from room
        pipeline.srem(roomKey, socketId);

        // Remove user from room users if no other sockets
        const userSockets = await this.redis.scard(`user:${userId}:sockets`);
        if (userSockets <= 1) {
          pipeline.hdel(roomUsersKey, userId);
        }

        // Log activity
        pipeline.zadd(activityKey, Date.now(), `${userId}:left`);
      }

      // Remove socket metadata
      pipeline.del(socketKey);

      // Set user offline status
      pipeline.hset(
        'user_status',
        userId,
        JSON.stringify({
          status: 'offline',
          lastSeen: new Date().toISOString(),
        }),
      );

      await pipeline.exec();

      this.logger.log(
        `Cleaned up disconnect for user ${userId}, socket ${socketId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error handling user disconnect: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Leave conversation room
   */
  async leaveConversation(socketId: string, roomId: string, userId: string) {
    try {
      const pipeline = this.redis.pipeline();

      const socketKey = `socket:${socketId}`;
      const roomKey = `room:${roomId}`;
      const userRoomsKey = `user:${userId}:rooms`;
      const roomUsersKey = `room:${roomId}:users`;
      const activityKey = `room:${roomId}:activity`;

      // Remove associations
      pipeline.srem(roomKey, socketId);
      pipeline.srem(userRoomsKey, roomId);
      pipeline.hdel(roomUsersKey, userId);
      pipeline.del(socketKey);

      // Log activity
      pipeline.zadd(activityKey, Date.now(), `${userId}:left`);

      await pipeline.exec();

      this.logger.log(`User ${userId} left room ${roomId}`);

      return { success: true };
    } catch (error) {
      this.logger.error(
        `Error leaving conversation: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        error: 'Failed to leave conversation',
      };
    }
  }

  /**
   * Send message to room
   */
  // ...existing code...

  /**
   * Send message to room
   */
  async sendMessage(data: {
    roomId: string;
    content: string;
    senderId: string;
    receiverId: string;
    repToId?: string;
  }) {
    try {
      // Verify sender has access to room
      const room = await this.prismaService.room.findUnique({
        where: { id: data.roomId },
      });

      if (!room) {
        return {
          success: false,
          error: 'Room not found',
        };
      }

      const hasAccess =
        room.supportId === data.senderId || room.clientId === data.senderId;
      if (!hasAccess) {
        return {
          success: false,
          error: 'Access denied',
        };
      }

      // Create request object for messageService.createMessage
      const mockRequest = {
        user: { id: data.senderId },
      } as any;

      // Prepare message data for service
      const messageDto = {
        roomId: data.roomId,
        content: data.content,
        receiverId: data.receiverId,
        repToId: data.repToId,
        isRepLy: Boolean(data.repToId),
      };

      // Call message service to create message
      const messageResult = await this.messageService.createMessage(
        mockRequest,
        messageDto,
      );

      if (messageResult) {
        this.logger.log(
          `Message created successfully: ${messageResult.messageId}`,
        );

        return {
          success: true,
          message: {
            id: messageResult.messageId,
            content: data.content,
            roomId: data.roomId,
            senderId: data.senderId,
            receiverId: data.receiverId,
            repToId: data.repToId,
          },
        };
      }

      return {
        success: false,
        error: 'Failed to create message',
      };
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`, error.stack);
      return {
        success: false,
        error: 'Failed to send message',
      };
    }
  }

  // ...existing code...
  /**
   * Get active users in room from Redis
   */
  async getRoomUsers(roomId: string) {
    try {
      const roomUsersKey = `room:${roomId}:users`;
      const usersData = await this.redis.hgetall(roomUsersKey);

      const users = Object.entries(usersData).map(([userId, data]) => {
        try {
          return { userId, ...JSON.parse(data) };
        } catch {
          return { userId, error: 'Invalid data' };
        }
      });

      return users;
    } catch (error) {
      this.logger.error(
        `Error getting room users: ${error.message}`,
        error.stack,
      );
      return [];
    }
  }

  /**
   * Get user by ID for authentication
   */
  async getUserById(userId: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          fullname: true,
          email: true,
          isVerified: true,
          status: true,
          roles: {
            include: {
              role: {
                select: {
                  roleName: true,
                },
              },
            },
          },
        },
      });

      if (!user || !user.isVerified || user.status !== 'ACTIVE') {
        return null;
      }

      return user;
    } catch (error) {
      this.logger.error(
        `Error getting user by ID: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }
}
