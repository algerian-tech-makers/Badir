import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limiter for post email notifications
 *
 * Limit: 10 emails per hour
 * Prevents overwhelming Resend API and ensures controlled delivery
 */
export const postCreationRateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  prefix: "post-creation",
  analytics: true,
});

/**
 * Rate limiter for newsletter subscriptions
 *
 * Limit: 3 subscription/unsubscription actions per minute per user
 * Prevents abuse of newsletter subscription endpoints
 */
export const newsletterSubscriptionRateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  prefix: "newsletter",
});

/**
 * Rate limiter for sign-in endpoint.
 *
 * Limit: 5 attempts per 60 seconds per IP
 * Mitigates brute-force and credential-stuffing attacks.
 */
export const signInRateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  analytics: true,
  prefix: "auth-sign-in",
});

/**
 * Rate limiter for sign-up endpoint.
 *
 * Limit: 10 attempts per 60 minutes per IP
 * Prevents mass account-creation abuse.
 */
export const signUpRateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "60 m"),
  analytics: true,
  prefix: "auth-sign-up",
});
