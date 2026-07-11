import rateLimit from 'express-rate-limit';

// Standard API Rate Limiter: 100 requests per 15 minutes
export const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

// OTP Sending Rate Limiter: 5 OTPs per hour per IP to prevent spam
export const otpSendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: 'Maximum OTP request limit reached. Please retry in 1 hour.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Auth Verification Rate Limiter: 10 attempts per 15 minutes
export const authVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});
