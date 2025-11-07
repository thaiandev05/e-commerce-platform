import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ChatSession,
  GenerativeModel,
  GoogleGenerativeAI,
} from '@google/generative-ai';
import { GetResponseDto } from './dto/get-ai-response.dto';
import { v4 } from 'uuid';
import { PrismaService } from '@/prisma/prisma.service';
import { FaqService } from './service/faq.service';
import { TrackingService } from './service/tracking.service';
import { RecommentService } from './service/recomment.service';
import { CheckoutAndCart } from './service/checkoutAndCart.service';
import { AfterSaleService } from './service/after-sale.service';
@Injectable()
export class GenemiChatBotService {
  private readonly googleAI: GoogleGenerativeAI;
  private readonly mode: GenerativeModel;
  private chatSessions: { [sessionId: string]: ChatSession } = {};
  private readonly logger = new Logger(GenemiChatBotService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly faqService: FaqService,
    private readonly trackService: TrackingService,
    private readonly recommentService: RecommentService,
    private readonly checkoutService: CheckoutAndCart,
    private readonly afterSaleService: AfterSaleService,
  ) {
    try {
      const genemiApiKey = configService.getOrThrow<string>('GENEMI_API_KEY');
      const genemiVersion =
        configService.getOrThrow<string>('GENEMI_MODEL') || 'gemini-1.5-flash';

      if (!genemiApiKey) {
        throw new Error('GENEMI_API_KEY is required in environment variables');
      }

      this.googleAI = new GoogleGenerativeAI(genemiApiKey);
      this.mode = this.googleAI.getGenerativeModel({
        model: genemiVersion,
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2000,
        },
      });

      this.logger.log(`Gemini AI initialized with model: ${genemiVersion}`);
    } catch (error) {
      this.logger.error(`Failed to initialize Gemini AI: ${error.message}`);
      throw error;
    }
  }

  private getChatSession(sessionId: string) {
    try {
      const sessionIdToUse = sessionId || v4();

      let result = this.chatSessions[sessionIdToUse];

      if (!result) {
        this.logger.log(`Creating new chat session: ${sessionIdToUse}`);
        result = this.mode.startChat({
          generationConfig: {
            maxOutputTokens: 2000,
            temperature: 0.7,
          },
        });
        this.chatSessions[sessionIdToUse] = result;
      } else {
        this.logger.log(`Using existing chat session: ${sessionIdToUse}`);
      }

      return {
        sessionId: sessionIdToUse,
        chat: result,
      };
    } catch (error) {
      this.logger.error(`Error creating chat session: ${error.message}`);
      throw new Error(`Failed to create chat session: ${error.message}`);
    }
  }

  private async firstResponse(userId: string) {
    // check available user
    const availableUser = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!availableUser) throw new NotFoundException('User not found');
    try {
      const welcomeMessage = `Chào mừng ${availableUser.username} đến với E-commerce Assistant! Tôi có thể giúp bạn:
			Chính sách đổi/trả hàng.

			Phí ship, thời gian giao hàng.

			Chính sách bảo hành.

			Khuyến mãi hiện tại.

			Hướng dẫn thanh toán.`;

      return welcomeMessage;
    } catch (error) {
      this.logger.error(`Error generating first response: ${error.message}`);
      return 'Xin chào! Tôi là trợ lý AI của E-commerce. Tôi có thể giúp gì cho bạn?';
    }
  }

  // Clean up old sessions to prevent memory leaks
  private cleanupOldSessions() {
    const maxSessions = 100;
    const sessionIds = Object.keys(this.chatSessions);

    if (sessionIds.length > maxSessions) {
      const sessionsToRemove = sessionIds.slice(
        0,
        sessionIds.length - maxSessions,
      );
      sessionsToRemove.forEach((sessionId) => {
        delete this.chatSessions[sessionId];
      });
      this.logger.log(
        `Cleaned up ${sessionsToRemove.length} old chat sessions`,
      );
    }
  }

  // Get welcome message for new users
  async getWelcomeMessage(userId?: string): Promise<string> {
    return this.firstResponse(userId || 'anonymous');
  }

  async generateText(data: GetResponseDto) {
    // Validate input
    if (!data.prompt || data.prompt.trim().length === 0) {
      throw new BadRequestException('Prompt cannot be empty');
    }

    const { sessionId, chat } = this.getChatSession(data.sessionId || '');
    this.logger.log(`Sending prompt to Gemini AI for session: ${sessionId}`);

    // check FAQ
    if (data.payload && !data.isTracking) {
      return this.faqService.handleFaq(data.payload);
    }

    // check tracking
    if (data.payload && Boolean(data.isTracking)) {
      if (!data.orderId || !data.userId) {
        throw new BadRequestException(
          'Order ID and User ID are required for tracking',
        );
      }
      return this.trackService.handleTracking(
        data.payload,
        data.orderId,
        data.userId,
      );
    }

    // check is recomment
    if (data.isRecommendation) {
      return this.recommentService.handleRecommendation(data.prompt);
    }

    // check checkout
    if (data.isCheckout) {
      return this.checkoutService.handleCheckout(
        data.checkoutPrompt || '',
        data.userId || '',
        data.productId || '',
        data.cartId || '',
        data.storeProductId || '',
        data.quantity || 0,
      );
    }

    // check afterservice
    if (data.isAfterSale) {
      return this.afterSaleService.handleAfterSale(data.afterSaleReq || '');
    }

    const result = await chat.sendMessage(data.prompt);
    const responseText = await result.response.text();

    if (!responseText) {
      throw new InternalServerErrorException('Empty response from Gemini AI');
    }

    this.logger.log(
      `Received response from Gemini AI for session: ${sessionId}`,
    );

    // ✅ chỉ return data, interceptor sẽ wrap
    return {
      result: responseText,
      sessionId,
    };
  }
}
