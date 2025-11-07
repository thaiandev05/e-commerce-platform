import {
  IsString,
  IsOptional,
  IsArray,
  IsEmail,
  IsPhoneNumber,
  IsUrl,
  IsEnum,
  IsNotEmpty,
  Length,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SellerType {
  INDIVIDUAL = 'individual',
  BUSINESS = 'business',
  CORPORATION = 'corporation',
}

export enum BusinessCategory {
  RETAIL = 'retail',
  WHOLESALE = 'wholesale',
  MANUFACTURING = 'manufacturing',
  SERVICES = 'services',
  TECHNOLOGY = 'technology',
  FOOD_BEVERAGE = 'food_beverage',
  FASHION = 'fashion',
  OTHER = 'other',
}

export class AddressDto {
  @ApiProperty({ description: 'Street address' })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'State or province' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ description: 'Postal code' })
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @ApiProperty({ description: 'Country' })
  @IsString()
  @IsNotEmpty()
  country: string;
}

export class BankAccountDto {
  @ApiProperty({ description: 'Bank name' })
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @ApiProperty({ description: 'Account number' })
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ApiProperty({ description: 'Routing number' })
  @IsString()
  @IsNotEmpty()
  routingNumber: string;

  @ApiProperty({ description: 'Account holder name' })
  @IsString()
  @IsNotEmpty()
  accountHolderName: string;
}

export class RegisterSellerDto {
  // Basic Information
  @ApiProperty({
    description: 'Government issued identification number',
    example: '123456789',
  })
  @IsString()
  @IsNotEmpty()
  @Length(5, 20)
  numberIdentify: string;

  @ApiPropertyOptional({
    description: 'Credit card numbers for payment processing',
    type: [String],
    example: ['4111111111111111', '5555555555554444'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Matches(/^\d{13,19}$/, {
    each: true,
    message: 'Invalid credit card number format',
  })
  numberCreditCard?: string[];

  @ApiProperty({
    description: 'Tax identification number',
    example: 'TAX123456789',
  })
  @IsString()
  @IsNotEmpty()
  @Length(5, 15)
  taxNumber: string;

  // Personal/Business Details
  @ApiProperty({ description: 'Full name or business name' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name: string;

  @ApiProperty({ description: 'Email address' })
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiProperty({ description: 'Phone number' })
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({
    description: 'Type of seller',
    enum: SellerType,
    example: SellerType.BUSINESS,
  })
  @IsEnum(SellerType)
  sellerType: SellerType;

  @ApiPropertyOptional({
    description: 'Business category',
    enum: BusinessCategory,
    example: BusinessCategory.RETAIL,
  })
  @IsOptional()
  @IsEnum(BusinessCategory)
  businessCategory?: BusinessCategory;

  // Address Information
  @ApiProperty({
    description: 'Business or personal address',
    type: AddressDto,
  })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiPropertyOptional({
    description: 'Billing address (if different from main address)',
    type: AddressDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  billingAddress?: AddressDto;

  // Business Information (optional for individuals)
  @ApiPropertyOptional({ description: 'Business registration number' })
  @IsOptional()
  @IsString()
  businessRegistrationNumber?: string;

  @ApiPropertyOptional({ description: 'Business license number' })
  @IsOptional()
  @IsString()
  businessLicenseNumber?: string;

  @ApiPropertyOptional({ description: 'Company website URL' })
  @IsOptional()
  @IsUrl()
  websiteUrl?: string;

  @ApiPropertyOptional({ description: 'Business description' })
  @IsOptional()
  @IsString()
  @Length(10, 500)
  businessDescription?: string;

  // Banking Information
  @ApiProperty({
    description: 'Primary bank account for payments',
    type: BankAccountDto,
  })
  @ValidateNested()
  @Type(() => BankAccountDto)
  bankAccount: BankAccountDto;

  @ApiPropertyOptional({
    description: 'Additional bank accounts',
    type: [BankAccountDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BankAccountDto)
  additionalBankAccounts?: BankAccountDto[];

  // Legal and Compliance
  @ApiProperty({
    description: 'Acceptance of terms and conditions',
    example: true,
  })
  @IsNotEmpty()
  acceptTerms: boolean;

  @ApiProperty({
    description: 'Consent to data processing',
    example: true,
  })
  @IsNotEmpty()
  dataProcessingConsent: boolean;

  @ApiPropertyOptional({
    description: 'VAT registration number (for EU sellers)',
  })
  @IsOptional()
  @IsString()
  vatNumber?: string;

  // Store Information
  @ApiProperty({ description: 'Store name' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  storeName: string;

  @ApiPropertyOptional({ description: 'Store description' })
  @IsOptional()
  @IsString()
  @Length(10, 1000)
  storeDescription?: string;

  @ApiPropertyOptional({ description: 'Store logo URL' })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Store banner URL' })
  @IsOptional()
  @IsUrl()
  bannerUrl?: string;

  // Social Media Links
  @ApiPropertyOptional({ description: 'Facebook page URL' })
  @IsOptional()
  @IsUrl()
  facebookUrl?: string;

  @ApiPropertyOptional({ description: 'Instagram profile URL' })
  @IsOptional()
  @IsUrl()
  instagramUrl?: string;

  @ApiPropertyOptional({ description: 'Twitter profile URL' })
  @IsOptional()
  @IsUrl()
  twitterUrl?: string;

  // Additional Information
  @ApiPropertyOptional({
    description: 'Estimated monthly sales volume',
    example: 10000,
  })
  @IsOptional()
  @Type(() => Number)
  estimatedMonthlySales?: number;

  @ApiPropertyOptional({
    description: 'Years in business',
    example: 5,
  })
  @IsOptional()
  @Type(() => Number)
  yearsInBusiness?: number;

  @ApiPropertyOptional({
    description: 'Number of employees',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  numberOfEmployees?: number;

  @ApiPropertyOptional({ description: 'Additional notes or comments' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  notes?: string;
}
