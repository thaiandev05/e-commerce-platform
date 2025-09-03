import { PrismaService } from "@/prisma/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { GetShopDetailWithSpusDto } from "../dto/get-shop-detail-with-spus.dto";

@Injectable()
export class SearchServiceShop {
	constructor(
		protected readonly prismaService: PrismaService
	) { }

	async getDetailerShop(shopId: string, dto: GetShopDetailWithSpusDto) {

		// Build shop include options
		const shopInclude: any = {};

		if (dto.includeOwner) {
			shopInclude.owner = {
				select: {
					id: true,
					email: true,
					firstName: true,
					lastName: true,
					avatar: true
				}
			};
		}

		if (dto.includeTotalSpuCount) {
			shopInclude._count = {
				select: {
					spus: true
				}
			};
		}

		// Get shop details
		const shop = await this.prismaService.shop.findUnique({
			where: { id: shopId },
			include: shopInclude
		});

		if (!shop) throw new NotFoundException('Shop is not available');

		// Build SPU where conditions
		const spuWhere: any = { shopId };

		if (dto.search) {
			spuWhere.OR = [
				{ name: { contains: dto.search, mode: 'insensitive' } },
				{ description: { contains: dto.search, mode: 'insensitive' } },
				{ shortDesc: { contains: dto.search, mode: 'insensitive' } }
			];
		}

		if (dto.status) spuWhere.status = dto.status;
		if (typeof dto.isActive === 'boolean') spuWhere.isActive = dto.isActive;
		if (dto.categoryId) spuWhere.categoryId = dto.categoryId;
		if (dto.brandId) spuWhere.brandId = dto.brandId;

		// Build SPU include options
		const spuInclude: any = {
			category: {
				select: {
					id: true,
					name: true,
					slug: true
				}
			},
			brand: {
				select: {
					id: true,
					name: true,
					slug: true,
					logoUrl: true
				}
			}
		};

		if (dto.includeSkuCount) {
			spuInclude._count = {
				select: {
					skus: true
				}
			};
		}

		if (dto.includeSpuImages) {
			spuInclude.spuImages = {
				take: 5,
				orderBy: { sortOrder: 'asc' },
				select: {
					id: true,
					imageUrl: true,
					altText: true,
					isMain: true,
					sortOrder: true
				}
			};
		}

		if (dto.includeSpuAttributes) {
			spuInclude.spuAttributes = {
				include: {
					attribute: {
						select: {
							id: true,
							name: true,
							displayName: true,
							type: true
						}
					},
					attributeValue: {
						select: {
							id: true,
							value: true,
							displayName: true,
							colorCode: true,
							imageUrl: true
						}
					}
				}
			};
		}

		if (dto.includeSpuTags) {
			spuInclude.spuTags = {
				include: {
					tag: {
						select: {
							id: true,
							name: true,
							slug: true,
							color: true
						}
					}
				}
			};
		}

		if (dto.includeSpuVariations) {
			spuInclude.spuVariations = {
				include: {
					attribute: {
						select: {
							id: true,
							name: true,
							displayName: true,
							type: true
						}
					}
				},
				orderBy: { sortOrder: 'asc' }
			};
		}

		// Prepare query options
		const queryOptions: any = {
			where: spuWhere,
			include: spuInclude,
			take: dto.take + 1, // Take one extra to check if there's a next page
			orderBy: { [dto.sortBy || 'createdAt']: dto.sortOrder || 'desc' }
		};

		// Use cursor-based pagination if cursor is provided
		if (dto.useCursor && dto.cursor) {
			queryOptions.cursor = { id: dto.cursor };
			queryOptions.skip = 1; // Skip the cursor item itself
		} else if (dto.page) {
			// Fallback to offset pagination
			queryOptions.skip = dto.skip;
			queryOptions.take = dto.take;
		}

		// Get SPUs
		const spus = await this.prismaService.spu.findMany(queryOptions);

		// Check if there are more items
		const hasNextPage = spus.length > dto.take;
		if (hasNextPage) {
			spus.pop(); // Remove the extra item
		}

		// Get next cursor
		const nextCursor = hasNextPage && spus.length > 0 ? spus[spus.length - 1].id : null;

		// For cursor pagination, we don't need total count (expensive operation)
		// Only calculate if explicitly using offset pagination
		let totalSpus: number | undefined;
		let totalPages: number | undefined;

		if (dto.page && !dto.useCursor) {
			totalSpus = await this.prismaService.spu.count({ where: spuWhere });
			totalPages = Math.ceil(totalSpus / dto.take);
		}

		return {
			success: true,
			data: {
				shop,
				spus,
				pagination: dto.useCursor
					? {
						// Cursor-based pagination response
						limit: dto.take,
						hasNext: hasNextPage,
						nextCursor,
						cursor: dto.cursor
					}
					: {
						// Offset-based pagination response
						page: dto.page || 1,
						limit: dto.take,
						total: totalSpus!,
						totalPages: totalPages!,
						hasNext: hasNextPage,
						hasPrev: (dto.page || 1) > 1
					}
			}
		};
	}
}