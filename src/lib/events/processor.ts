import { Worker, Job, ConnectionOptions } from "bullmq";
import { OmniEvent } from "../events";
import { logger } from "../logger";
import { alerts } from "../observability/alerts";
import { withEventIdempotency } from "../events/idempotency";

const connection: ConnectionOptions = {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
};

let eventWorker: Worker | null = null;

async function handleEvent(event: OmniEvent, payload: any) {
    const { prisma } = await import("../prisma");
    const { logger } = await import("../logger");
    
    switch (event) {
        case OmniEvent.ANALYTICS_TRACK:
            // Process analytics asynchronously
            await prisma.systemEvent.create({
                data: {
                    type: OmniEvent.ANALYTICS_TRACK,
                    projectId: payload.projectId || "system",
                    payload: payload
                }
            });
            break;
        case OmniEvent.ORDER_CREATED:
            // Send email receipts, update inventory, etc.
            logger.info(`[WORKER] Order created hook triggered for project ${payload.projectId}`, payload);
            break;
        case OmniEvent.REFLECTION_GENERATED:
            // Update customer memory asynchronously
            logger.info(`[WORKER] Reflection generated, updating customer ${payload.customerId}`);
            if (payload.customerId && payload.reflection) {
                await prisma.customer.update({
                    where: { id: payload.customerId },
                    data: {
                        preferences: payload.reflection // Assuming reflection is stored in preferences JSON
                    }
                });
            }
            break;
        default:
            logger.warn(`[WORKER] No specific handler for event: ${event}`);
    }
}

export function createEventWorker() {
    if (typeof window !== "undefined") return null;
    
    eventWorker = new Worker(
        "omnichat-events",
        async (job: Job) => {
            const eventName = job.name as OmniEvent;
            const payload = job.data;

            logger.info(`[WORKER] Processing event: ${eventName}`, { 
                jobId: job.id, 
                attempt: job.attemptsMade + 1 
            });

            try {
                await withEventIdempotency(job.id || "unknown", "worker_event", async () => {
                    await handleEvent(eventName, payload);
                });
            } catch (err) {
                logger.error(`[WORKER] Event handler failed: ${eventName}`, { 
                    jobId: job.id, 
                    error: err instanceof Error ? err.message : String(err) 
                });
                throw err; // Trigger retry
            }
        },
        { connection, concurrency: 5 }
    );

    // Dead Letter Queue Handling
    eventWorker.on("failed", (job, err) => {
        if (job && job.attemptsMade >= (job.opts.attempts || 1)) {
            logger.error(`[DLQ] Event permanently failed: ${job.name}`, {
                jobId: job.id,
                payload: job.data,
                error: err.message,
            });
            
            // Trigger Critical Alert
            const projectId = job.data.projectId || "system";
            alerts.criticalToolFailure(projectId, `event_worker:${job.name}`, err.message);
        }
    });

    eventWorker.on("completed", (job) => {
        logger.info(`[WORKER] Event completed: ${job.name}`, { jobId: job.id });
    });

    return eventWorker;
}

export { eventWorker };
