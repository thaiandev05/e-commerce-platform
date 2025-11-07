import {
  IsOptional,
  IsNumber,
  IsString,
  IsBoolean,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum RoomSortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  NAME = 'name',
  LAST_MESSAGE = 'lastMessage',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class LoadingRoomDto {
  @ApiPropertyOptional({
    description: 'Number of rooms to load',
    minimum: 1,
    maximum: 50,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Limit must be a number' })
  @Type(() => Number)
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(50, { message: 'Limit cannot exceed 50' })
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Number of rooms to skip',
    minimum: 0,
    default: 0,
    example: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Offset must be a number' })
  @Type(() => Number)
  @Min(0, { message: 'Offset must be at least 0' })
  offset?: number = 0;

  @ApiPropertyOptional({
    description: 'Search keyword in room name or description',
    example: 'product discussion',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by room type',
    enum: ['direct', 'group', 'support', 'seller_buyer'],
    example: 'direct',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: 'Filter by private/public rooms',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  isPrivate?: boolean;

  @ApiPropertyOptional({
    description: 'Sort rooms by field',
    enum: RoomSortBy,
    example: RoomSortBy.UPDATED_AT,
  })
  @IsOptional()
  @IsEnum(RoomSortBy)
  sortBy?: RoomSortBy = RoomSortBy.UPDATED_AT;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({
    description: 'Only show rooms with unread messages',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  unreadOnly?: boolean = false;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Page must be a number' })
  @Type(() => Number)
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of messages to skip (calculated field)',
    minimum: 0,
    example: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Skip must be a number' })
  @Type(() => Number)
  @Min(0, { message: 'Skip must be at least 0' })
  skip?: number;

  @ApiPropertyOptional({
    description: 'Whether to use cursor-based pagination',
    default: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'IsUseCursor must be a boolean' })
  @Type(() => Boolean)
  isUseCursor?: boolean = false;

  @ApiPropertyOptional({
    description: 'Cursor for pagination (used with cursor-based pagination)',
    example: 'eyJpZCI6MTIzLCJ0aW1lc3RhbXAiOiIyMDIzLTA5LTI3VDEwOjAwOjAwWiJ9',
  })
  @IsOptional()
  @IsString({ message: 'Cursor must be a string' })
  cursor?: string;
}
