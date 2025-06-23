import { Type, Expose } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  @Expose()
  @Type(() => String)
  email: string;

  @MinLength(12)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,}$/, {
    message:
      'Le mot de passe doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole.',
  })
  @Expose()
  @Type(() => String)
  password: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  @Type(() => String)
  firstname: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  @Type(() => String)
  lastname: string;

  @IsOptional()
  @IsString()
  @Expose({ name: 'phone_number' })
  @Type(() => String)
  phoneNumber?: string;

  @IsBoolean()
  @Expose({ name: 'is_cgu_accepted' })
  @Type(() => Boolean)
  isCguAccepted: boolean;

  @IsBoolean()
  @Expose({ name: 'is_vgcl_accepted' })
  @Type(() => Boolean)
  isVgclAccepted: boolean;
}
