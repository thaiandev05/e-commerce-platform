import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class SearchUserLikeNameDto {
  @ApiProperty({
    description: 'Search term for user name (first name or last name)',
    example: 'john',
    minLength: 1,
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    description: 'Sort field',
    example: 'firstName',
    enum: ['firstName', 'lastName', 'email', 'createdAt'],
    default: 'firstName',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['firstName', 'lastName', 'email', 'createdAt'])
  sortBy?: string = 'firstName';

  @ApiProperty({
    description: 'Sort order',
    example: 'asc',
    enum: ['asc', 'desc'],
    default: 'asc',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';

  @ApiProperty({
    description: 'Filter by user status',
    example: 'active',
    enum: ['active', 'inactive', 'banned'],
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive', 'banned'])
  status?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeDeleted?: boolean = false;

  @ApiProperty({
    description: 'Cursor for pagination',
    example: 'eyJpZCI6MTIzfQ==',
    required: false,
  })
  @IsOptional()
  @IsString()
  cursor?: string;

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
