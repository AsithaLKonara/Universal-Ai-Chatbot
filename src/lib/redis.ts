import { Redis } from "@upstash/redis";

/**
 * A safe Redis factory that returns null if the environment variables
 * are missing or contain placeholder/invalid values (e.g. on Vercel preview
 * builds without real credentials). This prevents build-time crashes.
 */
export function createRedisClient() {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token || url === "..." || !url.startsWith("https://")) {
        if (url && url !== "...") {
            console.warn(`[REDIS] Invalid Upstash URL: ${url}. Skipping client creation.`);
        } else {
            console.warn("[REDIS] Missing or placeholder Upstash credentials, skipping client creation.");
        }
        return null;
    }
    return new Redis({
        url,
        token,
    });
}

/**
 * Returns a namespaced wrapper for Redis to ensure multi-tenant isolation.
 */
export function getProjectRedis(projectId: string) {
    const client = createRedisClient();
    if (!client) return null;

    return {
        get: async <T>(key: string) => client.get<T>(`project:${projectId}:${key}`),
        set: async (key: string, value: any, options?: any) => 
            client.set(`project:${projectId}:${key}`, value, options),
        del: async (key: string) => client.del(`project:${projectId}:${key}`),
        publish: async (channel: string, message: string) => 
            client.publish(`project:${projectId}:${channel}`, message),
    };
}
