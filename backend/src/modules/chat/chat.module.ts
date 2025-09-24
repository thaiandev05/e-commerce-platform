import { Module } from "@nestjs/common";
import { MessageService } from "./service/message.service";
import { TestController } from "./test.feature.controller";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { MessageProducer } from "./service/handle_queue/message.producer";

@Module({
	imports: [
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
				}
			}
		])
	],
	providers: [MessageService, MessageProducer],
	controllers: [TestController]
})
export class ChatModule {

}