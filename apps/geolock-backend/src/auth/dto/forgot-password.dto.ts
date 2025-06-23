import { Type } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail() @Type(() => String) email: string;
}
