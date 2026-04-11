const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// General API rate limit
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again in 15 minutes.',
  },
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit hit from IP: ${req.ip}`);
    res.status(429).json(options.message);
  },
});

// Strict limit for form submission (prevent spam)
const auditSubmitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // max 3 audit submissions per IP per hour
  message: {
    success: false,
    message: 'Too many audit submissions. Please wait before trying again.',
  },
});

// Admin auth limiter (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  message: {
    success: false,
    message: 'Too many login attempts. Please wait 15 minutes.',
  },
});

// Waitlist limiter
const waitlistLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    message: 'Too many signups from this IP.',
  },
});

module.exports = { generalLimiter, auditSubmitLimiter, authLimiter, waitlistLimiter };
