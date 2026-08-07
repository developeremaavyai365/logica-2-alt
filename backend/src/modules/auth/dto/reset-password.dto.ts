import { IsString } from 'class-validator';
import { IsStrongPassword } from '../validators/is-strong-password.validator';

export class ResetPasswordDto {
  @IsString()
  token!: string;

  @IsStrongPassword()
  newPassword!: string;
}
