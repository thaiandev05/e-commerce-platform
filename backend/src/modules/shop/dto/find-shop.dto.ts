import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsOptional } from "class-validator";

export class FindShopByNameDto {
	cursor?: string
	limit?: number = 10
	page?: number
	search?: string
	@IsEnum(['name', 'createdAt', 'updatedAt', 'status'])
	sortBy?: string = 'createdAt';
	@IsEnum(['asc', 'desc'])
	sortOrder?: 'asc' | 'desc' = 'desc';
	@IsOptional()
	@Transform(({ value }) => value === 'true' || value === true)
	@IsBoolean()
	includeTotalSpuCount?: boolean = true;
	@IsOptional()
	@Transform(({ value }) => value === 'true' || value === true)
	@IsBoolean()
	includeSkuCount?: boolean = true;
	// Computed properties for cursor pagination
	get take(): number {
		return this.limit ?? 10;
	}

	// Fallback for offset pagination
	get skip(): number {
		if (!this.page) return 0;
		return ((this.page ?? 1) - 1) * (this.limit ?? 10);
	}

	get useCursor(): boolean {
		return !!this.cursor;
	}
}