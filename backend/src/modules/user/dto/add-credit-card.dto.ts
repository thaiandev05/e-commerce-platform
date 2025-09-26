import { IsString, IsNotEmpty, IsDateString, Length, Matches, IsOptional } from 'class-validator'
import { Transform, Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class AddCreditCardDto {
	@ApiProperty({
		description: 'Credit card number (16 digits)',
		example: '4532015112830366',
		minLength: 16,
		maxLength: 19
	})
	@IsString()
	@IsNotEmpty()
	@Matches(/^[0-9\s]{16,19}$/, {
		message: 'Credit card number must be 16-19 digits'
	})
	@Transform(({ value }) => value?.replace(/\s/g, ''))
	creditNumber: string

	@ApiProperty({
		description: 'Card expiration date',
		example: '2025-12-31',
		type: String,
		format: 'date'
	})
	@IsDateString()
	@IsNotEmpty()
	expiredDate: Date

	@ApiProperty({
		description: 'CCV security code (3-4 digits)',
		example: '123',
		minLength: 3,
		maxLength: 4
	})
	@IsString()
	@IsNotEmpty()
	@Length(3, 4)
	@Matches(/^[0-9]{3,4}$/, {
		message: 'CCV must be 3-4 digits'
	})
	ccvSecure: string

	@ApiProperty({
		description: 'Cardholder full name',
		example: 'John Doe',
		minLength: 2,
		maxLength: 100
	})
	@IsString()
	@IsNotEmpty()
	@Length(2, 100)
	@Transform(({ value }) => value?.trim())
	name: string

	@ApiProperty({
		description: 'Billing address',
		example: '123 Main St, New York, NY',
		minLength: 5,
		maxLength: 200
	})
	@IsString()
	@IsNotEmpty()
	@Length(5, 200)
	@Transform(({ value }) => value?.trim())
	address: string

	@ApiProperty({
		description: 'Postal/ZIP code',
		example: '10001',
		minLength: 3,
		maxLength: 10
	})
	@IsString()
	@IsNotEmpty()
	@Length(3, 10)
	@Matches(/^[A-Za-z0-9\s-]{3,10}$/, {
		message: 'Invalid postal code format'
	})
	@Transform(({ value }) => value?.trim().toUpperCase())
	postalCode: string
}