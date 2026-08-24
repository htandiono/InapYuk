import crypto from 'node:crypto';
import { env } from '../../config/env';

/**
 * Creates a raw token string and its SHA-256 hash.
 * The raw token is sent to the user; the hash is stored in the DB.
 */
export function createTokenData() {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + env.VERIFICATION_TOKEN_TTL_MINUTES * 60 * 1000);
  return { rawToken, tokenHash, expiresAt };
}
