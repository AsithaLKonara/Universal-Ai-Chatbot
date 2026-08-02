import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
    parseInboundMessage,
    verifyWebhook,
    verifySignature,
    sendWhatsAppMessage,
} from "@/lib/whatsapp";
import { logger } from "@/lib/logger";
import { OrchestratorService } from "@/lib/services/orchestrator";
import { withObservability } from "@/lib/middleware/observability";

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
    const correlationId = `wa:${projectId}:${from}:${Date.now()}`;

    if (text && text.trim().startsWith("LINK-")) {
        const code = text.trim();
        try {
            const { createRedisClient } = await import("@/lib/redis");
            const redis = createRedisClient();
            if (redis) {
                const handoffData = await redis.get(`handoff:${code}`);
                if (handoffData) {
                    const parsed = typeof handoffData === "string" ? JSON.parse(handoffData) : handoffData;
                    
                    await prisma.customer.update({
                        where: { id: parsed.customerId },
                        data: { phone: from }
                    });
                    
                    await redis.del(`handoff:${code}`);
                    await sendWhatsAppMessage(from, "✅ Session transferred successfully! Your web context is now synced.", config);
                    return;
                }
            }
            await sendWhatsAppMessage(from, "Sorry, this handoff code is invalid or has expired.", config);
            return;
        } catch (err) {
            logger.error("[HANDOFF] Failed to link session", { error: err });
            await sendWhatsAppMessage(from, "Sorry, there was an error transferring your session.", config);
            return;
        }
    }

    return await withObservability(correlationId, async () => {
        try {
            const result = await OrchestratorService.process({
                projectId,
                userId: from,
                sessionId,
                channel: "whatsapp",
                message: text,
                metadata: { correlationId }
            });

            await sendWhatsAppMessage(from, result.content, config);
        } catch (err) {
            logger.error("[WHATSAPP] Failed to process message via orchestrator", { error: err, from, projectId });
            await sendWhatsAppMessage(from, "I'm sorry, I'm having trouble processing your request right now.", config);
        }
    });
}
