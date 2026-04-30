import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

type Tier = "free" | "starter" | "pro" | "business"

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null

const rateLimiters =
  redis === null
    ? null
    : {
        free: new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(10, "1 h"),
          analytics: true,
          prefix: "ratelimit:free",
        }),
        starter: new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(100, "1 d"),
          analytics: true,
          prefix: "ratelimit:starter",
        }),
        pro: new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(1000, "1 d"),
          analytics: true,
          prefix: "ratelimit:pro",
        }),
        business: new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(10000, "1 d"),
          analytics: true,
          prefix: "ratelimit:business",
        }),
      }

export async function getRateLimitForUser(userId: string, tier: Tier) {
  if (!rateLimiters) {
    return {
      success: true,
      limit: Number.POSITIVE_INFINITY,
      remaining: Number.POSITIVE_INFINITY,
      reset: Date.now(),
      pending: Promise.resolve(),
    }
  }

  return rateLimiters[tier].limit(`chat:${tier}:${userId}`)
}
