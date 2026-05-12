import { prisma } from "./prisma";

export type CheckoutStage = "CART_REVIEW" | "CUSTOMER_INFO" | "SHIPPING" | "PAYMENT" | "CONFIRMED";

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

export async function updateCheckoutStage(id: string, stage: CheckoutStage, data?: any) {
    return await prisma.checkoutSession.update({
        where: { id },
        data: {
            stage,
            ...(stage === "CUSTOMER_INFO" ? { customerData: data } : {}),
            ...(stage === "SHIPPING" ? { shippingInfo: data } : {}),
        },
    });
}
