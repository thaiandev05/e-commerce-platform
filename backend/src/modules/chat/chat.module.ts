import { Module } from "@nestjs/common";
import { MessageService } from "./service/messgae_service/message.service";
import { TestController } from "./test.feature.controller";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { MessageProducer } from "./service/handle_queue/message.producer";
import { LoadingAndSearchService } from "./service/messgae_service/loading-search.message.service";
import { MessageConsumer } from "./service/handle_queue/message.consumer";
import { BatchInsertService } from "./service/handle_queue/batch-insert.service";
import { ChatgateWayService } from "./service/chat.gateway.service";
import { PrismaModule } from "@/prisma/prisma.module";

@Module({
	imports: [
		PrismaModule,
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
	providers: [
		MessageService,
		MessageProducer,
		LoadingAndSearchService,
		MessageConsumer,
		BatchInsertService,
		ChatgateWayService
	],
	controllers: [TestController]
})
export class ChatModule {

}