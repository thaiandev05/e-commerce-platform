import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  Length,
  Matches,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeDetailDto {
  @ApiProperty({
    description: 'User first name',
    example: 'John',
    minLength: 2,
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  @Transform(({ value }) => value?.trim())
  fullname?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    minLength: 2,
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  @Transform(({ value }) => value?.trim())
  username?: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    format: 'email',
    required: false,
  })
  @IsOptional()
  @IsEmail(
    {},
    {
      message: 'Please provide a valid email address',
    },
  )
  @Transform(({ value }) => value?.trim().toLowerCase())
  email?: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+1234567890',
    minLength: 10,
    maxLength: 15,
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(10, 15)
  @Matches(/^[\+]?[1-9][\d]{0,15}$/, {
    message: 'Phone number must be a valid format',
  })
  @Transform(({ value }) => value?.trim())
  phoneNumber?: string;

  @ApiProperty({
    description: 'User date of birth',
    example: '1990-01-15',
    type: String,
    format: 'date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: Date;

  @ApiProperty({
    description: 'User address',
    example: '123 Main Street, City, State',
    minLength: 5,
    maxLength: 200,
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(5, 200)
  @Transform(({ value }) => value?.trim())
  address?: string;

  @ApiProperty({
    description: 'User bio/description',
    example: 'Software developer passionate about technology',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  @Transform(({ value }) => value?.trim())
  bio?: string;
}
