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
