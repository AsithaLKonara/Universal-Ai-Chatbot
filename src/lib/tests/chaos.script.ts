import { OrchestratorService } from "../services/orchestrator";
import { setChaos } from "../chaos";
import { logger } from "../logger";

async function runChaosTest() {
    logger.info("🔥 Starting Automated Chaos Validation...");

    const projectId = "test_project";
    const userId = "chaos_tester";

    // 1. Target: WooCommerce failure
    // Setting 50% failure rate with 1s latency
    setChaos("woocommerce", { failureRate: 0.5, latencyMs: 1000 });
    logger.info("⚠️  WooCommerce Chaos ACTIVE (50% failure rate)");

    try {
        const result = await OrchestratorService.process({
            projectId,
            userId,
            sessionId: "chaos_session",
            channel: "web",
            message: "I want to see some cameras",
            metadata: { correlationId: "chaos-test-001" }
        });

        logger.info("✅ Orchestrator completed under chaos", { intent: result.intent });
    } catch (err) {
        logger.error("❌ Orchestrator CRASHED under chaos", err);
    }

    // 2. Target: Redis failure simulation (if we had a Redis wrapper)
    
    setChaos("woocommerce", null);
    logger.info("🏁 Chaos Validation Complete.");
}

runChaosTest();
