import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { changeDetailUserDto } from '../dto/change-detail.dto';
import { ChangeAvataUrlDto } from '../dto/change-avataUrl.dto';
import { AddCreditCardDto } from '../dto/add-credit-card.dto';
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

	// add credit card
	async addCreditCard(req: Request, accountId: string, dto: AddCreditCardDto) {
		const userId = accountId ?? req.user?.id
		if (!userId) throw new BadRequestException("Not found user in request")

		// check available user
		const availableUser = await this.prismaService.user.findUnique({
			where: { id: userId }
		})

		if (!availableUser) throw new NotFoundException("User not found")

		// check available credit card 
		const availableCreditCard = await this.prismaService.creditCard.findUnique({
			where: { creditNumber: dto.creditNumber }
		})

		if (availableCreditCard) throw new ForbiddenException("Credit've used or used by other user")

		// parse and validate expiredDate (expecting an ISO-like date string or timestamp)
		const expired = new Date(dto.expiredDate)
		if (isNaN(expired.getTime())) throw new BadRequestException('Invalid expiredDate format. Use an ISO date string (e.g. "2030-10-23") or a timestamp')

		//add credit card
		const newCreditCard = await this.prismaService.creditCard.create({
			data: {
				creditNumber: dto.creditNumber,
				expiredDate: expired,
				ccvSecure: dto.ccvSecure,
				name: dto.name,
				address: dto.address,
				postalCode: dto.postalCode,
				userId: availableUser.id
			}
		})

		return {
			success: true,
			data: newCreditCard
		}
	}
}
