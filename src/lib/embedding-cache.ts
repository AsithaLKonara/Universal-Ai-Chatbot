import { prisma } from "./prisma";
import { Redis } from "@upstash/redis";

let redis: Redis | null = null;
function getRedis() {
    if (redis) return redis;
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        redis = Redis.fromEnv();
    }
    return redis;
}

export async function getCachedEmbedding(text: string): Promise<number[] | null> {
    const client = getRedis();
    if (!client) return null;
    
    try {
        return await client.get<number[]>(`emb:${Buffer.from(text).toString("base64")}`);
    } catch {
        return null;
    }
}

export async function setCachedEmbedding(text: string, embedding: number[]): Promise<void> {
    const client = getRedis();
    if (!client) return;

    try {
        await client.set(`emb:${Buffer.from(text).toString("base64")}`, embedding, { ex: 3600 * 24 }); // 24h
    } catch {}
    
    // Also save to DB for long-term persistence
    try {
        await prisma.embeddingCache.upsert({
            where: { text },
            create: { text, embedding },
            update: { embedding }
        });
    } catch {}
}
