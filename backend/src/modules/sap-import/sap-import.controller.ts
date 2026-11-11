import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import { Throttle } from '@nestjs/throttler';
import { AuthenticatedUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ImportOptionsDto, LinkItemDto, ListItemsDto } from './dto/import-options.dto';
import { SapImportService } from './sap-import.service';

/** Comfortably above a sheet of tens of thousands of products, well below
 *  anything that would strain the server to parse. */
const MAX_SHEET_BYTES = 10 * 1024 * 1024;

const SHEET_UPLOAD = FileInterceptor('file', { limits: { fileSize: MAX_SHEET_BYTES, files: 1 } });

/** The SAP product sheet import. Admins only: the global JwtAuthGuard has
 *  already required a valid login by the time RolesGuard checks the role,
 *  and that role comes from the verified token, never from the request.
 *
 *  Uploading is two steps on purpose — `preview` reports what a sheet would
 *  change and writes nothing; `apply` takes the same sheet again and makes
 *  the changes. */
@Controller('admin/sap-import')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
export class SapImportController {
  constructor(private readonly imports: SapImportService) {}

  @Post('preview')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @UseInterceptors(SHEET_UPLOAD)
  preview(@Body() options: ImportOptionsDto, @UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Attach the SAP sheet as an .xlsx or .csv file.');
    return this.imports.preview(file.buffer, file.originalname, options.mode ?? 'partial');
  }

  @Post('apply')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @UseInterceptors(SHEET_UPLOAD)
  apply(
    @Body() options: ImportOptionsDto,
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Attach the SAP sheet as an .xlsx or .csv file.');
    return this.imports.apply(
      file.buffer,
      file.originalname,
      options.mode ?? 'partial',
      user.id,
      options.confirmLargeRemoval === 'true',
    );
  }

  @Get('history')
  history() {
    return this.imports.history();
  }

  @Get('items')
  items(@Query() query: ListItemsDto) {
    return this.imports.items(query.search, query.page ?? 1, query.pageSize ?? 50, query.linked);
  }

  /** Links a SAP code to a website product (and colour), or unlinks it. */
  @Post('link')
  link(@Body() body: LinkItemDto, @CurrentUser() user: AuthenticatedUser) {
    return this.imports.link(body.sapCode, body.productId, body.colour ?? null, user.id);
  }
}
