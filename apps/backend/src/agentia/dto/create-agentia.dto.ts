import {
  IsString,
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreateAgentiaDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  skills: string[];

  @IsString()
  url: string;

  @IsNumber()
  tarif_unique: number;

  @IsNumber()
  @IsOptional()
  tarif_monthly?: number;

  @IsNumber()
  @IsOptional()
  tarif_annual?: number;

  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;
}
