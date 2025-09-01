import { IsEmail, IsAlphanumeric, IsString, MinLength, MaxLength, IsOptional, IsNotEmpty } from 'class-validator';

export class VerifyAccountWithCodeDto {
	@IsOptional()
	@IsEmail({}, { message: 'Invalid email address or username.' })
	account?: string;

	@IsNotEmpty({ message: 'Verification code is required.' })
	@IsString()
	@MinLength(4, { message: 'Code must be at least 4 characters.' })
	@MaxLength(10, { message: 'Code must be at most 10 characters.' })
	code: string;
}