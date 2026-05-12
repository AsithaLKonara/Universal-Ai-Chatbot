import { Redis } from "@upstash/redis";

export enum CommerceStrategy {
    PREMIUM = "PREMIUM",
    VALUE = "VALUE",
    FAST = "FAST",
    SUPPORT = "SUPPORT"
}

export interface SystemWeights {
    strategyBias: Record<CommerceStrategy, number>;
    rankingWeights: {
        stock: number;
        conversion: number;
        similarity: number;
    };
}

let redis: Redis | null = null;
function getRedis() {
    if (redis) return redis;
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        redis = Redis.fromEnv();
    }
    return redis;
}

const GOVERNOR_KEY = "omnichat:governor:weights";

export async function getSystemWeights(): Promise<SystemWeights> {
    const client = getRedis();
    if (client) {
        try {
            const cached = await client.get<SystemWeights>(GOVERNOR_KEY);
            if (cached) return cached;
        } catch {}
    }

    return {
        strategyBias: {
            [CommerceStrategy.VALUE]: 0.4,
            [CommerceStrategy.PREMIUM]: 0.2,
            [CommerceStrategy.FAST]: 0.2,
            [CommerceStrategy.SUPPORT]: 0.2
        },
        rankingWeights: {
            stock: 0.5,
            conversion: 0.3,
            similarity: 0.2
        }
    };
}
