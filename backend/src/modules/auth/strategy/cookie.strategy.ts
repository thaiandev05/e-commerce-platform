import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "@/prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import { Payload } from "../user.interface";
import { Strategy } from "passport-custom";
@Injectable()
export class CookieStrategy extends PassportStrategy(Strategy, 'cookie') {
	constructor(
		private readonly jwtService: JwtService,
		private readonly prismaService: PrismaService,
		private readonly configService: ConfigService
	) {
		super()
	}

	async validate(req: Request): Promise<any> {
		// get access token from req
		const accessToken = req.cookies?.access_token

		if (!accessToken) throw new UnauthorizedException("Access token not found")

		const payload: Payload = await this.jwtService.verifyAsync(accessToken, {
			secret: this.configService.getOrThrow<string>("JWT_SECRET")
		})

		// find user
		const user = await this.prismaService.user.findUnique({
			where: { id: payload.sub }
		})

		if (!user) throw new NotFoundException("User not found")

		return user
	}

}