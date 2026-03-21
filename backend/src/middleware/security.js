/**
 * Security Middleware
 *
 * Provides rate limiting, input validation, and common security headers
 */

// In-memory rate limiting store (use Redis in production)
const rateLimitStore = new Map();

/**
 * Clean up old entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.windowStart > 60000) { // 1 minute window
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean every minute

/**
 * Rate limiting middleware
 * @param {Object} options
 * @param {number} options.windowMs - Time window in ms (default: 60000 = 1 min)
 * @param {number} options.max - Max requests per window (default: 100)
 * @param {string} options.message - Error message
 */
export function rateLimit(options = {}) {
  const {
    windowMs = 60000,
    max = 100,
    message = 'Demasiadas solicitudes. Intenta de nuevo más tarde.'
  } = options;

  return (req, res, next) => {
    const key = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const now = Date.now();

    let record = rateLimitStore.get(key);

    if (!record || (now - record.windowStart) > windowMs) {
      record = { count: 1, windowStart: now };
    } else {
      record.count++;
    }

    rateLimitStore.set(key, record);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));
    res.setHeader('X-RateLimit-Reset', new Date(record.windowStart + windowMs).toISOString());

    if (record.count > max) {
      return res.status(429).json({
        error: message,
        code: 'RATE_LIMITED',
        retryAfter: Math.ceil((record.windowStart + windowMs - now) / 1000)
      });
    }

    next();
  };
}

/**
 * Stricter rate limit for auth endpoints
 */
export const authRateLimit = rateLimit({
  windowMs: 60000, // 1 minute
  max: 10, // 10 attempts per minute
  message: 'Demasiados intentos de autenticación. Espera un minuto.'
});

/**
 * Rate limit for registration
 */
export const registerRateLimit = rateLimit({
  windowMs: 3600000, // 1 hour
  max: 5, // 5 registrations per hour per IP
  message: 'Demasiados registros desde esta dirección. Intenta más tarde.'
});

/**
 * General API rate limit
 */
export const apiRateLimit = rateLimit({
  windowMs: 60000,
  max: 200
});

/**
 * Security headers middleware
 */
export function securityHeaders(req, res, next) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy (adjust for your needs)
  // res.setHeader('Content-Security-Policy', "default-src 'self'");

  next();
}

/**
 * Sanitize string input
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') return str;

  return str
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .slice(0, 10000); // Limit length
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = Array.isArray(value)
        ? value.map(v => typeof v === 'string' ? sanitizeString(v) : v)
        : sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Input sanitization middleware
 */
export function sanitizeInput(req, res, next) {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate slug format
 */
export function isValidSlug(slug) {
  const slugRegex = /^[a-z0-9]+$/;
  return slug && slug.length >= 3 && slug.length <= 50 && slugRegex.test(slug);
}

/**
 * Common SQL injection patterns to detect
 */
const sqlPatterns = [
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
  /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
  /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
  /((\%27)|(\'))union/i
];

/**
 * Check for SQL injection attempts
 */
export function detectSQLInjection(value) {
  if (typeof value !== 'string') return false;
  return sqlPatterns.some(pattern => pattern.test(value));
}

/**
 * SQL injection protection middleware
 */
export function sqlInjectionGuard(req, res, next) {
  const checkObject = (obj, path = '') => {
    if (!obj) return;

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && detectSQLInjection(value)) {
        console.warn(`⚠️ Potential SQL injection detected: ${path}.${key}`);
        return res.status(400).json({
          error: 'Solicitud inválida',
          code: 'INVALID_INPUT'
        });
      }
      if (typeof value === 'object' && value !== null) {
        checkObject(value, `${path}.${key}`);
      }
    }
  };

  checkObject(req.body, 'body');
  checkObject(req.query, 'query');
  checkObject(req.params, 'params');

  next();
}
