import { prisma } from "./prisma";

export type CheckoutStage = "CART_REVIEW" | "CUSTOMER_INFO" | "SHIPPING" | "PAYMENT" | "CONFIRMED";

const CHECKOUT_TRANSITIONS: Record<CheckoutStage, CheckoutStage[]> = {
    "CART_REVIEW": ["CUSTOMER_INFO"],
    "CUSTOMER_INFO": ["SHIPPING", "CART_REVIEW"],
    "SHIPPING": ["PAYMENT", "CUSTOMER_INFO"],
    "PAYMENT": ["CONFIRMED", "SHIPPING"],
    "CONFIRMED": []
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
    const checkout = await prisma.checkoutSession.findUnique({ where: { id } });
    if (!checkout) throw new Error("Checkout session not found");

    const currentStage = checkout.stage as CheckoutStage;
    const allowed = CHECKOUT_TRANSITIONS[currentStage];

    if (!allowed.includes(nextStage)) {
        throw new Error(`Invalid transition from ${currentStage} to ${nextStage}`);
    }

    return await prisma.checkoutSession.update({
        where: { id },
        data: {
            stage: nextStage,
            ...(nextStage === "CUSTOMER_INFO" ? { customerData: data } : {}),
            ...(nextStage === "SHIPPING" ? { shippingInfo: data } : {}),
            ...(nextStage === "CONFIRMED" ? { status: "completed" } : {}),
        },
    });
}

export function getMissingInfoForStage(stage: CheckoutStage, data: any): string[] {
    const missing: string[] = [];
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
    // Find the last pending checkout for this customer
    const session = await prisma.checkoutSession.findFirst({
        where: { projectId, customerId, status: "pending" },
        orderBy: { updatedAt: "desc" }
    });

    if (!session) return null;

    // Verify if the cart is still active and valid
    const cart = await prisma.cart.findUnique({
        where: { id: session.cartId },
        include: { items: true }
    });

    if (!cart || cart.status !== "active") {
        // Abandoned cart or already converted, invalidate session
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

    // If stripeSessionId is provided, we check Stripe for actual status
    // This handles cases where webhooks might have failed
    if (stripeSessionId) {
        // Here you would call stripe.checkout.sessions.retrieve(stripeSessionId)
        // If paid, advance to CONFIRMED
    }

    return checkout;
}
