import { v4 as uuidv4 } from "uuid";
import { logContext } from "../logger";

/**
 * Wraps a function in an observability context, ensuring a correlation ID
 * exists and is propagated through the logger.
 */
export async function withObservability<T>(
    correlationId: string | null,
    fn: () => Promise<T>
): Promise<T> {
    const id = correlationId || uuidv4();
    return await logContext.run({ correlationId: id }, fn);
}

/**
 * Higher-order function for Next.js API routes to inject observability.
 */
export function observeApi(handler: Function) {
    return async (req: Request, ...args: any[]) => {
        const correlationId = req.headers.get("x-correlation-id");
        return await withObservability(correlationId, () => handler(req, ...args));
    };
}
