import { Controller } from "@nestjs/common";
import { EmailService } from "./email.service";
import { EventPattern, Payload } from "@nestjs/microservices";

@Controller()
export class EmailConsumer {
	constructor(
		private readonly emailService: EmailService
	) { }

	@EventPattern('send-code-register')
	async handleSendVerifyCode(@Payload() data: { to: string, code: string }) {
		await this.emailService.sendVerificationRegister(data.to, data.code)
	}

	@EventPattern('send-detect-other-device')
	async handleSendDetectOtherDevice(@Payload() data: { to: string, userAgent: string, userIp: string }) {
		await this.emailService.sendDetectOtherDevice(data.to, data.userAgent, data.userIp)
	}
}