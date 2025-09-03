import { Transform, Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max, IsString, IsEnum, IsBoolean, IsUUID } from 'class-validator';

export class GetShopDetailWithSpusDto {
	// Cursor-based pagination
	@IsOptional()
	@IsString()
	cursor?: string; // SPU ID for cursor-based pagination

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(50)
	limit?: number = 10;

	// Fallback to offset pagination if needed
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number;

	// SPU Filtering
	@IsOptional()
	@IsString()
	search?: string; // Search in SPU name, description, shortDesc

	@IsOptional()
	@IsEnum(['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'PUBLISHED', 'ARCHIVED'])
	status?: string;

	@IsOptional()
	@Transform(({ value }) => value === 'true' || value === true)
	@IsBoolean()
	isActive?: boolean;

	@IsOptional()
	@IsString()
	@IsUUID()
	categoryId?: string;

	@IsOptional()
	@IsString()
	@IsUUID()
	brandId?: string;

	// SPU Sorting
	@IsOptional()
	@IsEnum(['name', 'createdAt', 'updatedAt', 'status'])
	sortBy?: string = 'createdAt';

	@IsOptional()
	@IsEnum(['asc', 'desc'])
	sortOrder?: 'asc' | 'desc' = 'desc';

	// Include options for SPU relations
	@IsOptional()
	@Transform(({ value }) => value === 'true' || value === true)
	@IsBoolean()
	includeSpuImages?: boolean = true;

	@IsOptional()
	@Transform(({ value }) => value === 'true' || value === true)
	@IsBoolean()
	includeSpuAttributes?: boolean = false;

	@IsOptional()
	@Transform(({ value }) => value === 'true' || value === true)
	@IsBoolean()
	includeSpuTags?: boolean = false;

	@IsOptional()
	@Transform(({ value }) => value === 'true' || value === true)
	@IsBoolean()
	includeSpuVariations?: boolean = false;

	@IsOptional()
	@Transform(({ value }) => value === 'true' || value === true)
	@IsBoolean()
	includeSkuCount?: boolean = true;

	// Shop include options
	@IsOptional()
	@Transform(({ value }) => value === 'true' || value === true)
	@IsBoolean()
	includeOwner?: boolean = false;

	@IsOptional()
	@Transform(({ value }) => value === 'true' || value === true)
	@IsBoolean()
	includeTotalSpuCount?: boolean = true;

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
