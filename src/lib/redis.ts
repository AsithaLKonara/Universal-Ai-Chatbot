import { Redis } from "@upstash/redis";
import { logger } from "./logger";

/**
 * A safe Redis factory that returns null if the environment variables
 * are missing or contain placeholder/invalid values.
 */
export function createRedisClient(customUrl?: string) {
    const url = customUrl || process.env.UPSTASH_REDIS_REST_URL;
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
        retry: {
            retries: 2,
            backoff: (retryCount) => Math.exp(retryCount) * 50,
        }
    });
}

/**
 * Returns a namespaced wrapper for Redis with Multi-Region Failover.
 */
export function getProjectRedis(projectId: string) {
    const primaryClient = createRedisClient();
    const replicaUrls = [
        process.env.UPSTASH_REDIS_REST_URL_EU,
        process.env.UPSTASH_REDIS_REST_URL_US
    ].filter(Boolean) as string[];

    if (!primaryClient) return null;

    const executeWithFailover = async <T>(operation: (client: Redis) => Promise<T>): Promise<T | null> => {
        try {
            // Aggressive 1.5s timeout for primary edge reads
            return await Promise.race([
                operation(primaryClient),
                new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Redis Timeout')), 1500))
            ]);
        } catch (error) {
            if (replicaUrls.length > 0) {
                logger.warn(`[REDIS] Primary region failed, attempting failover to replicas`, { error: String(error) });
                
                for (const replicaUrl of replicaUrls) {
                    const replicaClient = createRedisClient(replicaUrl);
                    if (replicaClient) {
                        try {
                            return await operation(replicaClient);
                        } catch (replicaError) {
                            logger.warn(`[REDIS] Replica ${replicaUrl} failed`, { error: String(replicaError) });
                        }
                    }
                }
            }
            logger.error(`[REDIS] All Redis regions failed for project ${projectId}`);
            throw error; // Re-throw if all replicas fail, so calling code handles it natively
        }
    };

    return {
        get: async <T>(key: string) => executeWithFailover(c => c.get<T>(`project:${projectId}:${key}`)),
        set: async (key: string, value: any, options?: any) => 
            executeWithFailover(c => c.set(`project:${projectId}:${key}`, value, options)),
        del: async (key: string) => executeWithFailover(c => c.del(`project:${projectId}:${key}`)),
        publish: async (channel: string, message: string) => 
            executeWithFailover(c => c.publish(`project:${projectId}:${channel}`, message)),
    };
}
