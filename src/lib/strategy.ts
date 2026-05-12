import { CustomerProfile } from "./memory";
import { CommerceStrategy } from "./governor";

export interface StrategyProfile {
    strategy: CommerceStrategy;
    tone: string;
    tactic: string;
}

export function evaluateStrategy(
    profile?: CustomerProfile, 
    cart?: any, 
    performance?: Record<string, { successRate: number, totalRevenue: number }>
): StrategyProfile {
    // 1. Detect confusion/support need
    if (profile?.preferences?.recentFriction === "negative") {
        return {
            strategy: CommerceStrategy.SUPPORT,
            tone: "Patient and explanatory",
            tactic: "Guide the user step-by-step and clarify any confusion."
        };
    }

    // 2. High-value / Premium detection
    const currentCartValue = cart?.subtotal || 0;
    if (currentCartValue > 10000) {
        return {
            strategy: CommerceStrategy.PREMIUM,
            tone: "Confident and quality-focused",
            tactic: "Emphasize premium features, durability, and brand value."
        };
    }

    // 3. Repeat buyer efficiency
    // Add logic here if needed

    return {
        strategy: CommerceStrategy.VALUE,
        tone: "Reassuring and value-driven",
        tactic: "Highlight affordability, discounts, and the best deals."
    };
}
