import { aiGateway } from "./agent/gateway";
import { z } from "zod";

export const IntentSchema = z.object({
    intent: z.enum([
        "product_search",
        "cart_view",
        "cart_add",
        "cart_remove",
        "cart_clear",
        "checkout_start",
        "order_status",
        "order_create",
        "product_qualification",
        "objection_handling",
        "upsell_offer",
        "comparison_request",
        "human_handoff",
        "voice_input",
        "support",
        "general"
    ]),
    entities: z.object({
        product_query: z.string().nullable().optional(),
        product_id: z.union([z.string(), z.number()]).nullable().optional(),
        quantity: z.number().nullable().optional(),
        order_id: z.string().nullable().optional(),
        tracking_number: z.string().nullable().optional(),
        customer_name: z.string().nullable().optional(),
        phone: z.string().nullable().optional(),
    }),
    confidence: z.enum(["high", "medium", "low"])
});

export type IntentResult = z.infer<typeof IntentSchema>;

const INTENT_SYSTEM_PROMPT = `You are an intent classifier for a premium AI commerce agent (OmniChat).
Analyze the user message and return a structured JSON object.

Intents:
- product_search: User looking for items
- cart_view: User wants to see their shopping cart
- cart_add: User wants to add an item to cart
- cart_remove: User wants to remove an item
- cart_clear: User wants to empty the cart
- checkout_start: User ready to pay/finish
- order_status: Checking existing order
- product_qualification: User providing preferences
- objection_handling: User expressing doubt
- comparison_request: User asking to compare products
- general: Chit-chat or unknown

Return exactly the JSON structure required by the schema.`;

export async function detectIntent(message: string): Promise<IntentResult> {
    try {
        return await aiGateway({
            model: "llama-3.1-8b-instant",
            systemPrompt: INTENT_SYSTEM_PROMPT,
            userMessage: message,
            schema: IntentSchema
        });
    } catch (err) {
        console.error("[INTENT] Gateway failed", err);
        return {
            intent: "general",
            entities: {},
            confidence: "low",
        };
    }
}
