import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailProducer } from './email.producer';
import { EmailConsumer } from './email.consumer';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'EMAIL_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'email_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [EmailConsumer],
  providers: [EmailService, EmailProducer],
  exports: [EmailService, EmailProducer]
})
export class EmailModule { }
