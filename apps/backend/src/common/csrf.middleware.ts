import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * CSRF protection middleware using Double Submit Cookie pattern.
 * - Reads CSRF token from cookie (set by /csrf-token endpoint)
 * - Validates it matches the header on state-changing requests
 */
@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  // HTTP methods that require CSRF validation
  private readonly unsafeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

  use(req: Request, res: Response, next: NextFunction) {
    // Only validate state-changing requests
    if (!this.unsafeMethods.has(req.method)) {
      return next();
    }

    // Skip CSRF for auth endpoints (they use different CSRF mechanisms)
    const skipPaths = ['/auth/google', '/auth/google/callback', '/auth/register', '/auth/login'];
    if (skipPaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    const cookieToken = req.cookies?.['XSRF-TOKEN'];
    const headerToken = req.headers['x-csrf-token'] as string;

    if (!cookieToken) {
      throw new BadRequestException('CSRF token missing from cookie');
    }

    if (cookieToken !== headerToken) {
      throw new BadRequestException('CSRF token mismatch');
    }

    next();
  }
}
