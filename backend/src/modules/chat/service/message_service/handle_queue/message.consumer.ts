import { Injectable, Logger } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";

import { BatchInsertService } from "./batch-insert.service";
import type { Message_Queue } from "@/modules/chat/interface/chat.interface";

@Injectable()
export class MessageConsumer {
	private readonly logger = new Logger(MessageConsumer.name)

	constructor(
		private readonly messageService: BatchInsertService
	) {}

	@EventPattern('SAVE_MESSAGE')
	async handleSaveMessage(@Payload() data: Message_Queue) {
		this.logger.log(`Received message: ${JSON.stringify(data.content)}`)
		await this.messageService.addMessageToQueue(data)
	}	
}