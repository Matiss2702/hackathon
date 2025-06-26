import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAgentiaDto {
  @IsString()
  id: string;

  @IsString() name: string;

  @Type(() => Number)
  @IsNumber()
  tarif_unique: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tarif_monthly: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tarif_annual: number;

  @IsArray() @IsString({ each: true }) skills: string[];
  @IsOptional() @IsString() description?: string;
  @IsString() url: string;
  @IsOptional() @IsBoolean() isVisible?: boolean;
}
