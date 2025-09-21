import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ChatSession, GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai'
import { GetResponseDto } from "./get-ai-response.dto";
import { v4 } from 'uuid'
import { QuickReplyService } from "./service/quick-reply.service";

@Injectable()
export class GenemiChatBotService {
	private readonly googleAI: GoogleGenerativeAI
	private readonly mode: GenerativeModel
	private chatSessions: { [sessionId: string]: ChatSession } = {}
	private readonly logger = new Logger(GenemiChatBotService.name)

	constructor(
		configService: ConfigService,
		private readonly quickReplyService: QuickReplyService
	) {
		const genemiApiKey = configService.getOrThrow<string>("GENEMI_API_KEY")
		const genemiVersion = configService.getOrThrow<string>("GENEMI_MODEL")
		this.googleAI = new GoogleGenerativeAI(genemiApiKey)
		this.mode = this.googleAI.getGenerativeModel({
			model: genemiVersion
		})
	}

	private isGreeting(message: string) {
		const greetings = ['hi', 'hello', 'chào', 'xin chào', 'hey', 'chào bạn']
		return greetings.some(greeting => message.startsWith(greeting))
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
			const sessionIdToUse = data.sessionId || v4()

			// handle quick reply first
			if (data.isQuickReply && data.quickReplyPayload) {
				const res = this.quickReplyService.handleQuickReplies(data.quickReplyPayload)
				if (res) {
					res.sessionId = sessionIdToUse
				}
				return res
			}

			// checking greeting or FAQ
			const normalQuestions = data.prompt.toLowerCase().trim()
			if (this.isGreeting(normalQuestions)) {
				const res = this.quickReplyService.getGreetingResponse()
				res.sessionId = sessionIdToUse
				return res
			}

			// check FAQ first
			const faqQuestion = this.quickReplyService.buildFAQResponse(data.prompt)
			if (faqQuestion) {
				faqQuestion.sessionId = sessionIdToUse
				return faqQuestion
			}

			// build context for the user
			

		} catch (error) {
			this.logger.error(error)
		}
	}
}