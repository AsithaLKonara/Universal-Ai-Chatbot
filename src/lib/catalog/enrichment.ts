import { groq } from "../groq";
import { WCProduct, getProduct, WooCommerceConfig } from "../woocommerce";
import { createRedisClient } from "../redis";

const redis = createRedisClient();

export interface EnrichedMetadata {
    semanticTags: string[];
    idealUseCases: string[];
    targetAudience: string;
    pros: string[];
    cons: string[];
    normalizedSpecs: Record<string, string>;
}

export async function enrichProduct(
    productId: number,
    config: WooCommerceConfig
): Promise<EnrichedMetadata | null> {
    if (!redis) return null; // Require Redis for caching enriched data

    const cacheKey = `omnichat:enriched:${productId}`;
    
    try {
        const cached = await redis.get<EnrichedMetadata>(cacheKey);
        if (cached) return cached;

        const product = await getProduct(productId, config);
        if (!product) return null;

        const prompt = `You are an expert commerce data taxonomist.
Normalize and enrich the following product data.

Product: ${product.name}
Price: ${product.price}
Description: ${product.short_description}

Generate a JSON object with the following schema:
{
  "semanticTags": ["string"],
  "idealUseCases": ["string"],
  "targetAudience": "string",
  "pros": ["string"],
  "cons": ["string"],
  "normalizedSpecs": { "key": "value" }
}

Respond ONLY with valid JSON.`;

        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.1
        });

        const result = JSON.parse(completion.choices[0]?.message?.content || "{}") as EnrichedMetadata;
        
        // Cache indefinitely (or invalidate via webhook if product updates)
        await redis.set(cacheKey, result);
        
        console.log(`[ENRICHMENT] Successfully enriched product ${productId}`);
        return result;

    } catch (err) {
        console.error(`[ENRICHMENT] Failed to enrich product ${productId}`, err);
        return null;
    }
}
