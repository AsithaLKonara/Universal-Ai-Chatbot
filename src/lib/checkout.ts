import { prisma } from "./prisma";
import { logger } from "./logger";

export type CheckoutStage = 
    | "CART_REVIEW" 
    | "CUSTOMER_INFO" 
    | "SHIPPING" 
    | "PAYMENT_INIT" 
    | "PAYMENT_PENDING" 
    | "CONFIRMED" 
    | "ABANDONED";

export const CHECKOUT_TRANSITIONS: Record<CheckoutStage, CheckoutStage[]> = {
    "CART_REVIEW": ["CUSTOMER_INFO", "ABANDONED"],
    "CUSTOMER_INFO": ["SHIPPING", "CART_REVIEW", "ABANDONED"],
    "SHIPPING": ["PAYMENT_INIT", "CUSTOMER_INFO", "ABANDONED"],
    "PAYMENT_INIT": ["PAYMENT_PENDING", "SHIPPING", "ABANDONED"],
    "PAYMENT_PENDING": ["CONFIRMED", "PAYMENT_INIT", "ABANDONED"],
    "CONFIRMED": [],
    "ABANDONED": ["CART_REVIEW"]
};

export async function getOrCreateCheckout(projectId: string, customerId: string, cartId: string) {
    const existing = await prisma.checkoutSession.findFirst({
        where: { projectId, customerId, cartId, status: "pending" },
    });

    if (existing) return existing;

    return await prisma.checkoutSession.create({
        data: {
            projectId,
            customerId,
            cartId,
            stage: "CART_REVIEW",
            status: "pending",
        },
    });
}

export async function advanceCheckoutStage(id: string, nextStage: CheckoutStage, data?: any) {
    return await prisma.$transaction(async (tx) => {
        const checkout = await tx.checkoutSession.findUnique({ 
            where: { id },
            // Lock the row for update in production if the DB supports it
        });
        
        if (!checkout) throw new Error("Checkout session not found");

        const currentStage = checkout.stage as CheckoutStage;
        
        // Idempotency: If already at nextStage, just return
        if (currentStage === nextStage) return checkout;

        const allowed = CHECKOUT_TRANSITIONS[currentStage];
        if (!allowed.includes(nextStage)) {
            logger.error(`[FSM] Invalid transition attempt`, { checkoutId: id, from: currentStage, to: nextStage });
            throw new Error(`Invalid transition from ${currentStage} to ${nextStage}`);
        }

        // Strict Data Validation for each stage
        if (nextStage === "SHIPPING" && currentStage === "CUSTOMER_INFO") {
            const missing = getMissingInfoForStage("CUSTOMER_INFO", data);
            if (missing.length) throw new Error(`Missing required customer info: ${missing.join(", ")}`);
        }

        if (nextStage === "PAYMENT_INIT" && currentStage === "SHIPPING") {
            const missing = getMissingInfoForStage("SHIPPING", data);
            if (missing.length) throw new Error(`Missing required shipping info: ${missing.join(", ")}`);
        }

        logger.info(`[FSM] Advancing checkout stage`, { id, from: currentStage, to: nextStage });

        return await tx.checkoutSession.update({
            where: { id },
            data: {
                stage: nextStage,
                ...(data?.customerData ? { customerData: data.customerData } : {}),
                ...(data?.shippingInfo ? { shippingInfo: data.shippingInfo } : {}),
                ...(data?.paymentId ? { paymentId: data.paymentId } : {}),
                ...(nextStage === "CONFIRMED" ? { status: "completed" } : {}),
                ...(nextStage === "ABANDONED" ? { status: "abandoned" } : {}),
            },
        });
    }, { timeout: 10000 });
}

export function getMissingInfoForStage(stage: CheckoutStage, data: any): string[] {
    const missing: string[] = [];
    if (!data) return ["all_fields"];

    if (stage === "CUSTOMER_INFO") {
        if (!data.name) missing.push("name");
        if (!data.email) missing.push("email");
        if (!data.phone) missing.push("phone");
    }
    if (stage === "SHIPPING") {
        if (!data.address) missing.push("address");
        if (!data.city) missing.push("city");
    }
    return missing;
}

// ─── Resilience & Recovery ────────────────────────────────────────────────────

export async function resumeCheckout(projectId: string, customerId: string) {
    const session = await prisma.checkoutSession.findFirst({
        where: { projectId, customerId, status: "pending" },
        orderBy: { updatedAt: "desc" }
    });

    if (!session) return null;

    const cart = await prisma.cart.findUnique({
        where: { id: session.cartId },
        include: { items: true }
    });

    if (!cart || cart.status !== "active") {
        await prisma.checkoutSession.update({
            where: { id: session.id },
            data: { status: "abandoned" }
        });
        return null;
    }

    return session;
}

export async function reconcilePayment(checkoutId: string, stripeSessionId?: string) {
    const checkout = await prisma.checkoutSession.findUnique({ where: { id: checkoutId } });
    if (!checkout) return null;

    if (stripeSessionId) {
        // Here you would call stripe.checkout.sessions.retrieve(stripeSessionId)
        // If paid, advance to CONFIRMED
    }

    return checkout;
}
