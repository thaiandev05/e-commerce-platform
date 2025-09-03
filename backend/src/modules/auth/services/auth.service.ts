import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { hash, verify } from 'argon2'
import { RegisterDto } from '../dto/register.dto';
import { randomInt, randomUUID } from 'crypto';
import { EmailProducer } from '@/email/email.producer';
import { VerifyAccountWithCodeDto } from '../dto/verify-account-with-code.dto';
import { LoginDto } from '../dto/login.dto';
import { Request, Response } from 'express';
import { TokenService } from './token.service';
import { User, Provider } from '@prisma/generated/prisma';
import { AUTH_CONSTANT } from '../auth.constant';
import { GoogleOAuth2User, FacebookOAuth2User } from '../user.interface';
import { ChangePasswordDto } from '../dto/change-password.dto';


@Injectable()
export class AuthService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly emailProducer: EmailProducer,
		private readonly tokenService: TokenService
	) { }

	// hasing 
	private hasing(text: string) {
		return hash(text)
	}

	// get hardware user
	private getClientInfo(req: Request) {
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

	// detect other device
	async detectDevice(userEmail: string, userAgent: string, userIp: string, sessionId: string) {
		const otherDevice = await this.prismaService.session.findUnique({
			where: { id: sessionId }
		})

		if (otherDevice?.userAgent !== userAgent) {
			// send message in queue detect other device
			await this.emailProducer.sendDetectOtherDevice({ to: userEmail, userAgent, userIp })
		}

	}

	// register 
	public async register(dto: RegisterDto) {
		// find available account
		const availableAccount = await this.prismaService.user.findFirst({
			where: {
				OR: [
					{ email: dto.email },
					{ username: dto.username }
				]
			}
		})

		if (availableAccount) throw new BadRequestException("Email or username is available")

		// hasing password
		const hashingPassword = await this.hasing(dto.password)

		// create new account
		const newUserId = randomUUID() // generate userid 
		// generate a secure 6-digit numeric code (zero-padded)
		const verifyCode = randomInt(0, 1_000_000).toString().padStart(6, '0')
		const [newAccount, codeVerify] = await this.prismaService.$transaction([
			this.prismaService.user.create({
				data: {
					id: newUserId,
					email: dto.email,
					hashingPassword,
					username: dto.username,
					fullname: dto.fullname
				}
			}),
			this.prismaService.code.create({
				data: {
					code: verifyCode,
					userId: newUserId,
					expiredAt: new Date(Date.now() + AUTH_CONSTANT.CODE_EXPIRED * 1000)
				}
			})
		])

		// send verify code
		await this.emailProducer.sendVerifyCodeRegister({ to: dto.email, code: verifyCode })

		return {
			success: true,
			message: `Verification email sent. Please check your inbox`,
			newAccount
		}
	}

	// verify account with code
	public async verifyAccountWithCode(dto: VerifyAccountWithCodeDto): Promise<boolean> {
		// validate account
		const existingAccount = await this.prismaService.user.findFirst({
			where: {
				OR: [
					{ email: dto.account },
					{ username: dto.account }
				]
			}
		})

		// validate account
		if (!existingAccount) throw new BadRequestException("Account is not exitsing")
		if (existingAccount.isVerified) throw new ForbiddenException("Account already existed")

		// finding code
		const existingCode = await this.prismaService.code.findUnique({
			where: { userId: existingAccount.id }
		})

		if (!existingCode || !existingCode.expiredAt) throw new BadRequestException("Code expired")

		// update new account status
		await this.prismaService.$transaction([
			this.prismaService.user.update({
				where: { id: existingAccount.id },
				data: { isVerified: true }
			}),
			this.prismaService.code.delete({
				where: { userId: existingAccount.id }
			})
		])

		return true
	}

	// login
	public async login(dto: LoginDto, res: Response) {
		// check existed account
		const existingAccount = await this.prismaService.user.findFirst({
			where: {
				OR: [
					{ email: dto.account },
					{ username: dto.account }
				]
			},
			omit: { hashingPassword: false }
		})
		if (!existingAccount) throw new BadRequestException("Account is not existed")

		// check active
		if (!existingAccount.isVerified) throw new BadRequestException("Account is not verified")

		// verify password
		if (!existingAccount.hashingPassword) {
			throw new ForbiddenException("Account or password is not correct");
		}
		const isMatched = await verify(existingAccount.hashingPassword, dto.password)
		if (!isMatched) throw new ForbiddenException("Account or password is not correct")

		// get 
		const hardWare = this.getClientInfo(res.req as Request)

		// create session
		const { session, tokens } = await this.createSession(hardWare.userAgent, hardWare.ip, existingAccount, res)

		const { hashingPassword, ...userWithoutPassword } = existingAccount

		return {
			data: userWithoutPassword,
			session: {
				id: session.id,
				userAgent: session.userAgent,
				userIp: session.userIp,
				loginedAt: session.loginedAt
			},
			tokens
		}
	}

	// create session 
	async createSession(userAgent: string, userIp: string, user: User, res: Response) {
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

	// validate oauth user (works for both Google and Facebook)
	async validateOauth({ providerUserId, email, fullname, firstname, lastname, avatarUrl, username, provider }: {
		providerUserId: string;
		email: string;
		fullname: string;
		firstname?: string;
		lastname?: string;
		avatarUrl?: string;
		username?: string;
		provider: Provider;
	}) {
		// Check if user already exists
		const existingUser = await this.prismaService.user.findUnique({
			where: { email }
		});

		if (!existingUser) {
			// Create new user with OAuth2 account
			const newUserId = randomUUID();
			const [newUser, newOauth2User] = await this.prismaService.$transaction([
				this.prismaService.user.create({
					data: {
						id: newUserId,
						fullname: fullname,
						username: username || `user_${newUserId.slice(0, 8)}`,
						email,
						accountType: 'OAUTH2',
						isVerified: true,
						hashingPassword: null,
						avatarUrl: avatarUrl
					}
				}),
				this.prismaService.oauth2User.create({
					data: {
						provider,
						providerUserId,
						email,
						fullname,
						firstname,
						lastname,
						avatarUrl,
						username: username || `user_${newUserId.slice(0, 8)}`,
						userId: newUserId
					}
				})
			]);
			return newUser;
		}

		// If user exists, check if OAuth2 connection already exists
		const existingOauth2 = await this.prismaService.oauth2User.findFirst({
			where: {
				userId: existingUser.id,
				provider: provider,
				email: email
			}
		});

		if (!existingOauth2) {
			// Link OAuth2 account to existing user
			await this.prismaService.oauth2User.create({
				data: {
					provider,
					providerUserId,
					email,
					fullname,
					firstname,
					lastname,
					avatarUrl,
					username,
					userId: existingUser.id
				}
			});
		} else {
			// Update existing OAuth2 user data
			await this.prismaService.oauth2User.update({
				where: { id: existingOauth2.id },
				data: {
					providerUserId,
					fullname,
					firstname,
					lastname,
					avatarUrl,
					username
				}
			});
		}

		return existingUser;
	}

	// oauth2 login (works for both Google and Facebook)
	async oauth2Login(user: GoogleOAuth2User | FacebookOAuth2User, res: Response) {
		const provider: Provider = user.provider;
		const {
			providerUserId,
			email,
			fullname,
			firstname,
			lastname,
			avatarUrl,
			username
		} = user;

		if (!providerUserId || !email) {
			throw new BadRequestException('Missing required OAuth2 user data');
		}

		// Validate and create/update user
		const validatedUser = await this.validateOauth({
			providerUserId,
			email,
			fullname,
			firstname,
			lastname,
			avatarUrl,
			username,
			provider
		});

		// Get hardware info
		const hardware = this.getClientInfo(res.req as Request);

		// Detect other device login
		const sid = res.req.cookies.session_id
		await this.detectDevice(validatedUser.email, hardware.userAgent, hardware.ip, sid);

		// Create session
		const { session, tokens } = await this.createSession(
			hardware.userAgent,
			hardware.ip,
			validatedUser,
			res
		);

		const { hashingPassword, ...userWithoutPassword } = validatedUser;

		return {
			success: true,
			message: 'OAuth2 login successful',
			data: userWithoutPassword,
			session: {
				id: session.id,
				userAgent: session.userAgent,
				userIp: session.userIp,
				loginedAt: session.loginedAt
			},
			tokens
		};
	}

	// logout 
	public async logout(res: Response, sessionId?: string) {
		// get sessionId in the req
		const sid = res.req.cookies?.session_id || sessionId

		if (!sid) throw new ConflictException("Session id not require")

		try {
			// clear refreshtoken
			await this.prismaService.session.update({
				where: { id: sid },
				data: { hashingRefreshToken: null }
			})
		} catch (error) {
			throw new BadRequestException(error)
		}

		// clear accesstoken and refreshtoken
		res.clearCookie('access_token', { path: '/' })
			.clearCookie('refresh_token', { path: '/' })
			.clearCookie('session_id', { path: '/' })

		return {
			message: "Done",
			data: null
		}
	}

	// changepassword
	public async changePassword(req: Request, dto: ChangePasswordDto) {
		// validate accesstoken
		const userId = req.user?.id
		if (!userId) throw new BadRequestException("Accesstoken not found")

		// find available account
		const exitstingAccount = await this.prismaService.user.findUnique({
			where: { id: userId },
			omit: { hashingPassword: false }
		})

		if (!exitstingAccount) throw new NotFoundException("Account not found")

		// usehardware
		const hardware = this.getClientInfo(req)

		// verify password
		if (exitstingAccount.hashingPassword) {
			const isMatched = verify(exitstingAccount.hashingPassword, dto.oldPassword)

			if (!isMatched) {
				throw new ForbiddenException("Password not matched")
			}

			// change password
			const newHasingPassword = await hash(dto.newPassword)
			await this.prismaService.user.update({
				where: { id: exitstingAccount.id },
				data: { hashingPassword: newHasingPassword }
			})

			// send email notification
			await this.emailProducer.sendChangePasswordNotificaiton({
				to: exitstingAccount.email,
				userName: exitstingAccount.username,
				userIp: hardware.ip,
				userAgent: hardware.userAgent
			})
			return {
				success: true
			}
		} else {
			throw new BadRequestException("It not accept with oauth2 account")
		}
	}
}
