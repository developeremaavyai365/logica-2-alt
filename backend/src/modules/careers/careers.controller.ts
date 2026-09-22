import { BadRequestException, Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../common/decorators/public.decorator';
import { MailService } from '../../mail/mail.service';
import { ApplyDto } from './dto/apply.dto';

const MAX_RESUME_BYTES = 8 * 1024 * 1024; // 8MB — comfortably above a real resume, well below anything abusive
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

/** Replaces the earlier Web3Forms integration for this one form: Web3Forms'
 *  free plan rejects any submission carrying a file attachment outright
 *  ("You are trying to use a Pro feature"), discovered only once a real
 *  submission was tried against the live form — this route sends the same
 *  email (including the resume, as a real attachment) through the mail
 *  provider already configured for this backend instead, at no added cost. */
@Controller('careers')
export class CareersController {
  constructor(
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('apply')
  @UseInterceptors(
    FileInterceptor('attachment', {
      limits: { fileSize: MAX_RESUME_BYTES },
      fileFilter: (_req, file, callback) => {
        callback(null, ALLOWED_MIME_TYPES.has(file.mimetype));
      },
    }),
  )
  async apply(@Body() dto: ApplyDto, @UploadedFile() file?: Express.Multer.File): Promise<{ message: string }> {
    if (!file) {
      // Covers both "no file field at all" and fileFilter having silently
      // rejected it (multer's fileFilter signals rejection by passing
      // `false` rather than throwing, so a wrong file type also lands here
      // as "no file" rather than a distinct error) — one message either way
      // is clearer than guessing which case it was.
      throw new BadRequestException('Please attach your resume as a PDF, DOC or DOCX file.');
    }

    // Configurable but not required to be set anywhere — defaults to the
    // address this route exists to reach, so a fresh deploy needs no new
    // environment variable to work correctly out of the box.
    const to = this.config.get<string>('CAREERS_APPLICATION_EMAIL') ?? 'hr@logicainfoway.com';

    await this.mail.sendCareerApplication({
      to,
      applicantName: dto.name,
      applicantEmail: dto.email,
      applicantPhone: dto.phone,
      role: dto.role ?? '',
      message: dto.message ?? '',
      resume: { buffer: file.buffer, filename: file.originalname, contentType: file.mimetype },
    });

    return { message: 'Application received — thank you.' };
  }
}
