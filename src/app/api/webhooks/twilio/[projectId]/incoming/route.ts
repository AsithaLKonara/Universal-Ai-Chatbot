import { NextResponse } from "next/server";
import twilio from "twilio";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = await params;
    
    // Validate project exists and has twilio enabled
    const project = await prisma.project.findUnique({
        where: { id: projectId }
    });

    if (!project || !project.twilioEnabled) {
        return new Response("Twilio not configured for this project", { status: 404 });
    }

    const twiml = new twilio.twiml.VoiceResponse();
    
    twiml.say("Welcome! How can I help you today?");
    twiml.gather({
        input: ['speech'],
        action: `/api/webhooks/twilio/${projectId}/process`,
        speechTimeout: "auto"
    });

    return new NextResponse(twiml.toString(), {
        headers: { "Content-Type": "text/xml" }
    });
}
