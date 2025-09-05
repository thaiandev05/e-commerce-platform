import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { changeDetailUserDto } from '../dto/change-detail.dto';
import { ChangeAvataUrlDto } from '../dto/change-avataUrl.dto';
@Injectable()
export class UserService {
	constructor(
		private readonly prismaService: PrismaService
	) { }

	// change detail user
	async changeDetailUser(req: Request, accountId: string, dto: changeDetailUserDto) {
		const userId = req.user?.id
		if (!userId) throw new BadRequestException("Not found user in request")

		// change detail user 
		const newUser = await this.prismaService.user.update({
			where: { id: userId },
			data: {
				...(dto.address && { address: dto.address }),
				...(dto.city && { city: dto.city }),
				...(dto.fullname && { fullname: dto.fullname }),
				...(dto.username && { username: dto.username })
			}
		})

		return {
			success: true,
			data: newUser
		}
	}

	// change avatar user
	async changeAvataUrl(req: Request, accountId: string, dto: ChangeAvataUrlDto) {
		const userId = req.user?.id
		if (!userId) throw new BadRequestException("Not found user in request")

		// update avataUrl
		const newUser = await this.prismaService.user.update({
			where: { id: userId },
			data: { avatarUrl: dto.avataUrl }
		})

		return {
			success: true,
			data: newUser
		}
	}
}
