import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

/** Verification/password-reset email transport. Two providers:
 *  - "console" (default, dev): logs the link instead of sending anything.
 *  - "resend": sends for real via the Resend API.
 *  Callers only depend on sendVerificationEmail/sendPasswordResetEmail —
 *  adding another provider later means touching only this file. */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resendClient: Resend | null = null;

  constructor(private readonly config: ConfigService) {
    if (this.config.get<string>('MAIL_PROVIDER') === 'resend') {
      this.resendClient = new Resend(this.config.getOrThrow<string>('RESEND_API_KEY'));
    }
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const link = `${this.frontendUrl()}/verify-email?token=${token}`;
    await this.dispatch({
      to,
      subject: 'Verify your Logica Infoway account',
      html: this.template('Verify your email', 'Confirm your email address to finish creating your account.', link, 'Verify Email'),
      logLabel: 'EMAIL VERIFICATION',
      link,
    });
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const link = `${this.frontendUrl()}/reset-password?token=${token}`;
    await this.dispatch({
      to,
      subject: 'Reset your Logica Infoway password',
      html: this.template('Reset your password', 'This link is valid for 30 minutes and can only be used once.', link, 'Reset Password'),
      logLabel: 'PASSWORD RESET',
      link,
    });
  }

  private frontendUrl(): string {
    return this.config.getOrThrow<string>('FRONTEND_URL');
  }

  private template(heading: string, body: string, link: string, cta: string): string {
    return `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
        <h1 style="font-size: 20px; color: #111;">${heading}</h1>
        <p style="font-size: 14px; color: #555; line-height: 1.6;">${body}</p>
        <a href="${link}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 999px; font-size: 14px; font-weight: 600;">${cta}</a>
        <p style="margin-top: 24px; font-size: 12px; color: #999;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `;
  }

  private async dispatch(args: { to: string; subject: string; html: string; logLabel: string; link: string }): Promise<void> {
    const provider = this.config.get<string>('MAIL_PROVIDER');

    if (provider === 'console') {
      this.logger.warn(`[${args.logLabel}] -> ${args.to}\n  ${args.link}`);
      return;
    }

    if (provider === 'resend') {
      if (!this.resendClient) throw new Error('Resend client not initialized.');
      const result = await this.resendClient.emails.send({
        from: this.config.getOrThrow<string>('MAIL_FROM'),
        to: args.to,
        subject: args.subject,
        html: args.html,
      });
      if (result.error) {
        this.logger.error(`Resend send failed for ${args.logLabel} -> ${args.to}: ${result.error.message}`);
        throw new Error(`Failed to send email: ${result.error.message}`);
      }
      this.logger.log(`[${args.logLabel}] sent -> ${args.to} (id: ${result.data?.id})`);
      return;
    }

    throw new Error(`Mail provider "${provider}" is not implemented yet.`);
  }
}
