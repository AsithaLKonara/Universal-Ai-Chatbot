import { EventEmitter } from "events";
import { createRedisClient } from "./redis";
import { enqueueEvent } from "./events/queue";
import { projectContext } from "./prisma";
import { logSystemEvent } from "./events/replay";

export enum OmniEvent {
    CART_UPDATED = "cart.updated",
    CART_CLEARED = "cart.cleared",
    CHECKOUT_STARTED = "checkout.started",
    CHECKOUT_COMPLETED = "checkout.completed",
    ORDER_CREATED = "order.created",
    TOOL_EXECUTED = "tool.executed",
    TOOL_FAILED = "tool.failed",
    REFLECTION_GENERATED = "reflection.generated",
    OUTCOME_SIGNAL = "outcome.signal",
    ANALYTICS_TRACK = "analytics.track",
    // Phase 2 Commerce Events
    PRODUCT_VIEWED = "product.viewed",
    PRODUCT_COMPARED = "product.compared",
    SESSION_HESITATION = "session.hesitation",
    CART_ABANDONED_POTENTIAL = "cart.abandoned.potential",
    PRICE_SENSITIVITY_DETECTED = "price.sensitivity.detected",
    AUTONOMOUS_MESSAGE_GENERATED = "autonomous.message.generated"
}

const redis = createRedisClient();

class OmniBus extends EventEmitter {
    private static instance: OmniBus;

    private constructor() {
        super();
        this.setMaxListeners(50);
    }

    public static getInstance(): OmniBus {
        if (!OmniBus.instance) {
            OmniBus.instance = new OmniBus();
        }
        return OmniBus.instance;
    }

    public async emitOmni(event: OmniEvent, payload: any) {
        const context = projectContext.getStore();
        const projectId = context?.projectId || payload.projectId;
        const sessionId = payload.sessionId;

        console.log(`[EVENT] ${event}`, { ...payload, projectId, sessionId });
        
        // Local in-memory emission
        this.emit(event, payload);

        // Persistent System Event Log (Replay-ready)
        if (projectId) {
            try {
                await logSystemEvent({
                    projectId,
                    sessionId,
                    type: event,
                    payload
                });
            } catch (err) {
                console.error(`[EVENT] Failed to log system event ${event}`, err);
            }
        }

        // Global emission via Redis Pub/Sub
        if (redis) {
            try {
                await redis.publish("omnichat:events", JSON.stringify({ event, payload, projectId, sessionId, timestamp: Date.now() }));
            } catch (err) {
                console.error(`[EVENT] Failed to publish ${event} to Redis Pub/Sub`, err);
            }
        }

        // Reliable emission via BullMQ
        try {
            await enqueueEvent(event, { ...payload, projectId, sessionId });
        } catch (err) {
            console.error(`[EVENT] Failed to enqueue ${event} to BullMQ`, err);
        }
    }
}

export const omniBus = OmniBus.getInstance();
