import { IsString, MaxLength } from 'class-validator';
import { IsStrongPassword } from '../validators/is-strong-password.validator';

export class ChangePasswordDto {
  @IsString()
  @MaxLength(200)
  currentPassword!: string;

  @IsStrongPassword()
  newPassword!: string;
}
