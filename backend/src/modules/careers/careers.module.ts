import { Module } from '@nestjs/common';
import { CareersController } from './careers.controller';
import { MailModule } from '../../mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [CareersController],
})
export class CareersModule {}
