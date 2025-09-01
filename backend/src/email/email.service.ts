import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer'
import { join } from 'path';
import { promises as fs } from 'fs';
@Injectable()
export class EmailService {

	private readonly logger = new Logger()
	private transporter: nodemailer.Transporter
	private templateCache = new Map<string, string>()

	constructor(
		private readonly configService: ConfigService
	) {
		// create transport
		this.transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: configService.getOrThrow<string>("EMAIL_USER"),
				pass: configService.getOrThrow<string>("EMAIL_PASS")
			}
		})
	}

	// get template 
	async getTemplate(templateFileName: string): Promise<string> {
		if (this.templateCache.has(templateFileName)) {
			return this.templateCache.get(templateFileName)!
		}
		try {
			const templatePath = join(__dirname, 'templates', `${templateFileName}.html`)
			const content = await fs.readFile(templatePath, 'utf8')
			this.templateCache.set(templateFileName, content)
			return content
		} catch (error) {
			this.logger.error(`Template not found ${templateFileName}`, error)
			throw new Error(`Template not found ${templateFileName}`)
		}
	}

	// send verification register
	async sendVerificationRegister(toEmail: string, code: string): Promise<boolean> {
		try {
			// get template
			const template = await this.getTemplate(`notification-register-code`)
			const html = template
				.replace('{CODE_VERIFY}', code)
				.replace('{USER_EMAIL}', toEmail)

			const mailOptions = {
				from: `Thaiandev Service: ${this.configService.getOrThrow<string>("EMAIL_USER")}`,
				to: toEmail,
				html
			}

			// send email using nodemailer's sendMail
			const info = await this.transporter.sendMail(mailOptions)
			return !!(info && (Array.isArray((info as any).accepted) ? (info as any).accepted.length > 0 : (info as any).messageId))
		} catch (error) {
			this.logger.error('Send email failed:', error)
			return false
		}
	}
}
