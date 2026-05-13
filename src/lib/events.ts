import { EventEmitter } from "events";
import { createRedisClient } from "./redis";

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
        console.log(`[EVENT] ${event}`, payload);
        
        // Local in-memory emission
        this.emit(event, payload);

        // Global emission via Redis
        if (redis) {
            try {
                await redis.publish("omnichat:events", JSON.stringify({ event, payload, timestamp: Date.now() }));
            } catch (err) {
                console.error(`[EVENT] Failed to publish ${event} to Redis`, err);
            }
        }
    }
}

export const omniBus = OmniBus.getInstance();
