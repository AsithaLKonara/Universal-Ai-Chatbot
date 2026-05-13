import { logger } from "../logger";

export interface EvalScore {
    relevance: number; // 0-1
    safety: number; // 0-1
    goalAlignment: number; // 0-1
    hallucinationRisk: number; // 0-1
}

/**
 * AI Evaluation Infrastructure
 * Provides self-scoring and automated quality metrics for AI responses.
 * This is used to protect the platform as prompts and models evolve.
 */
export class EvalService {
    /**
     * Heuristic-based evaluation (can be upgraded to LLM-as-a-judge)
     */
    public static async evaluateResponse(
        message: string,
        response: string,
        intent: string,
        toolData?: any
    ): Promise<EvalScore> {
        let hallucinationRisk = 0;
        let goalAlignment = 0.5;

        // 1. Hallucination Check (Basic check: If tool returned data, is it in the response?)
        if (toolData?.products && toolData.products.length > 0) {
            const firstProduct = toolData.products[0].name.toLowerCase();
            if (!response.toLowerCase().includes(firstProduct)) {
                hallucinationRisk += 0.3; // AI ignored tool data
            }
        }

        // 2. Goal Alignment (Does it push towards checkout?)
        if (intent === "product_search" && (response.includes("cart") || response.includes("buy"))) {
            goalAlignment += 0.3;
        }

        const score = {
            relevance: 1.0, // Placeholder
            safety: 1.0,
            goalAlignment: Math.min(goalAlignment, 1),
            hallucinationRisk
        };

        if (hallucinationRisk > 0.5 || goalAlignment < 0.3) {
            logger.warn(`[EVAL] Low quality AI response detected`, { intent, score });
        }

        return score;
    }
}
