import { Type } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail() @Type(() => String) email: string;
  @IsString() @MinLength(12) password: string;
}
