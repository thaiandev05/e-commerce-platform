import { Injectable } from '@nestjs/common';
import { Comment_Queue } from '../comment.interface';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class BatchInsertService {
  private commentQueue: Comment_Queue[] = [];
  private readonly BATCH_SIZE = 1000;

  constructor(private readonly prismaService: PrismaService) {
    setInterval(() => this.batchInsert(), 1000);
  }

  async addCommentToQueue(comment: Comment_Queue) {
    this.commentQueue.push(comment);
    if (this.commentQueue.length >= this.BATCH_SIZE) {
      await this.batchInsert();
    }
  }

  private async batchInsert() {
    if (this.commentQueue.length === 0) return;

    const comment = this.commentQueue.splice(0, this.BATCH_SIZE);
    await this.prismaService.comment.createMany({ data: comment });
  }
}
