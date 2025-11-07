import { PrismaService } from '@/prisma/prisma.service';
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import Redis from 'ioredis';
import { CHAT_CONSTANR } from '../chat.constant';
import { User_Custom } from '../interface/chat.interface';
import { CreateRoomDto } from '../dto/create-room.dto';
import { LoadingRoomDto } from '../dto/loading-room.dto';
@Injectable()
export class RoomService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  // check available user
  async getUserWithId(key: string) {
    // check available in cache
    const cache = await this.redis.get(key);
    if (cache && cache !== '__NULL__') return JSON.parse(cache) as User_Custom;
    const userId = key.split('user:').join('');
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        roles: {
          select: {
            role: {
              select: {
                roleName: true,
              },
            },
          },
        },
      }, // Only needed fields
    });

    if (user) {
      await this.redis.set(key, JSON.stringify(user));
      return user;
    } else {
      await this.redis.set(key, '__NULL__');
      return null;
    }
  }

  // check available room
  async getRoomWithId(supportId: string, clientId: string) {
    return await this.prismaService.room.findUnique({
      where: { supportId_clientId: { supportId, clientId } },
    });
  }

  async createRoom(req: Request, dto: CreateRoomDto) {
    // check available
    const [requestUser, otherUser] = await Promise.all([
      this.getUserWithId(CHAT_CONSTANR.CACHE_USER(req.user?.id || 'unknown')),
      this.getUserWithId(CHAT_CONSTANR.CACHE_USER(dto.otherUserId)),
    ]);
    if (!requestUser) throw new NotFoundException('Requester not found');
    if (!otherUser) throw new NotFoundException('Other user not found');

    const rolesUser = requestUser.roles.some(
      (role) => role.role.roleName === 'CLIENT',
    );
    let clientId, supportId;
    if (rolesUser) {
      clientId = requestUser.id;
      supportId = dto.otherUserId;
    } else {
      clientId = otherUser.id;
      supportId = requestUser.id;
    }

    // check available room
    const room = await this.prismaService.room.findUnique({
      where: { supportId_clientId: { supportId, clientId } },
    });
    if (room) throw new ConflictException('Room is available');

    // create new room
    const socketRoomId = CHAT_CONSTANR.NAME_SOCKET_ROOM(clientId, supportId);
    const newRoom = await this.prismaService.room.create({
      data: {
        socketRoomId,
        supportId,
        clientId,
      },
    });

    return newRoom;
  }

  async loadingRoom(req: Request, dto: LoadingRoomDto) {
    // check available user
    const userId = req.user?.id || 'unknow';
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');

    const page = dto?.page || 1;
    const take = dto?.limit || 10;
    const skip = (page - 1) * take;

    const query: any = {
      where: {
        OR: [{ clientId: userId }, { supportId: userId }],
      },
      include: {
        support: {
          select: {
            id: true,
            fullname: true,
            username: true,
            avatarUrl: true,
          },
        },
        client: {
          select: {
            id: true,
            fullname: true,
            username: true,
            avatarUrl: true,
          },
        },
        Message: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    };

    if (dto?.isUseCursor && dto.cursor) {
      query.take = take + 1;
      query.cursor = {
        id: dto.cursor,
      };
      query.skip = 1; // Skip the cursor itself
    } else {
      query.take = take;
      query.skip = skip;
    }

    const rooms = await this.prismaService.room.findMany(query);

    let hasNextPage = false;
    let nextCursor: string | null = null;

    if (dto?.isUseCursor && rooms.length > take) {
      hasNextPage = true;
      rooms.pop();
      nextCursor = rooms[rooms.length - 1].id;
    } else if (!dto?.isUseCursor) {
      const totalCount = await this.prismaService.room.count({
        where: {
          OR: [{ clientId: user.id }, { supportId: user.id }],
        },
      });
      hasNextPage = skip + take < totalCount;
    }

    const result = {
      data: rooms,
      paginations: {
        page: dto?.isUseCursor ? null : page,
        limit: take,
        hasNextPage,
        nextCursor: dto?.isUseCursor ? nextCursor : null,
      },
    };

    return result;
  }
}
