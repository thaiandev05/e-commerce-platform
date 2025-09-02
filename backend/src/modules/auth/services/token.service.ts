import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { User } from '@prisma/generated/prisma';
import { Payload } from '../user.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { AuthService } from './auth.service';

@Injectable()
export class TokenService {

	constructor(
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		private readonly prismaService: PrismaService,
		@Inject(forwardRef(() => AuthService))
		private readonly authService: AuthService
	) { }

	// generate tokens
	async generateTokens(user: User) {
		// create payload 
		const payload: Payload = {
			sub: user.id,
			email: user.email,
			createdAt: new Date()
		}

		// generate accessToken and refreshToken
		const [accessToken, refreshToken] = await Promise.all([
			this.jwtService.signAsync(payload, {
				secret: this.configService.getOrThrow<string>("JWT_SECRET"),
				expiresIn: this.configService.getOrThrow<string>("TIME_LIFE_ACCESS_TOKEN")
			}),
			this.jwtService.signAsync(payload, {
				secret: this.configService.getOrThrow<string>("JWT_SECRET"),
				expiresIn: this.configService.getOrThrow<string>("TIME_LIFE_REFRESH_TOKEN")
			})
		])

		return { accessToken, refreshToken }
	}

	// store session
	async storeSession(userAgent: string, userIp: string, hashingRefreshToken: string, user: User) {
		// find existing session for this user and user agent
		const existingSession = await this.prismaService.session.findUnique({
			where: { userAgent: userAgent }
		})

		if (existingSession) {
			// detect other device login
			await this.authService.detectDevice(user.email, userAgent, userIp)

			// update existing session
			return await this.prismaService.session.update({
				where: { id: existingSession.id },
				data: {
					hashingRefreshToken,
					userIp,
					loginedAt: new Date(),
					logoutedAt: null // Reset logout time on new login
				}
			})
		}

		// create new session
		return await this.prismaService.session.create({
			data: {
				hashingRefreshToken,
				userIp,
				userId: user.id,
				userAgent,
				loginedAt: new Date()
			}
		})
	}
}
