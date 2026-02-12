// ==========================================
// SULTAN: RateLimiter Middleware
// ==========================================

// Rate limiting for spam and DDoS protection

const rateLimit = require('express-rate-limit');

/**
 * General limit for all API endpoints
 * 100 requests in 15 minutes
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // maximum 100 requests
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again in 15 minutes.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Returns rate limit in `RateLimit-*` headers
  legacyHeaders: false, // Disables `X-RateLimit-*` headers
});

/**
 * Strict limit for authentication/registration
 * 5 attempts per hour (brute force protection)
 */
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // maximum 5 attempts
  message: {
    success: false,
    message: 'Too many login/registration attempts. Try again in an hour.',
    retryAfter: '1 hour'
  },
  skipSuccessfulRequests: true, // Don't count successful requests
});

/**
 * Limit for task creation
 * 30 tasks per hour
 */
const taskCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // maximum 30 tasks
  message: {
    success: false,
    message: 'Too many tasks created in the last hour. Try again later.',
    retryAfter: '1 hour'
  },
  // Increased limit for premium and admin users
  skip: (req) => {
    const userRole = req.user?.role;
    return userRole === 'admin' || userRole === 'premium';
  }
});

/**
 * Limit for email notifications
 * 10 emails per hour (to prevent spam)
 */
const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    success: false,
    message: 'Email sending limit reached. Try again later.',
    retryAfter: '1 hour'
  }
});

/**
 * Limit for admin operations
 * 50 requests per hour
 */
const adminLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    message: 'Too many admin operations. Please wait.',
    retryAfter: '1 hour'
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  taskCreationLimiter,
  emailLimiter,
  adminLimiter
};
