import { groq } from "../groq";

export interface ConfidenceScore {
    score: number; // 0.0 to 1.0
    reasoning: string;
    missingInformation: string[];
}

/**
 * Evaluates the AI's confidence in understanding and fulfilling the user's request.
 * If the score is low, the AI should trigger a clarifying question instead of guessing.
 */
export async function evaluateConfidence(
    userMessage: string,
    history: any[]
): Promise<ConfidenceScore> {
    const prompt = `You are the Confidence Evaluation Engine for an AI Commerce Copilot.
Analyze the user's latest message and the recent conversation history to determine how confident the system should be in fulfilling the request accurately.

Consider:
- Is the request highly ambiguous? (e.g. "I want a thing for my house")
- Is critical information missing? (e.g. asking for shoes without specifying size or style)
- Is the user asking for something impossible or out of scope?

Recent History:
${history.slice(-3).map(h => `User: ${h.message}\nAI: ${h.response}`).join("\n")}

Latest User Message: "${userMessage}"

Respond ONLY with a JSON object in this exact format:
{
    "score": 0.85, // A float between 0.0 and 1.0 (1.0 = extremely confident)
    "reasoning": "A short sentence explaining the score",
    "missingInformation": ["List", "of", "missing", "data", "or empty array if none"]
}`;

    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.1
        });

        const result = JSON.parse(completion.choices[0]?.message?.content || "{}");
        return {
            score: typeof result.score === "number" ? result.score : 1.0,
            reasoning: result.reasoning || "Default confidence",
            missingInformation: result.missingInformation || []
        };
    } catch (err) {
        console.error("[CONFIDENCE ENGINE] Failed to evaluate confidence", err);
        // Default to high confidence on error to avoid blocking flows unnecessarily
        return { score: 1.0, reasoning: "Error fallback", missingInformation: [] };
    }
}
