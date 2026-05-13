import { stripe } from "@/lib/stripe";
import { prisma, projectContext } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createOrder, WooCommerceConfig } from "@/lib/woocommerce";
import { advanceCheckoutStage } from "@/lib/checkout";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { logger } from "@/lib/logger";

import { withEventIdempotency } from "@/lib/events/idempotency";

export async function POST(req: Request) {
    const body = await req.text();
    const sig = (await headers()).get("stripe-signature");

    if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

    try {
        const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
        logger.info(`[STRIPE] Received event: ${event.type}`, { eventId: event.id });

        if (event.type === "checkout.session.completed") {
            const session = event.data.object as any;
            const metadata = session.metadata;

            if (metadata.type === "commerce_checkout") {
                await withEventIdempotency(event.id, "stripe_checkout", async () => {
                    await handleCommerceCheckout(session);
                });
            } else {
                await handleSubscriptionUpgrade(session);
            }
        }

        return NextResponse.json({ received: true });
    } catch (err: any) {
        logger.error("[STRIPE] Webhook error", { error: err.message });
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}

async function handleCommerceCheckout(session: any) {
    const { projectId, customerId, cartId } = session.metadata;

    await projectContext.run({ projectId }, async () => {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { user: true }
        });

        if (!project) throw new Error(`Project ${projectId} not found`);

        const cart = await prisma.cart.findUnique({
            where: { id: cartId },
            include: { items: true, customer: true }
        });

        if (!cart) throw new Error(`Cart ${cartId} not found`);

        const wcConfig: WooCommerceConfig = {
            storeUrl: project.wooCommerceStoreUrl || "",
            consumerKey: project.wooCommerceKey || "",
            consumerSecret: project.wooCommerceSecret || "",
        };

        // 1. Create WooCommerce Order
        const wcOrder = await createOrder({
            customer: {
                name: cart.customer.name || "Customer",
                email: cart.customer.email || "",
                phone: cart.customer.phone,
                address: cart.customer.address || "N/A",
                city: cart.customer.city || "N/A",
                country: "US" // Default or extract from shipping info
            },
            items: cart.items.map(item => ({
                productId: item.productId,
                quantity: item.quantity
            })),
            paymentMethod: "stripe"
        }, wcConfig, `stripe_${session.id}`);

        if (!wcOrder) {
            logger.error(`[COMMERCE] Failed to create WC order for session ${session.id}`);
            // In production, we should queue this for retry
            throw new Error("WooCommerce order creation failed");
        }

        // 2. Advance FSM to CONFIRMED
        const checkout = await prisma.checkoutSession.findFirst({
            where: { projectId, customerId, cartId, status: "pending" }
        });

        if (checkout) {
            await advanceCheckoutStage(checkout.id, "CONFIRMED", { 
                paymentId: session.id,
                orderId: wcOrder.id 
            });
        }

        // 3. Mark Cart as Converted
        await prisma.cart.update({
            where: { id: cartId },
            data: { status: "converted" }
        });

        // 4. Send Confirmation Notification (WhatsApp)
        if (project.whatsappEnabled) {
            const message = `🎉 Thank you for your order! Your Order #${wcOrder.id} has been confirmed. We'll notify you when it ships.`;
            await sendWhatsAppMessage(cart.customer.phone, message, {
                token: project.whatsappToken || "",
                phoneId: project.whatsappPhoneId || "",
                verifyToken: project.whatsappVerifyToken || ""
            });
        }

        logger.info(`[COMMERCE] Checkout completed successfully`, { 
            projectId, customerId, cartId, wcOrderId: wcOrder.id 
        });
    });
}

async function handleSubscriptionUpgrade(session: any) {
    const { userId, plan } = session.metadata;
    if (!userId || !plan) return;

    await prisma.user.update({
        where: { id: userId },
        data: { plan, stripeId: session.customer }
    });
    logger.info(`[STRIPE] Subscription upgraded`, { userId, plan });
}
