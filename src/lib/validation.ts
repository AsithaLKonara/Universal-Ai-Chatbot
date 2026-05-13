import { z } from "zod";

// --- API Request Schemas ---

export const ChatRequestSchema = z.object({
    message: z.string().optional(),
    messages: z.array(z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string()
    })).optional(),
    projectId: z.string().cuid(),
    userId: z.string().default("guest"),
});

export const WebhookRequestSchema = z.object({
    projectId: z.string(),
    payload: z.any(),
});

// --- Event Payload Schemas ---

export const CartEventSchema = z.object({
    projectId: z.string(),
    customerId: z.string(),
    cartId: z.string(),
    action: z.enum(["add", "remove", "clear"]),
    items: z.array(z.any()).optional(),
    total: z.number(),
});

export const CheckoutEventSchema = z.object({
    projectId: z.string(),
    customerId: z.string(),
    cartId: z.string(),
    stage: z.string(),
    status: z.string(),
});

export const OrderEventSchema = z.object({
    projectId: z.string(),
    customerId: z.string(),
    orderId: z.string(),
    total: z.number(),
    items: z.array(z.any()),
});
