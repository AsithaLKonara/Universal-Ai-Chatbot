import { createRedisClient } from "./redis";

const redis = createRedisClient();

export interface IdempotencyResult<T = any> {
    isDuplicate: boolean;
    result?: T;
}

export async function checkIdempotency<T = any>(
    key: string,
    namespace: string
): Promise<IdempotencyResult<T>> {
    if (!redis) return { isDuplicate: false };

    const fullKey = `idempotency:${namespace}:${key}`;
    const cached = await redis.get<string>(fullKey);

    if (cached) {
        try {
            return { isDuplicate: true, result: JSON.parse(cached) };
        } catch {
            return { isDuplicate: true, result: cached as any };
        }
    }

    return { isDuplicate: false };
}

export async function recordIdempotency(
    key: string,
    namespace: string,
    result: any,
    ttl = 86400 // Default 24 hours
) {
    if (!redis) return;

    const fullKey = `idempotency:${namespace}:${key}`;
    const value = typeof result === "string" ? result : JSON.stringify(result);
    
    await redis.set(fullKey, value, { ex: ttl });
}

/**
 * Higher-order function to wrap any async operation with idempotency.
 */
export async function withIdempotency<T>(
    key: string | undefined,
    namespace: string,
    operation: () => Promise<T>
): Promise<T> {
    if (!key) return await operation();

    const check = await checkIdempotency<T>(key, namespace);
    if (check.isDuplicate) {
        console.log(`[IDEMPOTENCY] Duplicate detected for ${namespace}:${key}. Returning cached result.`);
        return check.result!;
    }

    const result = await operation();
    await recordIdempotency(key, namespace, result);
    return result;
}
