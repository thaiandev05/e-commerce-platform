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
}