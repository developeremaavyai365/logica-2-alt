import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { existsSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';
import { LOCAL_UPLOADS_DIR, PhotoStorageService } from './photo-storage.service';

// sharp otherwise keeps files it has read open, which on Windows stops the
// test deleting them afterwards.
sharp.cache(false);

const config = (values: Record<string, string | undefined>) => ({ get: (key: string) => values[key] }) as never;
const localStorage = () =>
  new PhotoStorageService(config({ NODE_ENV: 'development', LOCAL_UPLOADS_URL: 'http://localhost:4000/uploads/' }));

const image = (width: number, height: number, format: 'png' | 'jpeg' = 'png') =>
  sharp({ create: { width, height, channels: 3, background: { r: 240, g: 240, b: 240 } } })
    [format]()
    .toBuffer();

describe('product photo uploads', () => {
  const saved: string[] = [];
  afterAll(() => saved.forEach((path) => rmSync(path, { force: true })));

  it('re-encodes a large photo as WebP no bigger than 1600 px, and stores it locally', async () => {
    const result = await localStorage().save(await image(2400, 1200, 'jpeg'));
    expect(result).toMatchObject({ width: 1600, height: 800 });
    expect(result.url).toMatch(/^http:\/\/localhost:4000\/uploads\/products\/\d{4}\/\d{2}\/[0-9a-f-]{36}\.webp$/);

    const path = join(LOCAL_UPLOADS_DIR, result.url.split('/uploads/')[1]);
    saved.push(path);
    expect(existsSync(path)).toBe(true);
    expect((await sharp(readFileSync(path)).metadata()).format).toBe('webp');
  });

  it('keeps a photo that is already small enough at its size', async () => {
    const result = await localStorage().save(await image(800, 600));
    saved.push(join(LOCAL_UPLOADS_DIR, result.url.split('/uploads/')[1]));
    expect(result).toMatchObject({ width: 800, height: 600 });
  });

  it('refuses a photo under 500 pixels on a side, saying its size', async () => {
    await expect(localStorage().save(await image(900, 450))).rejects.toThrow(/900 × 450 pixels/);
  });

  it('refuses a file that is not a photo', async () => {
    await expect(localStorage().save(Buffer.from('<svg onload=alert(1)>'))).rejects.toBeInstanceOf(BadRequestException);
    await expect(localStorage().save(Buffer.from('%PDF-1.7 not an image'))).rejects.toBeInstanceOf(BadRequestException);
  });

  it('is switched off in production until a storage is chosen', async () => {
    const service = new PhotoStorageService(config({ NODE_ENV: 'production' }));
    await expect(service.save(await image(800, 800))).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
