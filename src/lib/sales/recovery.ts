import { groq } from "../groq";
import { getCustomerProfile } from "../memory";
import { omniBus, OmniEvent } from "../events";

export type RecoveryTriggerType = "hesitation" | "cart_abandonment" | "price_sensitivity";

/**
 * Handles proactive autonomous interventions based on real-time events.
 */
export async function handleRecoveryTrigger(
    type: RecoveryTriggerType, 
    payload: any
): Promise<void> {
    const { projectId, sessionId, userId, context } = payload;
    
    // In a real system, we'd fetch the active cart and profile
    // const profile = await getCustomerProfile(projectId, userId);

    let systemPrompt = `You are an elite autonomous sales agent. 
You are proactively reaching out to the customer because a specific behavioral trigger fired: ${type}.`;

    if (type === "hesitation") {
        systemPrompt += `\nThe customer has been hesitating on the current selection. Offer to narrow down the choices or ask a clarifying question about their core priority (e.g. battery life vs performance). Keep it short and helpful.`;
    } else if (type === "cart_abandonment") {
        systemPrompt += `\nThe customer added items to the cart but hasn't proceeded. Offer a gentle nudge, perhaps highlight a low stock warning for one of the items, or ask if they have any questions about the checkout process.`;
    } else if (type === "price_sensitivity") {
        systemPrompt += `\nThe customer seems hesitant due to price (e.g. asked for discounts, viewed cheaper alternatives repeatedly). Offer to find similar options under their budget or explain the long-term value of the current item.`;
    }

    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Context: ${JSON.stringify(context || {})}\nGenerate the proactive message:` }
            ],
            temperature: 0.7,
            max_completion_tokens: 150
        });

        const recoveryMessage = completion.choices[0]?.message?.content;
        
        console.log(`[RECOVERY ENGINE] Generated proactive message for ${sessionId}:`, recoveryMessage);

        // Emit to SSE stream via OmniBus
        omniBus.emitOmni(OmniEvent.AUTONOMOUS_MESSAGE_GENERATED, {
            sessionId,
            message: recoveryMessage,
            data: { type: "autonomous_intervention", trigger: type }
        });
        
    } catch (error) {
        console.error(`[RECOVERY ENGINE] Failed to generate recovery message for ${type}`, error);
    }
}
