import { Queue, ConnectionOptions } from "bullmq";
import { OmniEvent } from "../events";

const connection: ConnectionOptions = {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
};

export const eventQueue = new Queue("omnichat-events", {
    connection,
    defaultJobOptions: {
        attempts: 5,
        backoff: {
            type: "exponential",
            delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false, // Keep in failed set for DLQ analysis
    },
});

export async function enqueueEvent(event: OmniEvent, payload: any) {
    return await eventQueue.add(event, payload);
}
