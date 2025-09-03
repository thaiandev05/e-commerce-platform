import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '@/prisma/prisma.service';
import { Payload } from '../user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(
		private readonly configService: ConfigService,
		private readonly prismaService: PrismaService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(request) => {
					return request?.cookies?.access_token;
				},
				ExtractJwt.fromAuthHeaderAsBearerToken(),
			]),
			ignoreExpiration: false,
			secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
		});
	}

	async validate(payload: Payload) {
		const user = await this.prismaService.user.findUnique({
			where: { id: payload.sub },
			omit: { hashingPassword: true }
		});

		if (!user) {
			throw new UnauthorizedException('User not found');
		}

		if (!user.isVerified) {
			throw new UnauthorizedException('Account not verified');
		}

		if (user.isBanned) {
			throw new UnauthorizedException('Account is banned');
		}

		if (user.isLocked) {
			throw new UnauthorizedException('Account is locked');
		}

		return user;
	}
}
