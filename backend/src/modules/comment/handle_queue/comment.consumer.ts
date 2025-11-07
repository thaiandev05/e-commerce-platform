import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import type { Comment_Queue } from '../comment.interface';
import { BatchInsertService } from './batch-insert.service';

@Controller()
export class CommentConsumer {
  private readonly logger = new Logger(CommentConsumer.name);

  constructor(private readonly commentService: BatchInsertService) {}

  @EventPattern('SAVE_COMMENT')
  async handleSaveComment(@Payload() data: Comment_Queue) {
    this.logger.log(`Received comment: ${JSON.stringify(data.content)}`);
    await this.commentService.addCommentToQueue(data);
  }
}
