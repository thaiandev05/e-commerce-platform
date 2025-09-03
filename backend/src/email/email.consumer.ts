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

	@EventPattern('send-notification-changepassword')
	async handleNotificaitonChangePassword(@Payload() data: { to: string, userName: string, userIp: string, userAgent: string }) {
		await this.emailService.sendNotificationChangePassword(data.to, data.userName, data.userIp, data.userAgent)
	}

	@EventPattern('send-notification-verify-shop')
	async handleSendVerifyShop(@Payload() data: { to: string, linkVerify: string }) {
		await this.emailService.sendVerifyShop(data.to, data.linkVerify)
	}
}