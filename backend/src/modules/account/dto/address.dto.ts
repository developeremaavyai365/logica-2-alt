import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ADDRESS_LABELS, INDIAN_STATES } from '../indian-states';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
/** "+91 98765 43210", "098765-43210" → "9876543210". */
const mobile = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.replace(/[\s-]/g, '').replace(/^(\+91|0)/, '') : value;

export class AddressDto {
  @Transform(trim)
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  fullName!: string;

  @Transform(mobile)
  @Matches(/^[6-9]\d{9}$/, { message: 'Enter a 10-digit Indian mobile number.' })
  phone!: string;

  @Transform(trim)
  @Matches(/^[1-9]\d{5}$/, { message: 'Enter a 6-digit PIN code.' })
  postalCode!: string;

  /** Flat, house no., building. */
  @Transform(trim)
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  line1!: string;

  /** Area, street, sector, village. */
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  line2?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(80)
  landmark?: string;

  @Transform(trim)
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  city!: string;

  @IsIn(INDIAN_STATES, { message: 'Choose a state from the list.' })
  state!: string;

  @IsIn(ADDRESS_LABELS)
  label!: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
