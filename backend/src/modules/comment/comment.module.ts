import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { ProductModule } from '../product/product.module';
import { CommentConsumer } from './handle_queue/comment.consumer';
import { CommentProducer } from './handle_queue/comment.produder';
import { CommentController } from './comment.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BatchInsertService } from './handle_queue/batch-insert.service';

@Module({
  imports: [
    ProductModule,
    ClientsModule.register([
      {
        name: 'MESSAGE_QUEUE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'message_queue',
          queueOptions: {
            durable: true, // giữ tin nhắn nếu server down
          },
        },
      },
    ]),
  ],
  providers: [CommentService, CommentProducer, BatchInsertService],
  controllers: [CommentConsumer, CommentController],
  exports: [CommentProducer],
})
export class CommentModule {}
