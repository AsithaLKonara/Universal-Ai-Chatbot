import { prisma } from "../prisma";
import { logger } from "../logger";

/**
 * Ensures that a block of logic is only executed once for a given event ID.
 * This is critical for webhook handling and queue processing.
 */
export async function withEventIdempotency<T>(
    eventId: string,
    namespace: string,
    fn: () => Promise<T>
): Promise<T | null> {
    try {
        // 1. Check if event was already processed
        const existing = await prisma.systemEvent.findFirst({
            where: { 
                externalId: eventId,
                type: `idempotency:${namespace}`
            }
        });

        if (existing) {
            logger.info(`[IDEMPOTENCY] Event ${eventId} already processed in namespace ${namespace}`);
            return null;
        }

        // 2. Execute logic
        const result = await fn();

        // 3. Mark as processed
        await prisma.systemEvent.create({
            data: {
                externalId: eventId,
                type: `idempotency:${namespace}`,
                projectId: "system", // Or extract from context if available
                payload: { processedAt: new Date().toISOString() }
            }
        });

        return result;
    } catch (err) {
        logger.error(`[IDEMPOTENCY] Execution failure for event ${eventId}`, err);
        throw err;
    }
}
