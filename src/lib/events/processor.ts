import { Worker, Job, ConnectionOptions } from "bullmq";
import { OmniEvent } from "../events";
import { logger } from "../logger";
import { alerts } from "../observability/alerts";

const connection: ConnectionOptions = {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
};

let eventWorker: Worker | null = null;

if (process.env.NEXT_PHASE !== "phase-production-build" && typeof window === "undefined") {
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
                await handleEvent(eventName, payload);
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
}

async function handleEvent(event: OmniEvent, payload: any) {
    // Implement event-specific logic here
    switch (event) {
        case OmniEvent.ANALYTICS_TRACK:
            // Process analytics asynchronously
            break;
        case OmniEvent.ORDER_CREATED:
            // Send email receipts, update inventory, etc.
            break;
        case OmniEvent.REFLECTION_GENERATED:
            // Update customer memory asynchronously
            break;
        default:
            logger.warn(`[WORKER] No specific handler for event: ${event}`);
    }
}

export { eventWorker };
