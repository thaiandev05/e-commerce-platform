import { PrismaService } from '@/prisma/prisma.service';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import Redis from 'ioredis';
import { Comment_Queue, CommentUser } from './comment.interface';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CHAT_CONSTANR } from '../chat/chat.constant';
import { Sku } from '@prisma/generated/prisma';
import { REDIS_CONSTANTS } from '../redis/redis.constants';
import { CommentProducer } from './handle_queue/comment.produder';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { DeleteCommentDto } from './dto/delete-comment.dto';
@Injectable()
export class CommentService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly commentProducer: CommentProducer,
  ) {}

  // get user with id
  async getUserWithId(key: string) {
    // check cache
    const cache = await this.redis.get(key);
    if (cache && cache !== '__NULL__') return JSON.parse(cache) as CommentUser;

    // fall back
    const userId = key.split('user:').join('');
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      return await this.redis.set(key, '__NULL__');
    }

    return user as CommentUser;
  }

  // get product with id
  async getProductWithId(key: string) {
    const cache = await this.redis.get(key);
    if (cache && cache !== '__NULL__') {
      return JSON.parse(cache) as Sku;
    }

    // fall back in db
    const skuId = key.split('sku:').join('');
    const sku = await this.prismaService.sku.findUnique({
      where: { id: skuId },
    });

    if (!sku) {
      return await this.redis.set(key, '__NULL__');
    }

    return sku;
  }
  //create comment
  async createComment(req: Request, skuId: string, dto: CreateCommentDto) {
    // validate sender and product
    const userKey = CHAT_CONSTANR.CACHE_USER(req.user?.id || '');
    const skuKey = REDIS_CONSTANTS.CACHE_SKU(skuId);
    const [user, sku] = await Promise.all([
      await this.getUserWithId(userKey),
      await this.getProductWithId(skuKey),
    ]);
    if (!user || typeof user === 'string')
      throw new NotFoundException('User not found');
    if (!sku) throw new NotFoundException('Product not found');

    // validate comment reped if isReply = true
    if (dto.isReply && dto.repToCommentId) {
      const replyToComment = await this.prismaService.comment.findUnique({
        where: { id: dto.repToCommentId },
      });
      if (!replyToComment) throw new NotFoundException('Comment not found');
    }

    // data comment
    const commentQueue: Comment_Queue = {
      content: dto.content,
      ownId: user.id,
      skuId,
      isReply: dto.isReply ? true : false,
      repToComment: dto.repToCommentId ? dto.repToCommentId : undefined,
    };

    // emit even to producer
    await this.commentProducer.sendCommentEvent(commentQueue);

    return {
      success: true,
    };
  }

  async updateComment(req: Request, commentId: string, dto: UpdateCommentDto) {
    // validate sender and product
    const userKey = CHAT_CONSTANR.CACHE_USER(req.user?.id || '');
    if (!dto.skuId) throw new NotFoundException('SKU ID is required');
    const skuKey = REDIS_CONSTANTS.CACHE_SKU(dto.skuId);
    const [user, sku] = await Promise.all([
      await this.getUserWithId(userKey),
      await this.getProductWithId(skuKey),
    ]);
    if (!user || typeof user === 'string')
      throw new NotFoundException('User not found');
    if (!sku) throw new NotFoundException('Product not found');

    // validate comment
    const comment = await this.prismaService.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundException('Comment not found');

    // update comment
    return await this.prismaService.comment.update({
      where: { id: comment.id },
      data: { content: dto.content },
    });
  }
  async deleteComment(req: Request, commentId: string, dto: DeleteCommentDto) {
    // validate sender and product
    const userKey = CHAT_CONSTANR.CACHE_USER(req.user?.id || '');
    if (!dto.skuId) throw new NotFoundException('SKU ID is required');
    const skuKey = REDIS_CONSTANTS.CACHE_SKU(dto.skuId);
    const [user, sku] = await Promise.all([
      await this.getUserWithId(userKey),
      await this.getProductWithId(skuKey),
    ]);
    if (!user || typeof user === 'string')
      throw new NotFoundException('User not found');
    if (!sku) throw new NotFoundException('Product not found');

    // validate comment
    const comment = await this.prismaService.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundException('Comment not found');

    // update comment
    return await this.prismaService.comment.delete({
      where: { id: comment.id },
    });
  }
}
