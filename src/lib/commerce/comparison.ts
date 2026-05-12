import { groq } from "../groq";
import { WCProduct, getProduct } from "../woocommerce";
import { WooCommerceConfig } from "../woocommerce";

export interface ComparisonResult {
    productA: { id: number; name: string; image: string; price: string };
    productB: { id: number; name: string; image: string; price: string };
    dimensions: {
        dimension: string;
        valueA: string;
        valueB: string;
        winner?: "A" | "B" | "TIE";
    }[];
    summary: string;
}

export async function generateProductComparison(
    productIdA: number,
    productIdB: number,
    config: WooCommerceConfig
): Promise<ComparisonResult | null> {
    try {
        const [productA, productB] = await Promise.all([
            getProduct(productIdA, config),
            getProduct(productIdB, config)
        ]);

        if (!productA || !productB) return null;

        const prompt = `You are an expert commerce consultant. Compare the following two products.
Product A: ${productA.name} - ${productA.price} - ${productA.short_description}
Product B: ${productB.name} - ${productB.price} - ${productB.short_description}

Generate a JSON comparison with:
1. dimensions: array of { dimension (e.g. "Value", "Use Case", "Performance"), valueA, valueB, winner ("A", "B", "TIE") }
2. summary: A short conclusive summary advising the customer.

Respond ONLY with valid JSON.`;

        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.1
        });

        const result = JSON.parse(completion.choices[0]?.message?.content || "{}");

        return {
            productA: { id: productA.id, name: productA.name, image: productA.images?.[0]?.src || "", price: productA.price },
            productB: { id: productB.id, name: productB.name, image: productB.images?.[0]?.src || "", price: productB.price },
            dimensions: result.dimensions || [],
            summary: result.summary || "Both products offer great value."
        };
    } catch (err) {
        console.error("[COMPARISON ENGINE] Failed to generate comparison", err);
        return null;
    }
}
