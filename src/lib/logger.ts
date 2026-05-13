import { AsyncLocalStorage } from "async_hooks";
import { trace } from "@opentelemetry/api";

export const logContext = new AsyncLocalStorage<{ correlationId: string }>();

type LogLevel = "info" | "warn" | "error" | "debug";

function format(level: LogLevel, message: string, meta?: any) {
    const context = logContext.getStore();
    const correlationId = context?.correlationId || "system";
    
    // Extract OTel trace context
    const span = trace.getActiveSpan();
    const spanContext = span?.spanContext();
    const traceId = spanContext?.traceId;
    const spanId = spanContext?.spanId;

    const entry = {
        timestamp: new Date().toISOString(),
        level,
        correlationId,
        traceId,
        spanId,
        message,
        ...meta,
    };

    if (process.env.NODE_ENV === "production") {
        return JSON.stringify(entry);
    } else {
        const color = level === "error" ? "\x1b[31m" : level === "warn" ? "\x1b[33m" : "\x1b[32m";
        return `${color}[${level.toUpperCase()}]\x1b[0m [${correlationId}] ${message} ${meta ? JSON.stringify(meta) : ""}`;
    }
}

export const logger = {
    info: (msg: string, meta?: any) => console.log(format("info", msg, meta)),
    warn: (msg: string, meta?: any) => console.warn(format("warn", msg, meta)),
    error: (msg: string, meta?: any) => console.error(format("error", msg, meta)),
    debug: (msg: string, meta?: any) => {
        if (process.env.NODE_ENV !== "production") {
            console.debug(format("debug", msg, meta));
        }
    },
};
