import { prisma } from "../prisma";
import { logger } from "../logger";

export interface RiskScore {
    score: number; // 0 (safe) to 100 (high risk)
    reasons: string[];
    action: "allow" | "review" | "block";
}

/**
 * Evaluates checkout attempts for fraudulent patterns,
 * suspicious velocity, and abnormal tenant usage.
 */
export class FraudService {
    public static async evaluateCheckout(projectId: string, customerId: string): Promise<RiskScore> {
        const reasons: string[] = [];
        let score = 0;

        // 1. Check Velocity (Many checkouts in a short time)
        const recentCheckouts = await prisma.checkoutSession.count({
            where: {
                projectId,
                customerId,
                createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
            }
        });

        if (recentCheckouts > 5) {
            score += 40;
            reasons.push("High checkout velocity detected.");
        }

        // 2. Check for "Card Testing" (Many abandoned/failed payments)
        const abandoned = await prisma.checkoutSession.count({
            where: {
                projectId,
                customerId,
                status: "abandoned",
                createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            }
        });

        if (abandoned > 10) {
            score += 30;
            reasons.push("Excessive abandoned sessions (possible card testing).");
        }

        // 3. Action Logic
        let action: "allow" | "review" | "block" = "allow";
        if (score >= 70) action = "block";
        else if (score >= 40) action = "review";

        if (action !== "allow") {
            logger.warn(`[FRAUD] Risk detected for customer`, { projectId, customerId, score, action, reasons });
        }

        return { score, reasons, action };
    }
}
