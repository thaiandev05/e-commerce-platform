import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { hash } from 'argon2'
import { RegisterDto } from '../dto/register.dto';
import { randomInt, randomUUID } from 'crypto';
import { EmailProducer } from '@/email/email.producer';
import { VerifyAccountWithCodeDto } from '../dto/verify-account-with-code.dto';

const CODE_EXPIRED = 15 * 60 // 15 minutes (in seconds)

@Injectable()
export class AuthService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly emailProducer: EmailProducer
	) { }

	// hasing 
	private hasing(text: string) {
		return hash(text)
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
		const hasingPassword = await this.hasing(dto.password)

		// create new account
		const newUserId = randomUUID() // generate userid 
		// generate a secure 6-digit numeric code (zero-padded)
		const verifyCode = randomInt(0, 1_000_000).toString().padStart(6, '0')
		const [newAccount, codeVerify] = await this.prismaService.$transaction([
			this.prismaService.user.create({
				data: {
					id: newUserId,
					email: dto.email,
					hasingPassword,
					username: dto.username,
					fullname: dto.fullname
				}
			}),
			this.prismaService.code.create({
				data: {
					code: verifyCode,
					userId: newUserId,
					expiredAt: new Date(Date.now() + CODE_EXPIRED * 1000)
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

}
