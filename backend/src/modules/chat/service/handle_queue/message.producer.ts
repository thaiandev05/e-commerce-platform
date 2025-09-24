import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { Message_Queue } from "../../interface/chat.interface";

@Injectable()
export class MessageProducer {
	constructor(
		@Inject('MESSAGE_QUEUE') private readonly client: ClientProxy
	) { }

	async sendMessageEvent(message: Message_Queue) {
		await this.client.emit('SAVE_MESSAGE', message)
	}
}