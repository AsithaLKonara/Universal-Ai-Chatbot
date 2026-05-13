import { createRedisClient } from "./redis";

export interface WooCommerceConfig {
    storeUrl: string;
    consumerKey: string;
    consumerSecret: string;
}

let redis = createRedisClient();
function getRedis() { return redis; }

// Basic-auth header
function authHeaders(config: WooCommerceConfig): Record<string, string> {
    const token = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString("base64");
    return {
        Authorization: `Basic ${token}`,
        "Content-Type": "application/json",
    };
}

async function wcFetch<T>(path: string, config: WooCommerceConfig, options?: RequestInit, retries = 3): Promise<T | null> {
    if (!config.storeUrl || !config.consumerKey) return null;
    
    let lastError: any;
    for (let i = 0; i < retries; i++) {
        try {
            const res = await fetch(`${config.storeUrl}/wp-json/wc/v3${path}`, {
                ...options,
                headers: { ...authHeaders(config), ...(options?.headers ?? {}) },
            });

            if (res.ok) {
                return (await res.json()) as T;
            }

            if (res.status >= 400 && res.status < 500) {
                if (res.status !== 429) {
                    console.error(`[WooCommerce] Client Error ${path} → ${res.status}`);
                    return null;
                }
            }
            lastError = new Error(`HTTP ${res.status}`);
        } catch (err) {
            lastError = err;
        }
        
        if (i < retries - 1) {
            await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
        }
    }

    return null;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WCProduct {
    id: number;
    name: string;
    price: string;
    regular_price?: string;
    on_sale?: boolean;
    short_description: string;
    permalink: string;
    stock_status: string;
    stock_quantity?: number | null;
    images: { src: string }[];
}

export interface WCOrder {
    id: number;
    status: string;
    date_created: string;
    total: string;
    billing: { first_name: string; last_name: string; email: string; phone: string };
    shipping: { address_1: string; city: string; country: string };
    line_items: { name: string; quantity: number; total: string }[];
    meta_data: { key: string; value: string }[];
}

// ─── Product Queries ───────────────────────────────────────────────────────────

export async function searchProducts(query: string, config: WooCommerceConfig): Promise<WCProduct[]> {
    const client = getRedis();
    const cacheKey = `wc:${Buffer.from(config.storeUrl).toString("base64")}:search:${Buffer.from(query).toString("base64")}`;

    if (client) {
        try {
            const cached = await client.get<WCProduct[]>(cacheKey);
            if (cached) return cached;
        } catch {}
    }

    const data = await wcFetch<WCProduct[]>(
        `/products?search=${encodeURIComponent(query)}&per_page=5&status=publish`,
        config
    );
    const products = data ?? [];

    if (client && products.length > 0) {
        try {
            await client.set(cacheKey, products, { ex: 300 });
        } catch {}
    }

    return products;
}

export async function getProduct(productId: number, config: WooCommerceConfig): Promise<WCProduct | null> {
    return wcFetch<WCProduct>(`/products/${productId}`, config);
}

// ─── Order Queries ─────────────────────────────────────────────────────────────

export async function getOrder(orderId: string | number, config: WooCommerceConfig): Promise<WCOrder | null> {
    return wcFetch<WCOrder>(`/orders/${orderId}`, config);
}

// ─── Order Creation ────────────────────────────────────────────────────────────

export interface CreateOrderPayload {
    customer: {
        name: string;
        phone: string;
        email: string;
        address: string;
        city: string;
        country: string;
    };
    items: { productId: number; quantity: number }[];
    paymentMethod?: string;
}

export async function createOrder(payload: CreateOrderPayload, config: WooCommerceConfig, idempotencyKey?: string): Promise<WCOrder | null> {
    if (idempotencyKey) {
        const existing = await wcFetch<WCOrder[]>(
            `/orders?meta_key=_omnichat_idempotency_key&meta_value=${idempotencyKey}`,
            config
        );
        if (existing && existing.length > 0) return existing[0];
    }

    const body = {
        payment_method: payload.paymentMethod || "cod",
        billing: {
            first_name: payload.customer.name.split(" ")[0],
            last_name: payload.customer.name.split(" ").slice(1).join(" ") || "-",
            phone: payload.customer.phone,
            email: payload.customer.email,
            address_1: payload.customer.address,
            city: payload.customer.city,
            country: payload.customer.country,
        },
        shipping: {
            first_name: payload.customer.name.split(" ")[0],
            last_name: payload.customer.name.split(" ").slice(1).join(" ") || "-",
            address_1: payload.customer.address,
            city: payload.customer.city,
            country: payload.customer.country,
        },
        line_items: payload.items.map(item => ({
            product_id: item.productId,
            quantity: item.quantity
        })),
        meta_data: idempotencyKey ? [{ key: "_omnichat_idempotency_key", value: idempotencyKey }] : [],
    };

    return wcFetch<WCOrder>("/orders", config, { method: "POST", body: JSON.stringify(body) });
}

export function formatOrderSummary(order: WCOrder): string {
    const items = order.line_items.map((i) => `• ${i.name} x${i.quantity}`).join("\n");
    return [
        `📦 Order #${order.id}`,
        `Status: ${order.status.toUpperCase()}`,
        `Total: ${order.total}`,
        `Items:\n${items}`,
        `Shipping to: ${order.shipping.city}, ${order.shipping.country}`,
    ].join("\n");
}
