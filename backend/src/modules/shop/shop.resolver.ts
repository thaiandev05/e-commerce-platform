import { Args, Query, Resolver } from "@nestjs/graphql";
import { ShopQl } from "./entity/shop.entity";
import { ShopService } from "./services/shop.service";
import { FindShopByNameDto } from "./dto/find-shop.dto";
import { Public } from "@/common/decorator/public.decorator";
import { ApiBadRequestResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Shop')
@Resolver(() => ShopQl)
export class ShopResolver {

	constructor(
		private readonly shopService: ShopService
	) { }

	@Public()
	@ApiOperation({ summary: 'Find shops by name with optional pagination, sorting and search' })
	@ApiResponse({ status: 200, description: 'List of shops returned' })
	@ApiBadRequestResponse({ description: 'Invalid input' })
	@Query(() => [ShopQl])
	async findShopByName(
		@Args('shopId', { type: () => String }) shopId: string,
		@Args('search', { type: () => String, nullable: true }) search?: string,
		@Args('limit', { type: () => Number, nullable: true }) limit?: number,
		@Args('page', { type: () => Number, nullable: true }) page?: number,
		@Args('sortBy', { type: () => String, nullable: true }) sortBy?: string,
		@Args('sortOrder', { type: () => String, nullable: true }) sortOrder?: 'asc' | 'desc'
	) {
		const dto = new FindShopByNameDto();
		dto.search = search;
		dto.limit = limit;
		dto.page = page;
		dto.sortBy = sortBy;
		dto.sortOrder = sortOrder;
		return this.shopService.findShopHaveNameLike(shopId, dto);
	}
}