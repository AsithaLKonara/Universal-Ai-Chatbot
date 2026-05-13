import { Redis } from "@upstash/redis";

/**
 * A safe Redis factory that returns null if the environment variables
 * are missing or contain placeholder/invalid values (e.g. on Vercel preview
 * builds without real credentials). This prevents build-time crashes.
 */
export function createRedisClient(): Redis | null {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token || !url.startsWith("https://")) {
        return null;
    }

    try {
        return Redis.fromEnv();
    } catch (e) {
        console.warn("[REDIS] Failed to initialize Redis client. Continuing without it.", e);
        return null;
    }
}
