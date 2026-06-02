import rateLimit from 'express-rate-limit';

// Strict limiter for auth endpoints — throttles credential brute-forcing and
// mass account creation. Only kicks in under abusive volume, so normal users
// (and the demo) are never affected.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // max attempts per IP per window
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again later.' },
});

// Generous limiter for the rest of the API — a backstop against runaway
// clients / scraping without impacting interactive use.
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded. Please slow down.' },
});
