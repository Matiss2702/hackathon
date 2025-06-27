import { IsString, IsArray, IsOptional, IsBoolean } from 'class-validator';

export class UpdateAgentiaDto {
  @IsString()
  id: string;

  @IsString() name: string;

  @IsArray() @IsString({ each: true }) skills: string[];
  @IsOptional() @IsString() description?: string;
  @IsString() url: string;
  @IsOptional() @IsBoolean() isVisible?: boolean;
}
