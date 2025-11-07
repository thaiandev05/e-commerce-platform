import { Type } from 'class-transformer';
import {
  IsArray,
  ValidateNested,
  IsString,
  IsNumber,
  IsPositive,
} from 'class-validator';

export class Items {
  @IsString()
  name: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsNumber()
  @IsPositive()
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Items)
  items: Items[];
}
