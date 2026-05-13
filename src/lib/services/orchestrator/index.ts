import { detectIntent } from "../../intent";
import { supervisorRoute } from "../../agents/supervisor";
import { runSalesAgent } from "../../agents/sales-agent";
import { evaluateConfidence } from "../../commerce/confidence";
import { reflectOnInteraction } from "../../reflection";
import { upsertCustomerProfile, saveMessage } from "../../memory";
import { evaluateStrategy } from "../../strategy";
import { assembleSystemPrompt } from "../../prompts";
import { getGoalDirective } from "../../goals";
import { groq } from "../../groq";
import { logger } from "../../logger";
import { OrchestratorContext, OrchestratorResponse, ConversationContext } from "./types";
import { ContextAssembler } from "./context-assembler";
import { ToolExecutionEngine } from "./tool-engine";
import { checkTenantRateLimit } from "../../ratelimit";
import { withResilience } from "../../resilience";
import { validateInput, sanitizeOutput } from "../../security";
import { withObservability } from "../../middleware/observability";
import { PredictiveEngine } from "../../intelligence/predictive";
import { EvalService } from "../../intelligence/evaluator";

export class OrchestratorService {
    public static async process(ctx: OrchestratorContext): Promise<OrchestratorResponse> {
        const { projectId, userId, sessionId, message, channel, metadata } = ctx;
        const correlationId = metadata?.correlationId || null;

        return await withObservability(correlationId, async () => {
            // 0. Security & Rate Limiting
            const security = validateInput(message);
            if (!security.safe) {
                return { content: "I cannot process this request due to security policies.", intent: "security_violation" };
            }

            const ratelimit = await checkTenantRateLimit(projectId);
            if (!ratelimit.success) {
                logger.warn(`[ORCHESTRATOR] Rate limit exceeded for project`, { projectId });
                return {
                    content: "I'm receiving too many requests from your account right now. Please wait a moment and try again.",
                    intent: "rate_limit_exceeded"
                };
            }

            return await withResilience(async () => {
                try {
                    // 1. Assemble Context
                    const convCtx = await ContextAssembler.assemble(ctx);
                    const { profile, history, cart, checkout, knowledge, project } = convCtx;

                    // 1b. Predictive Intelligence
                    const prediction = await PredictiveEngine.evaluateSession(projectId, userId, history, cart);

                    // 2. Intent Detection
                    const intent = await detectIntent(message);
                    logger.info(`[ORCHESTRATOR] Detected intent: ${intent.intent}`, { projectId, sessionId });

                    // 3. Confidence Check
                    const confidence = await evaluateConfidence(message, history);
                    if (confidence.score < 0.6 && confidence.missingInformation.length > 0) {
                        const clarification = `I want to make sure I get this exactly right for you. Could you clarify: ${confidence.missingInformation.join(", ")}?`;
                        await saveMessage(projectId, sessionId, userId, message, clarification);
                        return { content: clarification, intent: "clarification_request" };
                    }

                    // 4. Tool Execution
                    const toolResult = await ToolExecutionEngine.execute(intent, message, convCtx, userId);

                    // 5. Routing & Agent Execution
                    const routedRole = await supervisorRoute({
                        userMessage: message,
                        history,
                        cart,
                        profile,
                        channel,
                        wcConfig: {
                            storeUrl: project.wooCommerceStoreUrl,
                            consumerKey: project.wooCommerceKey,
                            consumerSecret: project.wooCommerceSecret
                        }
                    });

                    let responseContent = "";
                    if (routedRole === "sales" || routedRole === "comparison") {
                        responseContent = await runSalesAgent({
                            userMessage: message,
                            history,
                            cart,
                            profile,
                            channel,
                            wcConfig: {} 
                        }, toolResult.text);
                    } else {
                        // Default Support/General Agent
                        const strategy = evaluateStrategy(profile, cart);
                        const systemPrompt = assembleSystemPrompt({
                            customer: profile,
                            cart,
                            checkout,
                            channel,
                            strategy
                        });

                        const systemContent = [
                            systemPrompt,
                            getGoalDirective(),
                            history.length ? `History:\n${history.map(e => `User: ${e.message}\nAssistant: ${e.response}`).join("\n")}` : "",
                            knowledge.length ? `Knowledge:\n${knowledge.join("\n")}` : "",
                            toolResult.text ? `Current Context:\n${toolResult.text}` : "",
                        ].filter(Boolean).join("\n\n");

                        const stream = await groq.chat.completions.create({
                            model: "llama-3.3-70b-versatile",
                            messages: [{ role: "system", content: systemContent }, { role: "user", content: message }],
                            max_completion_tokens: 500,
                            temperature: 0.7,
                            stream: !!ctx.onStream
                        });

                        if (ctx.onStream && (stream as any)[Symbol.asyncIterator]) {
                           for await (const chunk of stream as any) {
                               const content = chunk.choices[0]?.delta?.content || "";
                               if (content) {
                                   responseContent += content;
                                   ctx.onStream(content);
                               }
                           }
                        } else {
                            const completion = stream as any;
                            responseContent = completion.choices[0]?.message?.content || "I'm having trouble formulating a response.";
                        }
                    }

                    // 6. Persistence & Memory
                    await Promise.all([
                        saveMessage(projectId, sessionId, userId, message, responseContent),
                        this.performReflection(projectId, userId, message, responseContent, history, profile)
                    ]);

                    // 7. AI Quality Evaluation
                    const evaluation = await EvalService.evaluateResponse(message, responseContent, intent.intent, toolResult.data);

                    return {
                        content: sanitizeOutput(responseContent),
                        data: {
                            ...toolResult.data,
                            prediction,
                            evaluation
                        },
                        intent: intent.intent
                    };

                } catch (err) {
                    logger.error("[ORCHESTRATOR] Critical execution failure", { error: err, projectId, userId });
                    return {
                        content: "I'm sorry, I encountered a technical problem and cannot process your request right now. Please try again in a moment.",
                        intent: "error"
                    };
                }
            });
        });
    }

    private static async performReflection(
        projectId: string, 
        userId: string, 
        message: string, 
        response: string, 
        history: any[],
        profile: any
    ) {
        try {
            const reflection = await reflectOnInteraction(message, response, history);
            if (reflection?.learned_preferences) {
                const currentPrefs = profile?.preferences || {};
                await upsertCustomerProfile(projectId, userId, {
                    preferences: {
                        ...currentPrefs,
                        ...reflection.learned_preferences
                    }
                });
            }
        } catch (err) {
            logger.error("[ORCHESTRATOR] Reflection failed", { error: err });
        }
    }
}
