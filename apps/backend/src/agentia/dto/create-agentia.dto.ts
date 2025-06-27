import { IsString, IsArray, IsBoolean, IsOptional } from 'class-validator';

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

  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;
}
