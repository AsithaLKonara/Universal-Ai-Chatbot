import { logger } from "./logger";

export interface ChaosConfig {
    failureRate: number; // 0 to 1
    latencyMs?: number;
    targetService?: string;
}

const ACTIVE_CHAOS: Record<string, ChaosConfig> = {};

/**
 * Injects chaos into a service call if a rule is active.
 */
export async function withChaos<T>(
    serviceName: string,
    fn: () => Promise<T>
): Promise<T> {
    const config = ACTIVE_CHAOS[serviceName] || (process.env.CHAOS_MODE === "true" ? { failureRate: 0.1, latencyMs: 500 } : null);

    if (config) {
        // Latency simulation
        if (config.latencyMs) {
            await new Promise(r => setTimeout(r, config.latencyMs));
        }

        // Failure simulation
        if (Math.random() < config.failureRate) {
            logger.error(`[CHAOS] Injected failure into ${serviceName}`);
            throw new Error(`Simulated chaos failure in ${serviceName}`);
        }
    }

    return await fn();
}

/**
 * API to toggle chaos for testing.
 */
export function setChaos(serviceName: string, config: ChaosConfig | null) {
    if (config === null) {
        delete ACTIVE_CHAOS[serviceName];
    } else {
        ACTIVE_CHAOS[serviceName] = config;
    }
}
