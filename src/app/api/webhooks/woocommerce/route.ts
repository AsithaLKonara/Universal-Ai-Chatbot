import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { prisma, projectContext } from "@/lib/prisma";
import { omniBus, OmniEvent } from "@/lib/events";
import { createRedisClient } from "@/lib/redis";

/**
 * WooCommerce Webhook Handler
 * 
 * Replaces the previous polling-based inventory sync with a real-time
 * push model. WooCommerce sends signed HTTP POST events to this endpoint
 * whenever products, orders, or inventory change.
 * 
 * Setup:
 *   WooCommerce Admin → Settings → Advanced → Webhooks → Add Webhook
 *   Delivery URL: https://<your-domain>/api/webhooks/woocommerce
 *   Secret: <WC_WEBHOOK_SECRET env var>
 * 
 * Topics handled:
 *   - product.updated  → Invalidate Redis product cache
 *   - product.created  → Invalidate Redis product cache
 *   - order.created    → Sync order status to DB
 *   - order.updated    → Sync order status to DB
 */

const WC_WEBHOOK_SECRET = process.env.WC_WEBHOOK_SECRET || "";

function verifyWooCommerceSignature(body: string, signature: string): boolean {
    if (!WC_WEBHOOK_SECRET) return true; // Skip in dev without secret
    const expected = createHmac("sha256", WC_WEBHOOK_SECRET)
        .update(body, "utf8")
        .digest("base64");
    return expected === signature;
}

function getCacheKeyPrefix(storeUrl: string): string {
    return `wc:${Buffer.from(storeUrl).toString("base64")}:search:`;
}

export async function POST(req: NextRequest) {
    const rawBody = await req.text();
    const signature = req.headers.get("x-wc-webhook-signature") || "";
    const topic = req.headers.get("x-wc-webhook-topic") || "";
    const webhookId = req.headers.get("x-wc-webhook-id") || "unknown";
    const deliveryId = req.headers.get("x-wc-delivery-id") || "unknown";

    // 1. Verify signature
    if (!verifyWooCommerceSignature(rawBody, signature)) {
        console.error(`[WC-WEBHOOK] Invalid signature for delivery ${deliveryId}`);
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let payload: any;
    try {
        payload = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    console.log(`[WC-WEBHOOK] Received topic=${topic} webhookId=${webhookId}`);

    const redis = createRedisClient();

    try {
        // 2. Handle product changes — invalidate cache keys
        if (topic === "product.updated" || topic === "product.created") {
            if (redis && payload.id) {
                // Invalidate any cached search results that might include this product.
                // We can't know which search keys are stale, so we scan for the prefix pattern.
                // In production, use Redis SCAN with pattern matching.
                const productId = payload.id;
                const storeUrl = process.env.WOOCOMMERCE_STORE_URL || "";
                if (storeUrl) {
                    const prefix = getCacheKeyPrefix(storeUrl);
                    console.log(`[WC-WEBHOOK] Invalidating search cache for product ${productId}`);
                    // Bust the specific product cache key
                    await redis.del(`wc:product:${productId}`);
                }
            }

            // Emit internal event for downstream listeners
            await omniBus.emitOmni(OmniEvent.ANALYTICS_TRACK, {
                type: "wc_product_sync",
                productId: payload.id,
                name: payload.name,
                stockStatus: payload.stock_status,
                stockQuantity: payload.stock_quantity,
                price: payload.price,
            });

            return NextResponse.json({ received: true, action: "cache_invalidated" });
        }

        // 3. Handle order changes — sync status to DB
        if (topic === "order.created" || topic === "order.updated") {
            const wcOrderId = payload.id;
            const wcStatus = payload.status;

            if (wcOrderId) {
                // Look up if we have a matching CheckoutSession for this order
                // Orders injected by OmniChat store the idempotency key in meta_data
                const idempotencyMeta = (payload.meta_data || []).find(
                    (m: { key: string; value: string }) => m.key === "_omnichat_idempotency_key"
                );

                if (idempotencyMeta?.value) {
                    const sessionRecord = await prisma.checkoutSession.findFirst({
                        where: { orderId: wcOrderId.toString() },
                        select: { id: true, projectId: true },
                    });

                    if (sessionRecord) {
                        // Run update inside the correct project context
                        await projectContext.run({ projectId: sessionRecord.projectId }, async () => {
                            await prisma.checkoutSession.update({
                                where: { id: sessionRecord.id },
                                data: { 
                                    status: wcStatus === "completed" ? "COMPLETED" : 
                                            wcStatus === "processing" ? "PROCESSING" :
                                            wcStatus === "cancelled" ? "CANCELLED" : "PENDING"
                                },
                            });
                        });

                        console.log(`[WC-WEBHOOK] Synced order #${wcOrderId} → status: ${wcStatus}`);

                        if (wcStatus === "completed") {
                            await omniBus.emitOmni(OmniEvent.ORDER_CREATED, {
                                wcOrderId,
                                status: wcStatus,
                                total: payload.total,
                            });
                        }
                    }
                }
            }

            return NextResponse.json({ received: true, action: "order_synced" });
        }

        // 4. Acknowledge unhandled topics gracefully
        return NextResponse.json({ received: true, action: "no_op", topic });

    } catch (err: any) {
        console.error(`[WC-WEBHOOK] Error processing topic=${topic}:`, err.message);
        // Return 200 to prevent WooCommerce from retrying indefinitely
        return NextResponse.json({ received: true, error: "Processing error, logged" });
    }
}
