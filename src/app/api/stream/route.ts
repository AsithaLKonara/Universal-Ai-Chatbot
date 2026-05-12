import { NextRequest } from "next/server";
import { omniBus, OmniEvent } from "@/lib/events";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const sessionId = req.nextUrl.searchParams.get("sessionId");

    if (!sessionId) {
        return new Response("Missing sessionId", { status: 400 });
    }

    let controller: ReadableStreamDefaultController;
    const stream = new ReadableStream({
        start(c) {
            controller = c;
        },
        cancel() {
            // Cleanup logic when client disconnects
            omniBus.removeListener(OmniEvent.AUTONOMOUS_MESSAGE_GENERATED, messageListener);
        }
    });

    const messageListener = (payload: any) => {
        if (payload.sessionId === sessionId) {
            const data = JSON.stringify({
                content: payload.message,
                data: payload.data,
                intent: "autonomous_intervention"
            });
            controller.enqueue(`data: ${data}\n\n`);
        }
    };

    omniBus.on(OmniEvent.AUTONOMOUS_MESSAGE_GENERATED, messageListener);

    // Keep-alive to prevent connection timeout
    const keepAlive = setInterval(() => {
        try {
            controller.enqueue(`: ping\n\n`);
        } catch {
            clearInterval(keepAlive);
        }
    }, 15000);

    req.signal.addEventListener("abort", () => {
        clearInterval(keepAlive);
        omniBus.removeListener(OmniEvent.AUTONOMOUS_MESSAGE_GENERATED, messageListener);
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
        },
    });
}
