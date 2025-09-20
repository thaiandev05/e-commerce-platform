import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ChatSession, GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai'
import { GetResponseDto } from "./get-ai-response.dto";
import { v4 } from 'uuid'
@Injectable()
export class GenemiService {
	private readonly googleAI: GoogleGenerativeAI
	private readonly mode: GenerativeModel
	private chatSessions: { [sessionId: string]: ChatSession } = {}
	private readonly logger = new Logger(GenemiService.name)

	constructor(configService: ConfigService) {
		const genemiApiKey = configService.getOrThrow<string>("GENEMI_API_KEY")
		const genemiVersion = configService.getOrThrow<string>("GENEMI_MODEL")
		this.googleAI = new GoogleGenerativeAI(genemiApiKey)
		this.mode = this.googleAI.getGenerativeModel({
			model: genemiVersion
		})
	}

	private getChatSession(sessionId: string) {
		let sessionIdToUse = sessionId ?? v4()

		let result = this.chatSessions[sessionIdToUse]

		if (!result) {
			result = this.mode.startChat()
			this.chatSessions[sessionIdToUse] = result
		}

		return {
			sessionId: sessionIdToUse,
			chat: result
		}
	}
	async generateText(data: GetResponseDto) {
		try {
			const { sessionId, chat } = this.getChatSession(data.sessionId)

			const result = await chat.sendMessage(data.prompt)

			return {
				result: await result.response.text(),
				sessionId
			}
		} catch (error) {
			this.logger.error(error)
		}
	}
}