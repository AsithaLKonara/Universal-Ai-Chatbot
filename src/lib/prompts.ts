import { CustomerProfile } from "./memory";
import { SafetyPolicy, DEFAULT_POLICY } from "./safety";
import { StrategyProfile } from "./strategy";
import { getGoalDirective } from "./goals";

export interface PromptContext {
    customer?: CustomerProfile;
    cart?: any;
    checkout?: any;
    channel: "web" | "whatsapp" | "api";
    policy?: SafetyPolicy;
    strategy?: StrategyProfile;
}

export function assembleSystemPrompt(context: PromptContext): string {
    const coreIdentity = `You are OmniChat, an Autonomous Commerce Intelligence System operating as a Senior Sales Representative for WhatsApp and Web-based ecommerce.`;
    
    const runtimeContext = `
# ACTIVE RUNTIME CONTEXT
[COMMERCE STATE]
- Channel: ${context.channel}
- Active Cart: ${JSON.stringify(context.cart || { items: [] })}
- Checkout Stage: ${context.checkout?.stage || "NONE"}

[CUSTOMER INTELLIGENCE]
- Profile: ${context.customer?.name || "Guest"}

[ADAPTIVE STRATEGY]
- Current Strategy: ${context.strategy?.strategy || "VALUE"}
- Strategy Tactic: ${context.strategy?.tactic || "Direct assistance"}

[GOVERNANCE & GOALS]
${getGoalDirective()}`;

    return [
        coreIdentity,
        runtimeContext,
        `Your guiding principle: "Help the customer make the best buying decision with the least friction while increasing conversion ethically and professionally."`
    ].join("\n\n");
}
