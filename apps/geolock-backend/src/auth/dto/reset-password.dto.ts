import { Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  // 12+ caractères avec maj, min, chiffre, symbole
  @MinLength(12)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,}$/)
  oldPassword: string;

  // 12+ caractères avec maj, min, chiffre, symbole
  @MinLength(12)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,}$/)
  newPassword: string;

  // 12+ caractères avec maj, min, chiffre, symbole
  @MinLength(12)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,}$/)
  confirmPassword: string;

  @MinLength(1)
  token: string;
}
