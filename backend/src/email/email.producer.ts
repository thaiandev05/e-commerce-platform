import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";

@Injectable()
export class EmailProducer {
	constructor(
		@Inject('EMAIL_SERVICE') private readonly client: ClientProxy
	) { }

	async sendVerifyCodeRegister(data: { to: string, code: string }) {
		await this.client.emit('send-code-register', data)
	}

	async sendDetectOtherDevice(data: { to: string, userAgent: string, userIp: string }) {
		await this.client.emit('send-detect-other-device', data)
	}
}