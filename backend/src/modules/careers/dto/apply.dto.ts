import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/** The resume file itself is handled separately via FileInterceptor
 *  (@UploadedFile), not part of this DTO — multer splits a multipart
 *  request into text fields (validated here) and files. */
export class ApplyDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(40)
  phone!: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  role?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;
}
