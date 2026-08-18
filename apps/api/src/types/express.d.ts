import type { JwtPayload } from '@inapyuk/types';

declare global {
  namespace Express {
    interface Request {
      /** Set by authenticate(); present on every guarded route. */
      user?: JwtPayload;
      /** Set by requireTenant(); the caller's TenantProfile id. */
      tenantId?: string;
    }
  }
}

export {};
