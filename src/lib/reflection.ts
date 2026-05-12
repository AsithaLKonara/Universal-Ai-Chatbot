import { groq } from "./groq";
import { omniBus, OmniEvent } from "./events";

export interface ReflectionSignal {
    sentiment: "positive" | "neutral" | "negative";
    intent_achieved: boolean;
    frictions: string[];
    opportunities: string[];
    suggested_strategy?: string;
    abandonment_reason?: "PRICE" | "TRUST" | "CONFUSION" | "COMPARISON" | "DISTRACTION" | "NONE";
    learned_preferences?: {
        preferredBrands?: string[];
        budget?: number;
        sizes?: Record<string, string>;
        colors?: string[];
        dislikedProducts?: string[];
    };
}

const REFLECTION_PROMPT = `You are the OmniChat Cognitive Mirror.
Analyze the following conversation segment and extract commerce performance signals.
Also, extract any learned user preferences such as preferredBrands, budget, sizes, colors, and dislikedProducts into a 'learned_preferences' object.

Response format: JSON only matching the ReflectionSignal interface.`;

export async function reflectOnInteraction(
    userMessage: string,
    aiResponse: string,
    history: any[] = []
): Promise<ReflectionSignal | null> {
    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            temperature: 0,
            messages: [
                { role: "system", content: REFLECTION_PROMPT },
                { role: "user", content: `User: ${userMessage}\nAI: ${aiResponse}` }
            ],
            response_format: { type: "json_object" }
        });

        const signal = JSON.parse(completion.choices[0]?.message?.content || "{}") as ReflectionSignal;
        omniBus.emitOmni(OmniEvent.ANALYTICS_TRACK, { type: "reflection", signal });

        return signal;
    } catch (error) {
        console.error("Reflection error:", error);
        return null;
    }
}
