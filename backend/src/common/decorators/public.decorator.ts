import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Marks a route as not requiring a valid access token. Every route is
 *  protected by default (see JwtAuthGuard as an APP_GUARD) — this is the
 *  explicit, auditable opt-out, so "forgot to add a guard" can never
 *  accidentally leave an endpoint open. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
