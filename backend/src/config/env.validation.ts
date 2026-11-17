import { z } from 'zod';

/** Fail fast at boot if the environment is misconfigured — never start the
 *  app with a missing secret and find out at request time in production. */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),

  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),

  // Either the *_PATH pair (local dev — points at gitignored files
  // produced by `npm run keys:generate`) or the raw-PEM pair (deploy
  // targets with no persistent filesystem to keep those files on) must
  // be provided — checked below in the cross-field refinement.
  JWT_PRIVATE_KEY_PATH: z.string().optional(),
  JWT_PUBLIC_KEY_PATH: z.string().optional(),
  JWT_PRIVATE_KEY: z.string().optional(),
  JWT_PUBLIC_KEY: z.string().optional(),
  JWT_ACCESS_TOKEN_TTL: z.string().default('15m'),
  JWT_REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),

  CORS_ORIGINS: z.string().min(1),

  // Base URL of the frontend — used to build links that go INTO emails
  // (verification, password reset). Not the same thing as CORS_ORIGINS,
  // which lists every origin allowed to call this API; this is the one
  // canonical origin users actually land on when they click an email link.
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),

  REFRESH_COOKIE_NAME: z.string().default('logica_rt'),
  COOKIE_DOMAIN: z.string().default('localhost'),

  MAIL_FROM: z.string().email(),
  MAIL_PROVIDER: z.enum(['console', 'ses', 'resend', 'smtp']).default('console'),
  RESEND_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),

  // ── Checkout ──────────────────────────────────────────────────────────
  // Off until the business is ready to take orders: the shop works as a
  // catalogue and the checkout page says ordering opens soon.
  CHECKOUT_ENABLED: z.enum(['true', 'false']).default('false'),
  // How online payment works. "off": cash on delivery only. "test": a
  // pretend payment page with no real money (refused in production).
  // A real payment company is added here once Logica has an account.
  PAYMENT_MODE: z.enum(['off', 'test']).default('off'),
  COD_ENABLED: z.enum(['true', 'false']).default('true'),
  // Orders above this total cannot be paid cash on delivery.
  COD_MAX_RUPEES: z.coerce.number().int().nonnegative().default(50_000),
  // Delivery charge per order. 0 = free delivery.
  SHIPPING_FEE_RUPEES: z.coerce.number().int().nonnegative().default(0),

  // ── Orders ────────────────────────────────────────────────────────────
  // Who is emailed about every new order (the warehouse), comma-separated.
  // Unset: no one is emailed; new orders still show on the admin Orders page.
  ORDER_ALERT_EMAILS: z.string().optional(),
  // The seller on GST invoices. The GSTIN decides the seller's state, and
  // so whether an invoice charges CGST + SGST or IGST. Use the GSTIN of the
  // place the goods are sent from.
  SELLER_NAME: z.string().default('Logica Infoway Limited'),
  SELLER_GSTIN: z.string().default('19AABCE0772B1Z1'),
  SELLER_ADDRESS: z.string().default('2 Saklat Place, 1st Floor, Kolkata, West Bengal 700072'),

  // ── Product photos (admin listing form) ──────────────────────────────
  // Where uploaded photos are kept. "local": the backend's own uploads/
  // folder, served at LOCAL_UPLOADS_URL — for development, as a server's
  // disk is usually wiped on redeploy. "s3": an S3-compatible bucket
  // (Amazon S3 or Cloudflare R2). Unset in production: uploads are off.
  PHOTO_STORAGE: z.enum(['local', 's3']).optional(),
  LOCAL_UPLOADS_URL: z.string().url().default('http://localhost:4000/uploads'),
  // For Cloudflare R2: https://<account id>.r2.cloudflarestorage.com, region "auto".
  S3_ENDPOINT: z.string().url().optional(),
  S3_REGION: z.string().default('auto'),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  // The public address the bucket's files are read from (a custom domain or
  // the bucket's public URL), without a trailing slash.
  S3_PUBLIC_URL: z.string().url().optional(),

  ARGON2_MEMORY_COST: z.coerce.number().int().positive().default(19456),
  ARGON2_TIME_COST: z.coerce.number().int().positive().default(2),
  ARGON2_PARALLELISM: z.coerce.number().int().positive().default(1),
});

const envSchemaWithCrossFieldChecks = envSchema.superRefine((data, ctx) => {
  if (data.MAIL_PROVIDER === 'resend' && !data.RESEND_API_KEY) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['RESEND_API_KEY'],
      message: 'RESEND_API_KEY is required when MAIL_PROVIDER=resend.',
    });
  }

  if (data.MAIL_PROVIDER === 'smtp' && !(data.SMTP_HOST && data.SMTP_USER && data.SMTP_PASSWORD)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['SMTP_HOST'],
      message: 'SMTP_HOST, SMTP_USER, and SMTP_PASSWORD are required when MAIL_PROVIDER=smtp.',
    });
  }

  if (data.NODE_ENV === 'production' && data.PAYMENT_MODE === 'test') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['PAYMENT_MODE'],
      message: 'PAYMENT_MODE=test takes pretend payments and must never run in production.',
    });
  }

  if (data.PHOTO_STORAGE === 's3' && !(data.S3_BUCKET && data.S3_ACCESS_KEY_ID && data.S3_SECRET_ACCESS_KEY && data.S3_PUBLIC_URL)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['S3_BUCKET'],
      message: 'S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY and S3_PUBLIC_URL are required when PHOTO_STORAGE=s3.',
    });
  }

  const hasKeyFiles = Boolean(data.JWT_PRIVATE_KEY_PATH && data.JWT_PUBLIC_KEY_PATH);
  const hasKeyEnvVars = Boolean(data.JWT_PRIVATE_KEY && data.JWT_PUBLIC_KEY);
  if (!hasKeyFiles && !hasKeyEnvVars) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['JWT_PRIVATE_KEY'],
      message:
        'Provide either JWT_PRIVATE_KEY_PATH + JWT_PUBLIC_KEY_PATH (local dev) or JWT_PRIVATE_KEY + JWT_PUBLIC_KEY (raw PEM content, for deploy targets without a persistent filesystem).',
    });
  }
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const parsed = envSchemaWithCrossFieldChecks.safeParse(config);
  if (!parsed.success) {
    throw new Error(`Invalid environment configuration:\n${parsed.error.toString()}`);
  }
  return parsed.data;
}
