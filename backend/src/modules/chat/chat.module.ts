import { Module } from "@nestjs/common";
import { MessageService } from "./service/message_service/message.service";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { LoadingAndSearchService } from "./service/message_service/loading-search.message.service";
import { ChatgateWayService } from "./service/chat.gateway.service";
import { PrismaModule } from "@/prisma/prisma.module";
import { RoomService } from "./service/room.service";
import { MessageController } from "./constroller/message.feature.controller";
import { RoomController } from "./constroller/room.feature.controller";
import { MessageProducer } from "./service/message_service/handle_queue/message.producer";
import { BatchInsertService } from "./service/message_service/handle_queue/batch-insert.service";
import { ChatGateway } from "./chat.gateway";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MessageConsumer } from "./service/message_service/handle_queue/message.consumer";

@Module({
	imports: [
		PrismaModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
				signOptions: {
					expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '7d',
				},
			}),
			inject: [ConfigService],
		}),
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
		BatchInsertService,
		ChatgateWayService,
		RoomService,
		ChatGateway, // Add WebSocket Gateway
	],
	controllers: [MessageController, RoomController, MessageConsumer]
})
export class ChatModule {

}