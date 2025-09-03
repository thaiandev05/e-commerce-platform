import { PrismaService } from '@/prisma/prisma.service';
import { BadGatewayException, BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Request, Response } from 'express';
import { CreateShopDto } from './dto/create-shop.dto';
import { SHOP_CONSTANT } from './shop.constant';
import { EmailProducer } from '@/email/email.producer';

@Injectable()
export class ShopService {

	constructor(
		private readonly prismaService: PrismaService,
		private readonly emailProducer: EmailProducer
	) { }

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
		const verifyLink = `http://localhost:4000/shop/verify-shop-link?shopId=${shopId}`
		await this.emailProducer.sendVerifyShop({ to: existingUser.email, linkVerify: verifyLink })

		return {
			success: true
		}
	}

	// api verify shop
	async verifyShopLink(shopId: string, res: Response) {
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
					isActive: true
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

	
}
