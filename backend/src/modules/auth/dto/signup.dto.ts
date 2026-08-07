import { IsEmail, IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';
import { IsStrongPassword } from '../validators/is-strong-password.validator';

export class SignupDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @ValidateIf((o: SignupDto) => !o.phone)
  @IsEmail()
  email?: string;

  @ValidateIf((o: SignupDto) => !o.email)
  @IsString()
  phone?: string;

  @IsStrongPassword()
  password!: string;
}
