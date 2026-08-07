import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { IssuedTokens } from './tokens.service';

/** Auth endpoints are the most attacked surface on any e-commerce backend
 *  — every one of these carries a tighter throttle than the app-wide
 *  default (configured in AppModule), on top of the account-lockout
 *  logic in AuthService for login specifically. */
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  private cookieName(): string {
    return this.config.get<string>('REFRESH_COOKIE_NAME') ?? 'logica_rt';
  }

  private setRefreshCookie(res: Response, tokens: IssuedTokens): void {
    res.cookie(this.cookieName(), tokens.refreshToken, {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      domain: this.config.get<string>('COOKIE_DOMAIN'),
      path: '/auth',
      expires: tokens.refreshTokenExpiresAt,
    });
  }

  private meta(req: Request) {
    return { userAgent: req.get('user-agent') ?? undefined, ipAddress: req.ip };
  }

  /** The CSRF middleware sets the cookie on any request that lacks one,
   *  but the frontend should hit this explicitly on app load so the
   *  cookie is guaranteed to exist before the user submits anything. */
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Get('csrf')
  async bootstrapCsrf() {
    return;
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    const result = await this.auth.signup(dto);
    return { message: 'Account created. Check your email to verify your account.', userId: result.userId };
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    await this.auth.verifyEmail(dto.token);
    return { message: 'Email verified.' };
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.auth.login(dto, this.meta(req));
    this.setRefreshCookie(res, tokens);
    return { accessToken: tokens.accessToken };
  }

  @Public()
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = req.cookies?.[this.cookieName()];
    if (!raw) throw new UnauthorizedException('No refresh token provided.');

    const tokens = await this.auth.refresh(raw, this.meta(req));
    this.setRefreshCookie(res, tokens);
    return { accessToken: tokens.accessToken };
  }

  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser) {
    return this.auth.me(user.id);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = req.cookies?.[this.cookieName()];
    if (raw) await this.auth.logout(raw);
    res.clearCookie(this.cookieName(), { path: '/auth' });
    return { message: 'Logged out.' };
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.auth.forgotPassword(dto.email);
    return { message: 'If that email is registered, a reset link has been sent.' };
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.auth.resetPassword(dto.token, dto.newPassword);
    return { message: 'Password reset. Please log in again.' };
  }
}
