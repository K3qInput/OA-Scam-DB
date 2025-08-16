import { Request, Response, NextFunction } from 'express';
import { IStorage } from '../storage';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  keyGenerator?: (req: Request) => string;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export class RateLimitMiddleware {
  private storage: IStorage;
  private limits: Map<string, RateLimitRecord> = new Map();

  constructor(storage: IStorage) {
    this.storage = storage;

    // Clean up expired entries every 5 minutes
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of Array.from(this.limits.entries())) {
      if (now > record.resetTime) {
        this.limits.delete(key);
      }
    }
  }

  private getKey(req: Request, keyGenerator?: (req: Request) => string): string {
    if (keyGenerator) {
      return keyGenerator(req);
    }

    // Default key: IP + User ID (if authenticated) + Route
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const userId = (req as any).user?.id || 'anonymous';
    const route = req.route?.path || req.path;

    return `${ip}:${userId}:${route}`;
  }

  public createLimiter(options: RateLimitOptions) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const key = this.getKey(req, options.keyGenerator);
        const now = Date.now();

        let record = this.limits.get(key);

        if (!record || now > record.resetTime) {
          // Create new record
          record = {
            count: 1,
            resetTime: now + options.windowMs
          };
          this.limits.set(key, record);

          // Log rate limit event for beta testing analysis
          await this.storage.createSecurityEvent?.({
            eventType: 'rate_limit_reset',
            severity: 'low',
            userId: (req as any).user?.id || null,
            ipAddress: req.ip || req.connection?.remoteAddress || 'unknown',
            userAgent: req.get('User-Agent') || 'unknown',
            details: {
              key,
              route: req.route?.path || req.path,
              method: req.method,
              newWindow: true
            },
            resolved: true
          });

          return next();
        }

        if (record.count >= options.max) {
          // Rate limit exceeded
          await this.storage.createSecurityEvent?.({
            eventType: 'rate_limit_exceeded',
            severity: 'medium',
            userId: (req as any).user?.id || null,
            ipAddress: req.ip || req.connection?.remoteAddress || 'unknown',
            userAgent: req.get('User-Agent') || 'unknown',
            details: {
              key,
              route: req.route?.path || req.path,
              method: req.method,
              count: record.count,
              limit: options.max,
              resetTime: record.resetTime,
              timeUntilReset: record.resetTime - now
            },
            resolved: false
          });

          res.status(429).json({
            message: options.message || 'Too many requests, please try again later',
            retryAfter: Math.ceil((record.resetTime - now) / 1000),
            limit: options.max,
            remaining: 0,
            reset: new Date(record.resetTime).toISOString()
          });
          return;
        }

        // Increment count
        record.count++;
        this.limits.set(key, record);

        // Set rate limit headers
        res.set({
          'X-RateLimit-Limit': options.max.toString(),
          'X-RateLimit-Remaining': (options.max - record.count).toString(),
          'X-RateLimit-Reset': new Date(record.resetTime).toISOString()
        });

        next();
      } catch (error) {
        console.error('Rate limiting error:', error);
        // Don't block request if rate limiting fails
        next();
      }
    };
  }

  // Beta testing: Get rate limiting statistics
  public getStats(): { key: string; count: number; resetTime: number }[] {
    const stats: { key: string; count: number; resetTime: number }[] = [];

    for (const [key, record] of Array.from(this.limits.entries())) {
      stats.push({
        key,
        count: record.count,
        resetTime: record.resetTime
      });
    }

    return stats.sort((a, b) => b.count - a.count);
  }

  // Beta testing: Clear all rate limits (admin only)
  public clearAllLimits(): void {
    this.limits.clear();
  }

  // Beta testing: Clear specific rate limit
  public clearLimit(key: string): boolean {
    return this.limits.delete(key);
  }
}

// Common rate limiting configurations for beta testing
export const rateLimitConfigs = {
  // Authentication endpoints - more lenient for development
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 50 requests per windowMs (increased for development)
    message: "Too many authentication attempts, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
  },

  // API rate limiting for general use
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    message: 'API rate limit exceeded, please try again later',
  },

  // Stricter limits for sensitive operations
  sensitive: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // 10 requests per 5 minutes
    message: 'Sensitive operation rate limit exceeded',
  },

  // Very strict limits for account creation/registration
  registration: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 registrations per hour per IP
    message: 'Registration rate limit exceeded, please try again later',
    keyGenerator: (req: Request) => {
      const ip = req.ip || req.connection?.remoteAddress || 'unknown';
      return `registration:${ip}`;
    }
  }
};

export default RateLimitMiddleware;