import { logger } from "./logger";

export interface ResilienceOptions {
    retries?: number;
    timeout?: number;
    onRetry?: (error: any, attempt: number) => void;
}

export async function withResilience<T>(
    fn: () => Promise<T>,
    options: ResilienceOptions = {}
): Promise<T> {
    const { retries = 3, timeout = 10000 } = options;
    let lastError: any;

    for (let i = 0; i < retries; i++) {
        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Timeout")), timeout)
            );

            return await Promise.race([fn(), timeoutPromise]) as T;
        } catch (err: any) {
            lastError = err;
            logger.warn(`[RESILIENCE] Attempt ${i + 1} failed`, { error: err.message });
            
            if (i < retries - 1) {
                // Exponential backoff
                await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
            }
        }
    }

    throw lastError;
}

// Simple Circuit Breaker State
const CIRCUIT_STATE: Record<string, { failures: number; lastFailure: number; status: "open" | "closed" }> = {};

export async function withCircuitBreaker<T>(
    key: string,
    fn: () => Promise<T>,
    threshold = 5,
    resetTime = 60000
): Promise<T> {
    const state = CIRCUIT_STATE[key] || { failures: 0, lastFailure: 0, status: "closed" };

    if (state.status === "open") {
        if (Date.now() - state.lastFailure > resetTime) {
            state.status = "closed";
            state.failures = 0;
        } else {
            throw new Error(`Circuit breaker ${key} is open`);
        }
    }

    try {
        const result = await fn();
        state.failures = 0;
        CIRCUIT_STATE[key] = state;
        return result;
    } catch (err) {
        state.failures++;
        state.lastFailure = Date.now();
        if (state.failures >= threshold) {
            state.status = "open";
            logger.error(`[RESILIENCE] Circuit breaker ${key} OPENED`);
        }
        CIRCUIT_STATE[key] = state;
        throw err;
    }
}
