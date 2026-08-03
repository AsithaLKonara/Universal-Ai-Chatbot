import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

        // Also create a persistent database ticket for the dashboard inbox
        await prisma.handoffTicket.create({
            data: {
                sessionId,
                projectId,
                customerName: customerId, // Assuming customerId is string, could be name or ID
                status: "queued"
            }
        });

        return NextResponse.json({ code, expires_in: 600 });
    } catch (err) {
        console.error("[HANDOFF] Error generating code:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
