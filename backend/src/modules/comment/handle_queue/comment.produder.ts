import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Comment_Queue } from '../comment.interface';

@Injectable()
export class CommentProducer {
  constructor(@Inject('MESSAGE_QUEUE') private readonly client: ClientProxy) {}

  async sendCommentEvent(comment: Comment_Queue) {
    await this.client.emit('SAVE_COMMENT', comment);
  }
}
