import { createEventWorker } from "../src/lib/events/processor";
import { logger } from "../src/lib/logger";

console.log("🚀 Starting BullMQ Background Worker...");

const worker = createEventWorker();

if (worker) {
    logger.info("[WORKER] Successfully connected to Redis queue and listening for events...");
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
        logger.info("[WORKER] Shutting down cleanly...");
        await worker.close();
        process.exit(0);
    });
} else {
    logger.error("[WORKER] Failed to instantiate worker. Ensure process.env.UPSTASH_REDIS_REST_URL is configured.");
    process.exit(1);
}
