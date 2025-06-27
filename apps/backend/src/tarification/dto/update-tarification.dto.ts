import { IsString, IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateTarificationDto {
  @IsString()
  name: string;

  @Type(() => Number)
  @IsNumber()
  price_monthly: number;

  @Type(() => Number)
  @IsNumber()
  price_annually: number;

  @Type(() => Number)
  @IsNumber()
  token: number;

  @IsArray()
  @IsString({ each: true })
  description: string[];

  @Type(() => Number)
  @IsNumber()
  order: number;
}
