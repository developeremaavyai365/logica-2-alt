import { IsIn, IsISO8601, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  /** Date only (YYYY-MM-DD) — stored as a DateTime at midnight UTC, birth
   *  time of day is never meaningful. */
  @IsOptional()
  @IsISO8601({ strict: true })
  dateOfBirth?: string;

  @IsOptional()
  @IsIn(['male', 'female', 'other', 'prefer_not_to_say'])
  gender?: string;
}
