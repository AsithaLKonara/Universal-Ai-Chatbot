import { NextResponse } from "next/server";
import twilio from "twilio";
import { prisma } from "@/lib/prisma";
import { OrchestratorService } from "@/lib/services/orchestrator";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = await params;
    
    const formData = await req.formData();
    const speechResult = formData.get("SpeechResult")?.toString() || "";
    const fromNumber = formData.get("From")?.toString() || "Unknown";

    const twiml = new twilio.twiml.VoiceResponse();

    if (!speechResult.trim()) {
        twiml.say("I didn't quite catch that. Could you repeat?");
        twiml.gather({
            input: ['speech'],
            action: `/api/webhooks/twilio/${projectId}/process`,
            speechTimeout: "auto"
        });
        return new NextResponse(twiml.toString(), { headers: { "Content-Type": "text/xml" } });
    }

    try {
        const sessionId = `twilio:${fromNumber}`;
        const correlationId = `twilio:${projectId}:${fromNumber}:${Date.now()}`;

        // Process through the standard Orchestrator
        const result = await OrchestratorService.process({
            projectId,
            userId: fromNumber,
            sessionId,
            channel: "voice", // could be mapped to 'web' or handled specifically
            message: speechResult,
            metadata: { correlationId }
        });

        // Strip markdown from response for TTS
        let cleanText = result.content.replace(/[*#_`~\[\]>]/g, "").trim();

        twiml.say(cleanText);
        twiml.gather({
            input: ['speech'],
            action: `/api/webhooks/twilio/${projectId}/process`,
            speechTimeout: "auto"
        });

    } catch (err) {
        logger.error("[TWILIO] Error processing voice input", { error: err });
        twiml.say("I'm sorry, I'm having trouble processing that right now.");
        twiml.hangup();
    }

    return new NextResponse(twiml.toString(), {
        headers: { "Content-Type": "text/xml" }
    });
}
