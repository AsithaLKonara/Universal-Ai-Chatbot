import { prisma } from "../prisma";
import { logger } from "../logger";

export interface PredictionResult {
    conversionProbability: number; // 0 to 1
    churnRisk: number; // 0 to 1
    intentStrength: number; // 0 to 1
    recommendedAction: "nurture" | "close" | "discount" | "support";
}

/**
 * Predictive Intelligence Engine
 * Evaluates real-time session data, historical patterns, and intent signals
 * to forecast commerce outcomes and guide orchestrator decisions.
 */
export class PredictiveEngine {
    public static async evaluateSession(
        projectId: string,
        customerId: string,
        history: any[],
        cart: any
    ): Promise<PredictionResult> {
        let intentStrength = 0;
        let conversionProbability = 0;
        let churnRisk = 0;

        // 1. Evaluate Intent Strength (Message count, product queries)
        const productQueries = history.filter(h => h.message.toLowerCase().includes("camera") || h.message.toLowerCase().includes("price")).length;
        intentStrength = Math.min(productQueries * 0.2, 1);

        // 2. Evaluate Conversion Probability (Cart contents, checkout progress)
        if (cart && cart.items.length > 0) {
            conversionProbability += 0.4;
            if (cart.subtotal > 100) conversionProbability += 0.2;
        }

        // 3. Evaluate Churn Risk (Length of history vs inactivity)
        if (history.length > 10 && !cart?.items.length) {
            churnRisk += 0.5; // Circular conversation without intent
        }

        // 4. Recommend Action
        let recommendedAction: PredictionResult["recommendedAction"] = "nurture";
        
        if (conversionProbability > 0.6) {
            recommendedAction = "close";
        } else if (churnRisk > 0.4 && intentStrength > 0.3) {
            recommendedAction = "discount";
        } else if (intentStrength < 0.2) {
            recommendedAction = "support";
        }

        logger.info(`[PREDICTIVE] Session evaluated`, { 
            projectId, 
            customerId, 
            conversionProbability, 
            recommendedAction 
        });

        return {
            conversionProbability,
            churnRisk,
            intentStrength,
            recommendedAction
        };
    }
}
