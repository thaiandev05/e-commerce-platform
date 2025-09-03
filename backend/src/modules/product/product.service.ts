import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateSpuDto } from './dto/create-spu.dto';

@Injectable()
export class ProductService {

	constructor(
		private readonly prismaService: PrismaService
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

	async createSpu(dto: CreateSpuDto) {
		try {
			
		} catch (error) {
			
		}
	}
}
