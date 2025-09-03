import { Injectable } from "@nestjs/common";
import { hash } from "argon2";
import { Request, Response } from 'express';
import { AUTH_CONSTANT } from "../auth.constant";
import { TokenService } from "./token.service";
import { User } from "@prisma/generated/prisma";

@Injectable()
export class OtherService {

	constructor(
		private readonly tokenService: TokenService
	) {}

	// hasing 
	protected hasing(text: string) {
		return hash(text)
	}

	// get hardware user
	protected getClientInfo(req: Request) {
		// Fastest IP extraction with fallback chain
		const ip = req.ip ||
			req.socket.remoteAddress ||
			req.connection.remoteAddress ||
			(req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
			req.headers['x-real-ip'] as string ||
			'unknown';

		// Fastest User-Agent extraction
		const userAgent = req.headers['user-agent'] || 'unknown';

		return { ip, userAgent }
	}

	// create session 
	protected async createSession(userAgent: string, userIp: string, user: User, res: Response) {
		// generate tokens
		const tokens = await this.tokenService.generateTokens(user)

		// hasing refreshToken
		const hashingRefreshToken = await this.hasing(tokens.refreshToken)

		// store session
		const sid = res.req.cookies.session_id
		const session = await this.tokenService.storeSession(userAgent, userIp, hashingRefreshToken, user, sid)

		// config sesison
		res
			.cookie('session_id', session.id, {
				maxAge: AUTH_CONSTANT.TIME_LIFE_SESSION,
				...AUTH_CONSTANT.COOKIE_CONFIG.SESSION
			})
			.cookie('access_token', tokens.accessToken, {
				maxAge: AUTH_CONSTANT.TIME_LIFE_ACCESS_TOKEN,
				...AUTH_CONSTANT.COOKIE_CONFIG.ACCESS_TOKEN
			})
			.cookie('refresh_token', tokens.refreshToken, {
				maxAge: AUTH_CONSTANT.TIME_LIFE_REFRESH_TOKEN,
				...AUTH_CONSTANT.COOKIE_CONFIG.REFRESH_TOKEN
			})

		return { session, tokens }
	}
}