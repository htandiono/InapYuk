import 'dotenv/config';
import { z } from 'zod';

const booleanish = z
  .enum(['true', 'false'])
  .default('false')
  .transform((value) => value === 'true');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(8000),
  API_PREFIX: z.string().startsWith('/').default('/api'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  WEB_BASE_URL: z.string().url().default('http://localhost:3000'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().optional(),

  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  VERIFICATION_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(60),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  PAYMENT_DEADLINE_MINUTES: z.coerce.number().int().positive().default(60),

  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: booleanish,
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  MAIL_FROM_NAME: z.string().default('InapYuk'),
  MAIL_FROM_ADDRESS: z.string().default('no-reply@inapyuk.space'),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  OPENCAGE_API_KEY: z.string().optional(),

  CRON_SECRET: z.string().min(8),
  ENABLE_LOCAL_CRON: booleanish,
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  throw new Error(`Invalid environment configuration:\n${issues}\n\nCopy .env.example to .env.`);
}

export const env = parsed.data;

export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';

/** Cloudinary is optional; without it uploads fall back to local disk. */
export const hasCloudinary = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET,
);

/** SMTP is optional; without it emails are logged to the console instead. */
export const hasSmtp = Boolean(env.SMTP_USER && env.SMTP_PASSWORD);
