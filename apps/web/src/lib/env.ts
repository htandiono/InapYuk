function required(name: string, value: string | undefined, fallback: string): string {
  if (!value) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing environment variable ${name}`);
    }
    return fallback;
  }
  return value;
}

export const clientEnv = {
  apiBaseUrl: required(
    'NEXT_PUBLIC_API_BASE_URL',
    process.env.NEXT_PUBLIC_API_BASE_URL,
    'http://localhost:8000/api',
  ),
  siteUrl: required(
    'NEXT_PUBLIC_SITE_URL',
    process.env.NEXT_PUBLIC_SITE_URL,
    'http://localhost:3000',
  ),
};
