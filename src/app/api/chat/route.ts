import { createRedisClient } from "@/lib/redis";
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { ChatRequestSchema } from "@/lib/validation";
import { OrchestratorService } from "@/lib/services/orchestrator";
import { withObservability } from "@/lib/middleware/observability";
import { logContext } from "@/lib/logger";

export const dynamic = "force-dynamic";

let ratelimit: Ratelimit | null = null;
const _redisForRateLimit = createRedisClient();
if (_redisForRateLimit) {
    ratelimit = new Ratelimit({
        redis: _redisForRateLimit,
        limiter: Ratelimit.slidingWindow(20, "1 m"),
    });
}

interface ToolResult {
    text: string;
    data?: any;
    intent: string;
}

async function runTool(
    intent: any,
    userMessage: string,
    project: any,
    customerId: string
): Promise<ToolResult> {
    const { entities } = intent;
    const wcConfig = {
        storeUrl: project.wooCommerceStoreUrl || "",
        consumerKey: project.wooCommerceKey || "",
        consumerSecret: project.wooCommerceSecret || "",
    };

    try {
        switch (intent.intent) {
            case "product_search": {
                const query = entities.product_query ?? userMessage;
                const products = await searchProducts(query, wcConfig);
                if (!products.length) return { text: "No products found matching your query.", intent: "product_search" };
                
                return {
                    text: "I found these items for you:",
                    data: { type: "product_list", products: products.map(p => ({
                        id: p.id,
                        name: p.name,
                        price: p.price,
                        image: p.images?.[0]?.src,
                        stock_status: p.stock_status,
                    })) },
                    intent: "product_search"
                };
            }

            case "cart_add": {
                const query = entities.product_query ?? userMessage;
                const pid = entities.product_id;
                
                let product;
                if (pid) {
                    product = await getProduct(Number(pid), wcConfig);
                } else {
                    const search = await searchProducts(query, wcConfig);
                    product = search[0];
                }

                if (!product) return { text: "I couldn't find that product to add to your cart.", intent: "cart_add" };

                const cart = await addToCart(project.id, customerId, {
                    productId: product.id,
                    name: product.name,
                    price: parseFloat(product.price),
                    quantity: entities.quantity || 1,
                    image: product.images?.[0]?.src
                });

                return {
                    text: `✅ Added *${product.name}* to your cart. Total: **${cart.subtotal.toFixed(2)}**.`,
                    data: { type: "cart_update", cart },
                    intent: "cart_add"
                };
            }

            case "cart_view": {
                const cart = await getCart(project.id, customerId);
                if (!cart.items.length) return { text: "Your cart is empty.", intent: "cart_view" };
                return {
                    text: `🛒 **Your Cart** Total: **${cart.subtotal.toFixed(2)}**.`,
                    data: { type: "cart_summary", cart },
                    intent: "cart_view"
                };
            }

            case "comparison_request": {
                const query = entities.product_query ?? userMessage;
                // Simple heuristic: search for top 2 matches to compare
                const products = await searchProducts(query, wcConfig);
                if (products.length < 2) return { text: "I need at least two products to compare.", intent: "comparison_request" };
                
                const comparison = await generateProductComparison(products[0].id, products[1].id, wcConfig);
                if (!comparison) return { text: "I couldn't generate a comparison at this time.", intent: "comparison_request" };

                // Track comparison event
                trackActivity(customerId, "compare", { productIds: [products[0].id, products[1].id] });

                return {
                    text: `Here is a comparison between **${products[0].name}** and **${products[1].name}**:`,
                    data: { type: "product_comparison", comparison },
                    intent: "comparison_request"
                };
            }

            default:
                return { text: "", intent: "general" };
        }
    } catch (err) {
        console.error(`[CHAT] Tool execution failed`, err);
        return { text: "I encountered a technical issue.", intent: intent.intent };
    }
}


export async function POST(req: Request) {
    const correlationId = req.headers.get("x-correlation-id");

    return await withObservability(correlationId, async () => {
        try {
            if (ratelimit) {
                const ip = req.headers.get("x-forwarded-for") ?? "anon";
                const { success } = await ratelimit.limit(ip);
                if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
            }

            const body = await req.json();
            const validation = ChatRequestSchema.safeParse(body);
            
            if (!validation.success) {
                return NextResponse.json({ error: "Invalid request", details: validation.error.format() }, { status: 400 });
            }

            const { message, messages = [], projectId, userId } = validation.data;
            const sessionId = "web_session"; 

            const result = await OrchestratorService.process({
                projectId,
                userId,
                sessionId,
                channel: "web",
                message: message || messages[messages.length - 1]?.content || "",
                metadata: { correlationId: (logContext.getStore() as any)?.correlationId }
            });

            return NextResponse.json(result);
        } catch (error) {
            console.error("Internal API error:", error);
            return NextResponse.json({ error: "Internal Error" }, { status: 500 });
        }
    });
}
