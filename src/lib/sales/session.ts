import { omniBus, OmniEvent } from "../events";

export interface SessionState {
    sessionId: string;
    projectId: string;
    userId: string;
    startTime: number;
    lastActivity: number;
    viewedProducts: Set<number>;
    comparedProducts: Set<number>;
    hesitationWarnings: number;
}

// In-memory store for active sessions (in production, use Redis)
const activeSessions = new Map<string, SessionState>();

export function getOrCreateSession(projectId: string, sessionId: string, userId: string): SessionState {
    if (!activeSessions.has(sessionId)) {
        activeSessions.set(sessionId, {
            sessionId,
            projectId,
            userId,
            startTime: Date.now(),
            lastActivity: Date.now(),
            viewedProducts: new Set(),
            comparedProducts: new Set(),
            hesitationWarnings: 0
        });
    }
    return activeSessions.get(sessionId)!;
}

export function trackActivity(sessionId: string, type: "ping" | "view" | "compare", data?: any) {
    const session = activeSessions.get(sessionId);
    if (!session) return;

    session.lastActivity = Date.now();

    if (type === "view" && data?.productId) {
        session.viewedProducts.add(data.productId);
        omniBus.emitOmni(OmniEvent.PRODUCT_VIEWED, { sessionId, productId: data.productId });
    }

    if (type === "compare" && data?.productIds) {
        data.productIds.forEach((id: number) => session.comparedProducts.add(id));
        omniBus.emitOmni(OmniEvent.PRODUCT_COMPARED, { sessionId, productIds: data.productIds });
    }
}

// Hesitation check loop - only run in production/development, not during build
if (process.env.NEXT_PHASE !== "phase-production-build" && typeof window === "undefined") {
    setInterval(() => {
        const now = Date.now();
        for (const [sessionId, session] of activeSessions.entries()) {
            const inactiveTime = now - session.lastActivity;
            
            // If inactive for 30 seconds but has viewed products (simulate hesitation)
            if (inactiveTime > 30000 && inactiveTime < 60000 && session.viewedProducts.size > 0) {
                if (session.hesitationWarnings === 0) {
                    session.hesitationWarnings++;
                    omniBus.emitOmni(OmniEvent.SESSION_HESITATION, { 
                        sessionId, 
                        projectId: session.projectId,
                        userId: session.userId,
                        context: { viewedProducts: Array.from(session.viewedProducts) }
                    });
                }
            }

            // Cleanup very old sessions (e.g. 1 hour)
            if (inactiveTime > 3600000) {
                activeSessions.delete(sessionId);
            }
        }
    }, 10000); // Check every 10 seconds
}
