import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
    parseInboundMessage,
    verifyWebhook,
    verifySignature,
    sendWhatsAppMessage,
} from "@/lib/whatsapp";
import { logger } from "@/lib/logger";
import { detectIntent } from "@/lib/intent";
import { getHistory, saveMessage, getCustomerProfile, upsertCustomerProfile, buildCustomerContext } from "@/lib/memory";
import { getCart } from "@/lib/cart";
import { searchKnowledge } from "@/lib/knowledge";
import {
    searchProducts,
    getOrder,
    formatOrderSummary,
} from "@/lib/woocommerce";
import { groq } from "@/lib/groq";

export const dynamic = "force-dynamic";

async function getProjectConfig(projectId: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return null;
    return {
        token: project.whatsappToken || "",
        phoneId: project.whatsappPhoneId || "",
        verifyToken: project.whatsappVerifyToken || "omnichat_verify",
        appSecret: project.whatsappAppSecret,
        wooCommerceConfig: {
            storeUrl: project.wooCommerceStoreUrl || "",
            consumerKey: project.wooCommerceKey || "",
            consumerSecret: project.wooCommerceSecret || "",
        }
    };
}

export async function GET(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = await params;
    const config = await getProjectConfig(projectId);
    if (!config) return new Response("Project not found", { status: 404 });

    const { searchParams } = new URL(req.url);
    const challenge = verifyWebhook(Object.fromEntries(searchParams.entries()), config);

    if (challenge !== null) return new Response(challenge, { status: 200 });
    return new Response("Forbidden", { status: 403 });
}

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = await params;
    const config = await getProjectConfig(projectId);
    if (!config) return new Response("Project not found", { status: 404 });

    const rawBody = await req.text();
    const signature = req.headers.get("x-hub-signature-256");
    const valid = await verifySignature(rawBody, signature, config);
    if (!valid) return new Response("Unauthorized", { status: 401 });

    let body: any;
    try {
        body = JSON.parse(rawBody);
    } catch {
        return new Response("Bad Request", { status: 400 });
    }

    const inbound = parseInboundMessage(body);
    if (!inbound) return new Response("OK", { status: 200 });

    processMessage(projectId, inbound, config).catch((err) =>
        logger.error("WhatsApp message processing error", { error: err })
    );

    return new Response("OK", { status: 200 });
}

async function processMessage(projectId: string, inbound: any, config: any): Promise<void> {
    const { from, text } = inbound;
    const sessionId = `wa:${from}`;

    try {
        const [profile, history, knowledge, intent] = await Promise.all([
            getCustomerProfile(projectId, from),
            getHistory(projectId, sessionId, from),
            searchKnowledge(text, projectId),
            detectIntent(text),
        ]);

        let toolResult = "";
        if (intent.intent === "product_search") {
            const products = await searchProducts(intent.entities.product_query || text, config.wooCommerceConfig);
            toolResult = products.length ? products.map(p => `${p.name} - ${p.price}`).join("\n") : "No products found.";
        } else if (intent.intent === "order_status" && intent.entities.order_id) {
            const order = await getOrder(intent.entities.order_id, config.wooCommerceConfig);
            toolResult = order ? formatOrderSummary(order) : "Order not found.";
        }

        const systemContent = `You are OmniChat AI on WhatsApp for project ${projectId}.
${buildCustomerContext(profile)}
${toolResult ? `Tool Result: ${toolResult}` : ""}`;

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemContent },
                { role: "user", content: text },
            ],
        });

        const reply = completion.choices[0]?.message?.content || "Sorry, I couldn't process that.";

        await Promise.all([
            sendWhatsAppMessage(from, reply, config),
            saveMessage(projectId, sessionId, from, text, reply),
            upsertCustomerProfile(projectId, from, {}),
        ]);
    } catch (err) {
        console.error("processMessage error:", err);
    }
}
