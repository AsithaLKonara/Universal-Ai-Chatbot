import { Ratelimit } from "@upstash/ratelimit";
import { createRedisClient } from "./redis";

const redis = createRedisClient();

/**
 * Standard per-IP rate limit for public API endpoints.
 */
export const publicRateLimit = redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "10 s"),
    analytics: true,
    prefix: "ratelimit:public",
}) : null;

/**
 * Tenant-aware rate limit to prevent a single project from 
 * exhausting system resources or API quotas.
 */
export async function checkTenantRateLimit(projectId: string): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
    if (!redis) return { success: true, limit: 0, remaining: 0, reset: 0 };

    const limiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(50, "1 m"), // 50 requests per minute per project
        analytics: true,
        prefix: `ratelimit:project:${projectId}`,
    });

    return await limiter.limit(projectId);
}
