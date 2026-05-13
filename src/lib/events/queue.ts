import { Queue, ConnectionOptions } from "bullmq";
import { OmniEvent } from "../events";

const connection: ConnectionOptions = {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
};

let _eventQueue: Queue | null = null;

export function getEventQueue() {
    if (!_eventQueue) {
        _eventQueue = new Queue("omnichat-events", {
            connection,
            defaultJobOptions: {
                attempts: 5,
                backoff: {
                    type: "exponential",
                    delay: 1000,
                },
                removeOnComplete: true,
                removeOnFail: false,
            },
        });
    }
    return _eventQueue;
}

export async function enqueueEvent(event: OmniEvent, payload: any) {
    const queue = getEventQueue();
    return await queue.add(event, payload);
}
