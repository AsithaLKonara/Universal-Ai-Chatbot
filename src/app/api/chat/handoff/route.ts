import { NextResponse } from "next/server";


export async function POST(req: Request) {
    try {
        const { sessionId, customerId, projectId } = await req.json();
        
        if (!sessionId || !customerId || !projectId) {
            return NextResponse.json({ error: "Missing required fields: sessionId, customerId, or projectId" }, { status: 400 });
        }

        // Generate a 6-character alphanumeric code
        const code = `LINK-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        const { createRedisClient } = await import("@/lib/redis");
        const redis = createRedisClient();
        if (!redis) {
             return NextResponse.json({ error: "Redis not configured" }, { status: 500 });
        }

        // Store mapping with a 10-minute expiration
        await redis.set(`handoff:${code}`, JSON.stringify({ sessionId, customerId, projectId }));
        await redis.expire(`handoff:${code}`, 600); 

        return NextResponse.json({ code, expires_in: 600 });
    } catch (err) {
        console.error("[HANDOFF] Error generating code:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
