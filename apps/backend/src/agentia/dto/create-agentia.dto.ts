import { IsString, IsNumber, IsArray, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAgentiaDto {
  @IsString() job: string;
  @Type(() => Number)
  @IsNumber() tarif: number;
  @IsArray() @IsString({ each: true }) skills: string[];
  @IsOptional() @IsString() description?: string;
  @IsString() url: string;
  @IsOptional() @IsBoolean() isVisible?: boolean;
} 