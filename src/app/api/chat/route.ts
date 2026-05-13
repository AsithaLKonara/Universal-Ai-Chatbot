import { groq } from "@/lib/groq";
import { prisma } from "@/lib/prisma";
import { getHistory, saveMessage, getCustomerProfile, upsertCustomerProfile } from "@/lib/memory";
import { searchKnowledge } from "@/lib/knowledge";
import { detectIntent } from "@/lib/intent";
import {
    searchProducts,
    getProduct,
    getOrder,
    formatOrderSummary,
} from "@/lib/woocommerce";
import { Ratelimit } from "@upstash/ratelimit";
import { createRedisClient } from "@/lib/redis";
import { NextResponse } from "next/server";
import { getCart, addToCart, clearCart } from "@/lib/cart";
import { getOrCreateCheckout } from "@/lib/checkout";
import { createExecutionPlan } from "@/lib/planner";
import { ExecutionSupervisor } from "@/lib/supervisor";
import { assembleSystemPrompt } from "@/lib/prompts";
import { reflectOnInteraction } from "@/lib/reflection";
import { evaluateStrategy } from "@/lib/strategy";
import { getGoalDirective } from "@/lib/goals";
import { generateProductComparison } from "@/lib/commerce/comparison";
import { trackActivity } from "@/lib/sales/session";
import { supervisorRoute, AgentContext } from "@/lib/agents/supervisor";
import { runSalesAgent } from "@/lib/agents/sales-agent";
import { evaluateConfidence } from "@/lib/commerce/confidence";

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
    try {
        if (ratelimit) {
            const ip = req.headers.get("x-forwarded-for") ?? "anon";
            const { success } = await ratelimit.limit(ip);
            if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        const { message, messages = [], projectId, userId = "guest" } = await req.json();
        if (!projectId) return NextResponse.json({ error: "Project ID required" }, { status: 400 });

        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

        const userMessage = message || messages[messages.length - 1]?.content;
        if (!userMessage) return NextResponse.json({ error: "Message required" }, { status: 400 });

        // Intent detection
        const intentResult = await detectIntent(userMessage);
        
        // Tool execution (simplified for this port)
        let toolResult = await runTool(intentResult, userMessage, project, userId);

        const [history, knowledge, cart, profile] = await Promise.all([
            getHistory(projectId, null, userId),
            searchKnowledge(userMessage, projectId),
            getCart(projectId, userId),
            getCustomerProfile(projectId, userId) // userId as phone/identifier for now
        ]);

        const checkout = await getOrCreateCheckout(projectId, userId, cart.id);

        const wcConfig = {
            storeUrl: project.wooCommerceStoreUrl || "",
            consumerKey: project.wooCommerceKey || "",
            consumerSecret: project.wooCommerceSecret || "",
        };

        // Decision Confidence Check
        const confidence = await evaluateConfidence(userMessage, history);
        let responseContent = "";

        if (confidence.score < 0.6 && confidence.missingInformation.length > 0) {
            console.log(`[CONFIDENCE] Low confidence (${confidence.score}). Asking for clarification.`);
            responseContent = `I want to make sure I get this exactly right for you. Could you clarify: ${confidence.missingInformation.join(", ")}?`;
            await saveMessage(projectId, null, userId, userMessage, responseContent);
            return NextResponse.json({ content: responseContent, intent: "clarification_request" });
        }

        const agentContext: AgentContext = {
            userMessage,
            history,
            cart,
            profile,
            wcConfig
        };

        // Multi-Agent Routing
        const routedAgent = await supervisorRoute(agentContext);
        console.log(`[ORCHESTRATOR] Routing message to: ${routedAgent}`);

        if (routedAgent === "sales" || routedAgent === "comparison") {
            responseContent = await runSalesAgent(agentContext, toolResult.text);
        } else {
            // Fallback General Agent
            const strategy = evaluateStrategy(profile || undefined, cart);
            const dynamicSystemPrompt = assembleSystemPrompt({
                customer: profile || undefined,
                cart,
                checkout,
                channel: "web",
                strategy
            });

            const systemContent = [
                dynamicSystemPrompt,
                getGoalDirective(),
                history.length ? `History:\n${history.map(e => `User: ${e.message}\nAssistant: ${e.response}`).join("\n")}` : "",
                knowledge.length ? `Knowledge:\n${knowledge.join("\n")}` : "",
                toolResult.text ? `Tool result (${intentResult.intent}):\n${toolResult.text}` : "",
            ].filter(Boolean).join("\n\n");

            const completion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "system", content: systemContent }, ...messages.slice(-5), { role: "user", content: userMessage }],
                max_completion_tokens: 500,
                temperature: 0.7,
            });

            responseContent = completion.choices[0]?.message?.content || "";
        }

        await saveMessage(projectId, null, userId, userMessage, responseContent);

        // Run reflection and update memory
        const reflection = await reflectOnInteraction(userMessage, responseContent, history);
        if (reflection?.learned_preferences) {
            const currentPrefs = profile?.preferences || {};
            await upsertCustomerProfile(projectId, userId, {
                preferences: {
                    ...currentPrefs,
                    ...reflection.learned_preferences
                }
            });
        }

        return NextResponse.json({ 
            content: responseContent,
            data: toolResult.data,
            intent: intentResult.intent
        });

    } catch (error) {
        console.error("Internal API error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
