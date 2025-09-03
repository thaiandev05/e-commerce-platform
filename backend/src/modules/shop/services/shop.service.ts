import { EmailProducer } from '@/email/email.producer';
import { PrismaService } from '@/prisma/prisma.service';
import { BadGatewayException, BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Request, Response } from 'express';
import { CreateShopDto } from '../dto/create-shop.dto';
import { UpdateShopDto } from '../dto/update-shop.dto';
import { SHOP_CONSTANT } from '../shop.constant';
import { SearchServiceShop } from './shop.search.service';

@Injectable()
export class ShopService extends SearchServiceShop {

	constructor(
		prismaService: PrismaService,
		private readonly emailProducer: EmailProducer,
	) {
		super(prismaService);
	}

	//create shop
	async createShop(req: Request, dto: CreateShopDto) {
		// check available user
		const userId = req.user?.id
		if (!userId) throw new BadGatewayException("Accesstoken not found")

		const existingUser = await this.prismaService.user.findUnique({
			where: { id: userId }
		})
		if (!existingUser) throw new NotFoundException("User not found")

		// create new shop
		const slugShop = SHOP_CONSTANT.slugShop(dto.name, "shop")
		// check available slugTag
		const isAvailable = await this.prismaService.shop.findUnique({
			where: { slug: slugShop }
		})
		if (isAvailable) throw new BadGatewayException("Slug is available")

		// create new shop
		try {
			const newShop = await this.prismaService.shop.create({
				data: {
					name: dto.name,
					slug: slugShop,
					description: dto.desciption,
					logoUrl: dto.logoUrl,
					bannerUrl: dto.bannerUrl,
					email: dto.email,
					phone: dto.phone,
					address: dto.address,
					website: dto.website,
					ownerId: existingUser.id
				}
			})

			return {
				success: true,
				data: newShop
			}
		} catch (error) {
			return new BadRequestException("Got the errors in the creating")
		}
	}

	// verify shop
	async verifyShop(req: Request, shopId: string) {
		// check availableUSer
		const userId = req.user?.id
		if (!userId) throw new BadRequestException("Accesstoken not found")
		const existingUser = await this.prismaService.user.findUnique({
			where: { id: userId }
		})
		if (!existingUser) throw new NotFoundException("User not found")

		// find available shop
		const availableShop = await this.prismaService.shop.findUnique({
			where: { id: shopId }
		})

		if (!availableShop) throw new NotFoundException("Shop not found")

		//send email verify
		const verifyLink = `http://localhost:4000/shop/verify-shop-link?shopId=${shopId}&&email=${existingUser.email}`
		await this.emailProducer.sendVerifyShop({ to: existingUser.email, linkVerify: verifyLink })

		return {
			success: true
		}
	}

	// api verify shop
	async verifyShopLink(shopId: string, email: string, res: Response) {
		// check availabe shop
		const availableShop = await this.prismaService.shop.findUnique({
			where: { id: shopId }
		})
		if (!availableShop) throw new NotFoundException("Shop not found")

		// update 
		try {
			await this.prismaService.shop.update({
				where: { id: availableShop.id },
				data: {
					status: "APPROVED",
					isVerified: true,
					isActive: true,
					email: email
				}
			})

			return res.send(`
            <html>
              <head><title>Verify Success</title></head>
              <body style="font-family: sans-serif; text-align: center; margin-top: 100px;">
                <h2 style="color: green">Email verified successfully!</h2>
                <p>You can now login to your account.</p>
              </body>
            </html>
          `)
		} catch (error) {
			throw new BadRequestException("Error")
		}
	}

	async updateDetailShop(req: Request, shopId: string, dto: UpdateShopDto) {
		// check valid request
		const userId = req.user?.id
		if (!userId) throw new BadRequestException("User not in request")

		const shop = await this.prismaService.shop.findUnique({
			where: { id: shopId }
		})

		if (!shop) throw new ForbiddenException("Not authorized to update this shop")

		// check if shop change name
		let newSlug: string | undefined
		if (dto.name && dto.name !== shop?.name) {
			newSlug = SHOP_CONSTANT.slugShop(dto.name, "shop")
		}

		// update detail shop
		return await this.prismaService.shop.update({
			where: { id: shopId },
			data: {
				...(dto.name && { name: dto.name }),
				...(newSlug && { slug: newSlug }),
				...(dto.desciption && { desciption: dto.desciption }),
				...(dto.logoUrl && { logoUrl: dto.logoUrl }),
				...(dto.bannerUrl && { bannerUrl: dto.bannerUrl }),
				...(dto.email && { email: dto.email }),
				...(dto.phone && { phone: dto.phone }),
				...(dto.address && { address: dto.address }),
				...(dto.website && { website: dto.website }),
			}
		})
	}

	async deleteShop(req: Request, shopId: string) {
		// delete shop
		await this.prismaService.shop.delete({
			where: { id: shopId }
		})

		return {
			success: true
		}
	}

}
