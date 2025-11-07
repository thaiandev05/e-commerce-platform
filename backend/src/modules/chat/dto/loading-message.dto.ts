import {
  IsOptional,
  IsNumber,
  IsString,
  IsUUID,
  IsDateString,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class LoadingMessageDto {
  @ApiPropertyOptional({
    description: 'Number of messages to load',
    minimum: 1,
    maximum: 100,
    default: 20,
    example: 20,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Limit must be a number' })
  @Type(() => Number)
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Number of messages to skip',
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
    description: 'Room ID to filter messages',
    example: 'uuid-room-id',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid room ID format' })
  roomId?: string;

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
