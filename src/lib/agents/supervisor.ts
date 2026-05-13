import { groq } from "../groq";

export type AgentRole = "sales" | "support" | "comparison" | "general";

import { Channel } from "../services/orchestrator/types";

export interface AgentContext {
    userMessage: string;
    history: any[];
    cart: any;
    profile: any;
    wcConfig: any;
    channel: Channel;
}

export async function supervisorRoute(context: AgentContext): Promise<AgentRole> {
    const prompt = `You are the Supervisor Agent for an AI Commerce Intelligence system.
Analyze the user's message and determine which specialized sub-agent should handle it.

User Message: "${context.userMessage}"

Available Agents:
- "sales": The user is looking for products, recommendations, or wants to buy something.
- "support": The user has an issue with an order, a return, or a general policy question.
- "comparison": The user is explicitly asking to compare two or more products.
- "general": Casual chat, greetings, or off-topic.

Respond ONLY with the exact name of the agent (e.g. "sales", "support", "comparison", "general").`;

    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
            max_completion_tokens: 10
        });

        const rawResult = completion.choices[0]?.message?.content?.trim().toLowerCase() || "general";
        
        if (["sales", "support", "comparison", "general"].includes(rawResult)) {
            return rawResult as AgentRole;
        }
        return "general";
    } catch (err) {
        console.error("[SUPERVISOR] Failed to route", err);
        return "general";
    }
}
