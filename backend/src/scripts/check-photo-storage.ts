/* Checks the photo bucket end to end, as the admin form uses it: uploads a
   test photo through the same code, loads it back from its public address,
   then deletes it. Nothing is left in the bucket.

   Locally (reads backend/.env):   npm run check:photos
   On the server (its own settings): node dist/scripts/check-photo-storage.js

   Prints no keys, only which settings are present. */

import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { existsSync } from 'fs';
import sharp from 'sharp';
import { PhotoStorageService, photoStorageMode, s3ClientFor } from '../modules/products/photo-storage.service';

if (existsSync('.env')) process.loadEnvFile('.env');

const settings = { get: <T = string>(key: string) => process.env[key] as T | undefined };

function fail(message: string, hint?: string): never {
  console.error(`\n✗ ${message}`);
  if (hint) console.error(`  ${hint}`);
  process.exit(1);
}

/** What a storage error most likely means, in plain words. */
function hintFor(err: unknown): string | undefined {
  const name = (err as { name?: string; Code?: string })?.name ?? '';
  const text = `${name} ${(err as Error)?.message ?? ''}`;
  if (/NoSuchBucket/i.test(text)) return 'No bucket with this name: check S3_BUCKET against the bucket name in Cloudflare.';
  if (/InvalidAccessKeyId|SignatureDoesNotMatch|Unauthorized/i.test(text))
    return 'The access key was refused: check S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY (copy them again from the R2 API token page).';
  if (/AccessDenied|Forbidden/i.test(text)) return 'The key cannot write to this bucket: give the R2 API token "Object Read & Write" on it.';
  if (/ENOTFOUND|getaddrinfo|EAI_AGAIN/i.test(text)) return 'Could not reach the storage: check S3_ENDPOINT (https://<account id>.r2.cloudflarestorage.com).';
  if (/checksum|NotImplemented/i.test(text)) return 'The storage refused the upload checksum settings: please send this output to the developer.';
  return undefined;
}

async function main() {
  const required = ['S3_ENDPOINT', 'S3_BUCKET', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY', 'S3_PUBLIC_URL'];
  console.log('Photo storage settings:');
  console.log(`  PHOTO_STORAGE        ${process.env.PHOTO_STORAGE || '(not set)'}`);
  for (const key of required) {
    const value = process.env[key];
    // Addresses and the bucket name are shown; keys only as present or not.
    const shown = !value ? '(not set)' : /KEY/.test(key) ? `set (${value.length} characters)` : value;
    console.log(`  ${key.padEnd(20)} ${shown}`);
  }
  if (photoStorageMode(settings) !== 's3') fail('PHOTO_STORAGE is not s3.', 'Set PHOTO_STORAGE=s3 to store photos in the bucket.');
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) fail(`Missing: ${missing.join(', ')}.`);

  const photo = await sharp({ create: { width: 800, height: 800, channels: 3, background: { r: 61, g: 79, b: 224 } } })
    .png()
    .toBuffer();

  console.log('\n1. Uploading a test photo…');
  let url: string;
  try {
    ({ url } = await new PhotoStorageService(settings as never).save(photo));
  } catch (err) {
    fail(`Upload failed: ${(err as Error).message}`, hintFor(err));
  }
  console.log(`   ✓ uploaded: ${url}`);

  const key = url.slice(process.env.S3_PUBLIC_URL!.replace(/\/+$/, '').length + 1);
  const cleanUp = async () => {
    try {
      await s3ClientFor(settings).send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }));
      console.log('3. ✓ test photo deleted from the bucket');
    } catch (err) {
      console.error(`3. ✗ could not delete the test photo (${(err as Error).message}). Delete ${key} from the bucket by hand.`);
    }
  };

  console.log('2. Loading it from its public address…');
  let res: Response;
  try {
    res = await fetch(url);
  } catch (err) {
    await cleanUp();
    fail(`Could not reach ${url}: ${(err as Error).message}`, 'Check S3_PUBLIC_URL: the bucket\'s public address (r2.dev or your own subdomain).');
  }
  const body = Buffer.from(await res.arrayBuffer());
  const type = res.headers.get('content-type');
  if (!res.ok) {
    await cleanUp();
    fail(
      `The public address answered ${res.status}.`,
      res.status === 401 || res.status === 403
        ? 'Public access is off: in the bucket\'s Settings, turn on the r2.dev address or connect a custom domain.'
        : 'Check S3_PUBLIC_URL is the bucket\'s public address.',
    );
  }
  const meta = await sharp(body).metadata().catch(() => null);
  if (type !== 'image/webp' || meta?.format !== 'webp') {
    await cleanUp();
    fail(`The public address did not return the photo (content type ${type}).`, 'Check S3_PUBLIC_URL points at this bucket.');
  }
  console.log(`   ✓ loads as image/webp, ${meta.width} × ${meta.height}, cache: ${res.headers.get('cache-control') ?? 'none'}`);

  await cleanUp();
  console.log('\nPhoto uploads work with this bucket.');
}

void main();
