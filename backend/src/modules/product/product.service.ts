import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSpuDto } from './dto/create-spu.dto';
import { Request } from 'express';
import { EventBustService } from '../eventbus/evenbus.service';
import { UpdateSpuDto } from './dto/update-spu.dto';
import { SpuStatus } from '@prisma/generated/prisma';
@Injectable()
export class ProductService {

	constructor(
		private readonly prismaService: PrismaService,
		private readonly eventBus: EventBustService
	) { }


	async getCategories() {
		return this.prismaService.category.findMany({
			where: { isActive: true },
			include: { children: true },
			orderBy: { sortOrder: 'asc' }
		})
	}

	async getBrands() {
		return this.prismaService.brand.findMany({
			where: { isActive: true },
			orderBy: { name: 'asc' }
		})
	}

	async createSpu(req: Request, dto: CreateSpuDto) {
		// check available user
		const availableUser = await this.prismaService.user.findUnique({
			where: { id: req.user?.id }
		})
		if (!availableUser) throw new NotFoundException('User not found')

		// create new product 
		const createSpuData = {
			...dto,
			status: dto.status ? SpuStatus[dto.status as keyof typeof SpuStatus] : undefined
		};
		const newSpu = await this.prismaService.spu.create({
			data: createSpuData
		})

		// emit event
		this.eventBus.emit('product.created', newSpu)

		return newSpu
	}

	async updateSpu(req: Request, productId: string, dto: UpdateSpuDto) {
		const newSpu = await this.prismaService.spu.update({
			where: { id: productId },
			data: {
				...(dto.name && { name: dto.name }),
				...(dto.description && { description: dto.description }),
				...(dto.shortDesc && { shortDesc: dto.shortDesc }),
				...(dto.slug && { slug: dto.slug }),
				...(dto.status && { status: dto.status })
			}
		})

		// emit event
		this.eventBus.emit('product.updated', newSpu)
		return newSpu
	}

	async deleteSpu(req: Request, productId: string) {
		return await this.prismaService.spu.delete({
			where: { id: productId }
		})
	}

}
