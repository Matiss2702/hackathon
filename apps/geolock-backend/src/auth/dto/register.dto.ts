import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail() @Type(() => String) email: string;

  // 12+ caractères avec maj, min, chiffre, symbole
  @MinLength(12)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,}$/)
  password: string;

  @IsString() firstname: string;
  @IsString() lastname: string;
  @IsOptional() @IsString() phone_number?: string;

  @IsBoolean() is_cgu_accepted: boolean;
  @IsBoolean() is_vgcl_accepted: boolean;
  @IsOptional() @IsString() entity_id?: string;
}
