import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes, timingSafeEqual } from 'crypto';
import type { NextFunction, Request, Response } from 'express';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/** Double-submit-cookie CSRF protection.
 *
 *  Every response that doesn't already carry a CSRF cookie gets one — a
 *  random token in a NON-httpOnly cookie (it has to be JS-readable so the
 *  frontend can echo it back; it carries no auth power on its own, only
 *  the httpOnly refresh cookie does). On every mutating request, the
 *  caller must send that same value back in the `x-csrf-token` header.
 *  A cross-site attacker can trigger the browser to *send* the cookie
 *  automatically, but can't *read* it to put in the header (that's the
 *  whole mechanism) — so a forged request is missing/wrong on the header
 *  and gets rejected.
 *
 *  Signup and login are exempt: they're not yet riding on an ambient
 *  session cookie (the user is submitting credentials directly), so
 *  there's nothing for a forged cross-site request to exploit there.
 *  Refresh and logout DO ride on the ambient httpOnly refresh cookie and
 *  are exactly the case this exists to protect. */
@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  static readonly COOKIE_NAME = 'logica_csrf';
  static readonly HEADER_NAME = 'x-csrf-token';
  private static readonly EXEMPT_PATHS = new Set(['/auth/signup', '/auth/login']);

  constructor(private readonly config: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    let cookieToken = req.cookies?.[CsrfMiddleware.COOKIE_NAME] as string | undefined;

    if (!cookieToken) {
      cookieToken = randomBytes(32).toString('hex');
      res.cookie(CsrfMiddleware.COOKIE_NAME, cookieToken, {
        httpOnly: false,
        secure: this.config.get('NODE_ENV') === 'production',
        sameSite: 'strict',
        domain: this.config.get<string>('COOKIE_DOMAIN'),
        path: '/',
      });
    }

    const needsCheck = !SAFE_METHODS.has(req.method) && !CsrfMiddleware.EXEMPT_PATHS.has(req.path);

    if (needsCheck) {
      const headerToken = req.get(CsrfMiddleware.HEADER_NAME);
      if (!this.tokensMatch(headerToken, cookieToken)) {
        throw new ForbiddenException('Invalid or missing CSRF token.');
      }
    }

    next();
  }

  private tokensMatch(a: string | undefined, b: string | undefined): boolean {
    if (!a || !b) return false;
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  }
}
