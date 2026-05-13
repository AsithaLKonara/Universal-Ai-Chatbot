import { prisma } from "../prisma";
import { OmniEvent } from "../events";

export async function logSystemEvent(params: {
    projectId: string;
    sessionId?: string;
    type: OmniEvent | string;
    payload: any;
}) {
    // Get current sequence number for the session
    let sequenceId = 0;
    if (params.sessionId) {
        const lastEvent = await prisma.systemEvent.findFirst({
            where: { sessionId: params.sessionId },
            orderBy: { sequenceId: "desc" },
            select: { sequenceId: true }
        });
        sequenceId = (lastEvent?.sequenceId || 0) + 1;
    }

    return await prisma.systemEvent.create({
        data: {
            projectId: params.projectId,
            sessionId: params.sessionId,
            sequenceId,
            type: params.type,
            payload: params.payload,
        }
    });
}

export async function getSessionEvents(sessionId: string) {
    return await prisma.systemEvent.findMany({
        where: { sessionId },
        orderBy: { sequenceId: "asc" }
    });
}

export async function replaySession(sessionId: string) {
    const events = await getSessionEvents(sessionId);
    console.log(`[REPLAY] Replaying ${events.length} events for session ${sessionId}`);
    
    // In a real system, you might pipe these events into a "shadow" state manager
    // to verify if the final state matches production.
    return events;
}
