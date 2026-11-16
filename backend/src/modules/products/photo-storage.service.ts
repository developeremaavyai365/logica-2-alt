import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import sharp from 'sharp';

/** Photos are at least this many pixels on each side… */
export const MIN_PHOTO_SIDE = 500;
/** …and are stored no larger than this, which is plenty for a zoomed
 *  product photo on a large screen. */
const MAX_STORED_SIDE = 1600;

/** The folder local uploads go to, served at /uploads (see main.ts). */
export const LOCAL_UPLOADS_DIR = join(process.cwd(), 'uploads');

export type PhotoStorageMode = 'local' | 's3';

/** Which storage the environment asks for: PHOTO_STORAGE when set, the
 *  local folder in development, and nothing (uploads off) in production. */
export function photoStorageMode(config: ConfigService): PhotoStorageMode | null {
  const set = config.get<string>('PHOTO_STORAGE');
  if (set === 'local' || set === 's3') return set;
  return config.get('NODE_ENV') === 'production' ? null : 'local';
}

/** Checks, resizes and stores uploaded product photos. Every photo is
 *  re-encoded as WebP: that drops anything hidden in the original file
 *  (camera data, scripts in a disguised file) and keeps pages light. */
@Injectable()
export class PhotoStorageService {
  private readonly mode: PhotoStorageMode | null;
  private readonly s3: S3Client | null;

  constructor(private readonly config: ConfigService) {
    this.mode = photoStorageMode(config);
    this.s3 =
      this.mode === 's3'
        ? new S3Client({
            region: config.get('S3_REGION'),
            endpoint: config.get('S3_ENDPOINT') || undefined,
            credentials: { accessKeyId: config.get('S3_ACCESS_KEY_ID')!, secretAccessKey: config.get('S3_SECRET_ACCESS_KEY')! },
          })
        : null;
  }

  async save(file: Buffer): Promise<{ url: string; width: number; height: number }> {
    if (!this.mode) {
      throw new ServiceUnavailableException('Photo uploads are not set up on this server yet (PHOTO_STORAGE).');
    }

    let meta: sharp.Metadata;
    try {
      meta = await sharp(file).metadata();
    } catch {
      throw new BadRequestException('This file is not a photo we can read. Upload a JPG, PNG or WebP.');
    }
    if (!meta.format || !['jpeg', 'png', 'webp'].includes(meta.format)) {
      throw new BadRequestException('Upload a JPG, PNG or WebP photo.');
    }
    // Width and height as shown, after the camera's rotation.
    const [w, h] = (meta.orientation ?? 1) >= 5 ? [meta.height ?? 0, meta.width ?? 0] : [meta.width ?? 0, meta.height ?? 0];
    if (w < MIN_PHOTO_SIDE || h < MIN_PHOTO_SIDE) {
      throw new BadRequestException(`This photo is ${w} × ${h} pixels. Use one at least ${MIN_PHOTO_SIDE} × ${MIN_PHOTO_SIDE}, so it stays sharp when zoomed.`);
    }

    const { data, info } = await sharp(file)
      .rotate()
      .resize({ width: MAX_STORED_SIDE, height: MAX_STORED_SIDE, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer({ resolveWithObject: true });

    const now = new Date();
    const key = `products/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${randomUUID()}.webp`;

    if (this.mode === 'local') {
      const path = join(LOCAL_UPLOADS_DIR, key);
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, data);
      return { url: `${this.config.get<string>('LOCAL_UPLOADS_URL')!.replace(/\/+$/, '')}/${key}`, width: info.width, height: info.height };
    }

    await this.s3!.send(
      new PutObjectCommand({
        Bucket: this.config.get('S3_BUCKET'),
        Key: key,
        Body: data,
        ContentType: 'image/webp',
        // The name is unique per upload, so the file never changes.
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );
    return { url: `${this.config.get<string>('S3_PUBLIC_URL')!.replace(/\/+$/, '')}/${key}`, width: info.width, height: info.height };
  }
}
