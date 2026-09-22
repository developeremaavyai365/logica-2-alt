import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import nodemailer, { Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

/** Verification/password-reset email transport. Three providers:
 *  - "console" (default, dev): logs the link instead of sending anything.
 *  - "resend": sends for real via the Resend API.
 *  - "smtp": sends via a generic SMTP relay (e.g. Google Workspace with an
 *    app password) — no domain verification needed since it rides on a
 *    mailbox that's already trusted.
 *  Callers only depend on sendVerificationEmail/sendPasswordResetEmail —
 *  adding another provider later means touching only this file. */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resendClient: Resend | null = null;
  private smtpTransport: Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    if (this.config.get<string>('MAIL_PROVIDER') === 'resend') {
      this.resendClient = new Resend(this.config.getOrThrow<string>('RESEND_API_KEY'));
    }
    if (this.config.get<string>('MAIL_PROVIDER') === 'smtp') {
      this.smtpTransport = nodemailer.createTransport({
        host: this.config.getOrThrow<string>('SMTP_HOST'),
        port: this.config.get<number>('SMTP_PORT') ?? 587,
        secure: this.config.get<number>('SMTP_PORT') === 465,
        // Railway's network doesn't route outbound IPv6, but Node's default
        // DNS resolution can still hand back an AAAA record first for hosts
        // like smtp.gmail.com, causing ENETUNREACH. Force IPv4 explicitly
        // rather than relying on DNS resolution order. (nodemailer forwards
        // this straight to Node's net/tls connect, which supports it — the
        // @types/nodemailer definitions just don't declare the field.)
        family: 4,
        auth: {
          user: this.config.getOrThrow<string>('SMTP_USER'),
          pass: this.config.getOrThrow<string>('SMTP_PASSWORD'),
        },
      } as SMTPTransport.Options);
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

  /** Career application emails — a different shape from the transactional
   *  auth emails above (no magic link, an attachment instead), so this goes
   *  through its own send path rather than being forced into `dispatch`'s
   *  signature. Same three providers, same "console logs instead of
   *  sending" dev behaviour. */
  async sendCareerApplication(args: {
    to: string;
    applicantName: string;
    applicantEmail: string;
    applicantPhone: string;
    role: string;
    message: string;
    resume: { buffer: Buffer; filename: string; contentType: string };
  }): Promise<void> {
    const subject = args.role
      ? `Career application: ${args.role} — ${args.applicantName}`
      : `Career application — ${args.applicantName}`;

    const html = `
      <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
        <h1 style="font-size: 20px; color: #111;">New career application</h1>
        <table style="font-size: 14px; color: #333; line-height: 1.8; margin-top: 12px;">
          <tr><td style="color:#888; padding-right:16px;">Name</td><td>${this.escapeHtml(args.applicantName)}</td></tr>
          <tr><td style="color:#888; padding-right:16px;">Email</td><td>${this.escapeHtml(args.applicantEmail)}</td></tr>
          <tr><td style="color:#888; padding-right:16px;">Phone</td><td>${this.escapeHtml(args.applicantPhone)}</td></tr>
          <tr><td style="color:#888; padding-right:16px;">Role</td><td>${this.escapeHtml(args.role || 'General application')}</td></tr>
        </table>
        ${args.message ? `<p style="font-size: 14px; color: #555; line-height: 1.6; margin-top: 20px; white-space: pre-wrap;">${this.escapeHtml(args.message)}</p>` : ''}
        <p style="margin-top: 24px; font-size: 12px; color: #999;">Resume attached — ${this.escapeHtml(args.resume.filename)}.</p>
      </div>
    `;

    const provider = this.config.get<string>('MAIL_PROVIDER');

    if (provider === 'console') {
      this.logger.warn(
        `[CAREER APPLICATION] -> ${args.to}\n  ${args.applicantName} <${args.applicantEmail}> ${args.applicantPhone}\n` +
          `  Role: ${args.role || '(general)'}\n  Resume: ${args.resume.filename} (${args.resume.buffer.length} bytes, not sent — console provider)`,
      );
      return;
    }

    if (provider === 'resend') {
      if (!this.resendClient) throw new Error('Resend client not initialized.');
      const result = await this.resendClient.emails.send({
        from: this.config.getOrThrow<string>('MAIL_FROM'),
        to: args.to,
        replyTo: args.applicantEmail,
        subject,
        html,
        attachments: [
          {
            filename: args.resume.filename,
            content: args.resume.buffer,
            contentType: args.resume.contentType,
          },
        ],
      });
      if (result.error) {
        this.logger.error(`Resend send failed for CAREER APPLICATION -> ${args.to}: ${result.error.message}`);
        throw new Error(`Failed to send email: ${result.error.message}`);
      }
      this.logger.log(`[CAREER APPLICATION] sent -> ${args.to} (id: ${result.data?.id})`);
      return;
    }

    if (provider === 'smtp') {
      if (!this.smtpTransport) throw new Error('SMTP transport not initialized.');
      try {
        const info = await this.smtpTransport.sendMail({
          from: this.config.getOrThrow<string>('MAIL_FROM'),
          to: args.to,
          replyTo: args.applicantEmail,
          subject,
          html,
          attachments: [
            {
              filename: args.resume.filename,
              content: args.resume.buffer,
              contentType: args.resume.contentType,
            },
          ],
        });
        this.logger.log(`[CAREER APPLICATION] sent -> ${args.to} (id: ${info.messageId})`);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(`SMTP send failed for CAREER APPLICATION -> ${args.to}: ${message}`);
        throw new Error(`Failed to send email: ${message}`);
      }
      return;
    }

    throw new Error(`Mail provider "${provider}" is not implemented yet.`);
  }

  /** Applicant-supplied fields ride straight into an HTML email body — never
   *  trust them as markup. Minimal, dependency-free escaping rather than
   *  pulling in a library for four characters. */
  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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

    if (provider === 'smtp') {
      if (!this.smtpTransport) throw new Error('SMTP transport not initialized.');
      try {
        const info = await this.smtpTransport.sendMail({
          from: this.config.getOrThrow<string>('MAIL_FROM'),
          to: args.to,
          subject: args.subject,
          html: args.html,
        });
        this.logger.log(`[${args.logLabel}] sent -> ${args.to} (id: ${info.messageId})`);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(`SMTP send failed for ${args.logLabel} -> ${args.to}: ${message}`);
        throw new Error(`Failed to send email: ${message}`);
      }
      return;
    }

    throw new Error(`Mail provider "${provider}" is not implemented yet.`);
  }
}
