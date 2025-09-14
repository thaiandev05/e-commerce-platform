import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { SpuStatus } from '@prisma/generated/prisma';
import { Request } from 'express';
import { EventBustService } from '../eventbus/evenbus.service';
import { CreateSpuDto } from './dto/create-spu.dto';
import { UpdateSpuDto } from './dto/update-spu.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
@Injectable()
export class ProductService {

	constructor(
		private readonly prismaService: PrismaService,
		private readonly eventEmitter: EventEmitter2
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
		this.eventEmitter.emit('product.created', { req, newSpu })

		return newSpu
	}

	async updateSpu(productId: string, dto: UpdateSpuDto) {
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
		this.eventEmitter.emit('product.updated', newSpu)
		return newSpu
	}

	async deleteSpu(productId: string) {
		await this.prismaService.spu.delete({
			where: { id: productId }
		})

		this.eventEmitter.emit('product.deleted', { productId })
		return true
	}

}
