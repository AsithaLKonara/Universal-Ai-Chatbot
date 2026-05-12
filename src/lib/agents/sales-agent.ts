import { groq } from "../groq";
import { AgentContext } from "./supervisor";
import { assembleSystemPrompt } from "../prompts";
import { getGoalDirective } from "../goals";
import { evaluateStrategy } from "../strategy";

export async function runSalesAgent(
    context: AgentContext, 
    toolResultText: string
): Promise<string> {
    const { userMessage, history, cart, profile } = context;

    const strategy = evaluateStrategy(profile, cart);
    const dynamicSystemPrompt = assembleSystemPrompt({
        customer: profile,
        cart,
        channel: "web",
        strategy
    });

    const systemContent = [
        `[SALES AGENT IDENTITY]\n${dynamicSystemPrompt}`,
        `You are the specialized Sales Agent. Focus purely on understanding the customer's needs, qualifying them, and closing the sale consultatively.`,
        getGoalDirective(),
        history.length ? `History:\n${history.map(e => `User: ${e.message}\nAssistant: ${e.response}`).join("\n")}` : "",
        toolResultText ? `Context/Data:\n${toolResultText}` : "",
    ].filter(Boolean).join("\n\n");

    const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: systemContent }, { role: "user", content: userMessage }],
        max_completion_tokens: 500,
        temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || "I'm having trouble processing that request.";
}
