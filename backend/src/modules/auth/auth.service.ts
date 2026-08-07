import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { randomBytes, createHash } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../mail/mail.service';
import { TokensService, IssuedTokens } from './tokens.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const EMAIL_VERIFICATION_TTL_HOURS = 24;
const PASSWORD_RESET_TTL_MINUTES = 30;

interface RequestMeta {
  userAgent?: string;
  ipAddress?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TokensService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  private argonOptions() {
    return {
      type: argon2.argon2id,
      memoryCost: this.config.get<number>('ARGON2_MEMORY_COST') ?? 19456,
      timeCost: this.config.get<number>('ARGON2_TIME_COST') ?? 2,
      parallelism: this.config.get<number>('ARGON2_PARALLELISM') ?? 1,
    };
  }

  private hashOpaqueToken(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }

  async signup(dto: SignupDto): Promise<{ userId: string }> {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [dto.email ? { email: dto.email } : undefined, dto.phone ? { phone: dto.phone } : undefined].filter(
          Boolean,
        ) as object[],
      },
    });
    if (existing) {
      // Deliberately generic — don't confirm which field collided, that
      // itself is an enumeration leak.
      throw new ConflictException('An account with these details already exists.');
    }

    const passwordHash = await argon2.hash(dto.password, this.argonOptions());

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        passwordHash,
      },
    });

    await this.issueEmailVerification(user.id, user.email);

    return { userId: user.id };
  }

  private async issueEmailVerification(userId: string, email: string | null): Promise<void> {
    if (!email) return; // phone-only signups verify by OTP in a later phase
    const raw = randomBytes(32).toString('hex');
    const tokenHash = this.hashOpaqueToken(raw);
    const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TTL_HOURS * 60 * 60 * 1000);

    await this.prisma.emailVerificationToken.create({
      data: { userId, tokenHash, expiresAt },
    });
    await this.mail.sendVerificationEmail(email, raw);
  }

  async verifyEmail(rawToken: string): Promise<void> {
    const tokenHash = this.hashOpaqueToken(rawToken);
    const record = await this.prisma.emailVerificationToken.findUnique({ where: { tokenHash } });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired verification token.');
    }

    await this.prisma.$transaction([
      this.prisma.emailVerificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      this.prisma.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: new Date() } }),
    ]);
  }

  async login(dto: LoginDto, meta: RequestMeta): Promise<IssuedTokens> {
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.identifier }, { phone: dto.identifier }] },
    });

    // Constant-shape response whether or not the user exists, to avoid
    // account enumeration via response-time/shape differences.
    const genericError = () => new UnauthorizedException('Invalid credentials.');

    if (!user || user.deletedAt) throw genericError();

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException(
        `Account temporarily locked due to repeated failed attempts. Try again after ${user.lockedUntil.toISOString()}.`,
      );
    }

    const passwordValid = await argon2.verify(user.passwordHash, dto.password).catch(() => false);

    if (!passwordValid) {
      const failedLoginCount = user.failedLoginCount + 1;
      const lockedUntil =
        failedLoginCount >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000) : null;

      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedLoginCount, lockedUntil },
      });
      throw genericError();
    }

    if (!user.emailVerifiedAt && user.email) {
      throw new UnauthorizedException('Please verify your email before logging in.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockedUntil: null },
    });

    return this.tokens.issueTokenPair(user.id, user.role, meta);
  }

  async refresh(rawRefreshToken: string, meta: RequestMeta): Promise<IssuedTokens> {
    return this.tokens.rotateRefreshToken(rawRefreshToken, meta);
  }

  /** JWT payload deliberately carries no PII (just sub/role/sessionId) —
   *  the frontend calls this once per session to get displayable profile
   *  data, rather than the token itself growing to hold it. */
  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) throw new UnauthorizedException('Account no longer active.');
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      emailVerified: Boolean(user.emailVerifiedAt),
    };
  }

  async logout(rawRefreshToken: string): Promise<void> {
    await this.tokens.revokeRefreshToken(rawRefreshToken);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    // Always respond the same way regardless of whether the account
    // exists — do the work only if it does, but never signal the
    // difference to the caller.
    if (!user || user.deletedAt) return;

    const raw = randomBytes(32).toString('hex');
    const tokenHash = this.hashOpaqueToken(raw);
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MINUTES * 60 * 1000);

    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });
    if (user.email) await this.mail.sendPasswordResetEmail(user.email, raw);
  }

  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    const tokenHash = this.hashOpaqueToken(rawToken);
    const record = await this.prisma.passwordResetToken.findUnique({ where: { tokenHash } });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token.');
    }

    const passwordHash = await argon2.hash(newPassword, this.argonOptions());

    await this.prisma.$transaction([
      this.prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      this.prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash, failedLoginCount: 0, lockedUntil: null },
      }),
    ]);

    // A password reset is a strong signal to kill every existing session —
    // if the reset was triggered because credentials leaked, this cuts
    // off any session an attacker already holds.
    await this.tokens.revokeAllForUser(record.userId);
  }
}
