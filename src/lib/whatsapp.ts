// WhatsApp Business Platform gateway (Multi-tenant)

export interface WhatsAppConfig {
    token: string;
    phoneId: string;
    verifyToken: string;
    appSecret?: string | null;
}

export interface InboundMessage {
    from: string;
    messageId: string;
    text: string;
    timestamp: string;
}

// ─── Parse Inbound Webhook ─────────────────────────────────────────────────────

export function parseInboundMessage(body: unknown): InboundMessage | null {
    try {
        const b = body as Record<string, unknown>;
        const entry = (b.entry as Record<string, unknown>[])?.[0];
        const change = (entry?.changes as Record<string, unknown>[])?.[0];
        const value = change?.value as Record<string, unknown>;
        const message = (value?.messages as Record<string, unknown>[])?.[0];

        if (!message) return null;

        const text =
            (message.type === "text"
                ? (message.text as Record<string, string>)?.body
                : null) ?? "";

        if (!text) return null;

        return {
            from: message.from as string,
            messageId: message.id as string,
            text,
            timestamp: message.timestamp as string,
        };
    } catch {
        return null;
    }
}

// ─── Verify Webhook Handshake ──────────────────────────────────────────────────

export function verifyWebhook(params: Record<string, string>, config: WhatsAppConfig): string | null {
    if (
        params["hub.mode"] === "subscribe" &&
        params["hub.verify_token"] === config.verifyToken
    ) {
        return params["hub.challenge"];
    }
    return null;
}

// ─── Validate Hub Signature ────────────────────────────────────────────────────

export async function verifySignature(
    body: string,
    signatureHeader: string | null,
    config: WhatsAppConfig
): Promise<boolean> {
    if (!signatureHeader) return false;
    if (!config.appSecret) return true;

    const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(config.appSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );

    const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
    const expected = "sha256=" + Buffer.from(signature).toString("hex");
    return expected === signatureHeader;
}

// ─── Send Text Message ─────────────────────────────────────────────────────────

export async function sendWhatsAppMessage(to: string, text: string, config: WhatsAppConfig): Promise<boolean> {
    if (!config.token || !config.phoneId) {
        console.warn(`WhatsApp credentials not configured for ${to}`);
        return false;
    }

    const url = `https://graph.facebook.com/v19.0/${config.phoneId}/messages`;

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${config.token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to,
                type: "text",
                text: { preview_url: false, body: text },
            }),
        });

        if (!res.ok) {
            const err = await res.text();
            console.error(`WhatsApp send error ${res.status}:`, err);
            return false;
        }

        return true;
    } catch (err) {
        console.error("WhatsApp send exception:", err);
        return false;
    }
}

// ─── Send Button Template ──────────────────────────────────────────────────────

export async function sendWhatsAppButtons(
    to: string,
    body: string,
    buttons: { id: string; title: string }[],
    config: WhatsAppConfig
): Promise<boolean> {
    if (!config.token || !config.phoneId) return false;

    const url = `https://graph.facebook.com/v19.0/${config.phoneId}/messages`;

    const res = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${config.token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to,
            type: "interactive",
            interactive: {
                type: "button",
                body: { text: body },
                action: {
                    buttons: buttons.map((b) => ({
                        type: "reply",
                        reply: { id: b.id, title: b.title },
                    })),
                },
            },
        }),
    });

    return res.ok;
}
