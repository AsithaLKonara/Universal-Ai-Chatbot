import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
    apiVersion: "2025-01-27.acacia" as any,
});

export const PLANS = {
    FREE: { id: "free", name: "Free", limit: 1000 },
    PRO: { id: "pro", name: "Pro", limit: 50000 },
    ENTERPRISE: { id: "enterprise", name: "Enterprise", limit: 1000000 },
};

export async function createCommerceCheckoutSession(params: {
    projectId: string;
    customerId: string;
    cartId: string;
    items: { name: string; price: number; quantity: number; image?: string }[];
    successUrl: string;
    cancelUrl: string;
}) {
    return await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: params.items.map(item => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: item.name,
                    images: item.image ? [item.image] : [],
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
        })),
        mode: "payment",
        metadata: {
            projectId: params.projectId,
            customerId: params.customerId,
            cartId: params.cartId,
            type: "commerce_checkout"
        },
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
    });
}
