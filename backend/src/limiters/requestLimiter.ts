import rateLimit from "express-rate-limit";

const userRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 200,
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const publicRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 75,
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

export { userRateLimiter, publicRateLimiter };
