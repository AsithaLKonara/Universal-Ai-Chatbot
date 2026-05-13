import { prisma } from "./prisma";
import { omniBus, OmniEvent } from "./events";

export interface TelemetryEvent {
    projectId: string;
    sessionId: string;
    userId: string;
    type: string;
    data: any;
}

export async function trackTelemetry(event: TelemetryEvent) {
    // Record to database (Usage model can be repurposed or create a new Telemetry model)
    // For now, we'll log it and emit to the bus for background processing.
    
    await omniBus.emitOmni(OmniEvent.ANALYTICS_TRACK, {
        ...event,
        timestamp: new Date().toISOString()
    });
}

// Client-side helper (can be used via an API route)
export async function recordClientBehavior(projectId: string, sessionId: string, behavior: "dwell" | "click" | "scroll", details: any) {
    await trackTelemetry({
        projectId,
        sessionId,
        userId: "guest", // Placeholder
        type: `client_${behavior}`,
        data: details
    });
}
