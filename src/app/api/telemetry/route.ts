import { NextResponse } from "next/server";
import { getOrCreateSession, trackActivity } from "@/lib/sales/session";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { projectId, sessionId = "guest_session", userId = "guest", type, data } = body;

        if (!projectId) return NextResponse.json({ error: "Missing projectId" }, { status: 400 });

        // Ensure session exists
        getOrCreateSession(projectId, sessionId, userId);

        // Track the activity
        trackActivity(sessionId, type, data);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[TELEMETRY API] Error processing telemetry", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
