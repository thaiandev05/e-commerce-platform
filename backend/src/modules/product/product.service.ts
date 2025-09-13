import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSpuDto } from './dto/create-spu.dto';
import { Request } from 'express';
import { EventBustService } from '../eventbus/evenbus.service';
import { UpdateSpuDto } from './dto/update-spu.dto';
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
		try {
			// check available user
			const availableUser = await this.prismaService.user.findUnique({
				where: { id: req.user?.id }
			})

			if (!availableUser) throw new NotFoundException('User not found')

			// create new product 
			const newSpu = await this.prismaService.spu.create({
				data: dto
			})

			// emit event
			this.eventBus.emit('product.created', newSpu)

			return newSpu
		} catch (error) {
			throw new Error(error.message)
		}
	}

	async updateSpu(req: Request, dto: UpdateSpuDto) {
		
	}

}
