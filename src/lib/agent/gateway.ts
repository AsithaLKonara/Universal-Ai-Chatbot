import { z } from "zod";
import { groq } from "../groq";
import { logger } from "../logger";
import { trace, SpanStatusCode } from "@opentelemetry/api";

export interface GatewayConfig<T extends z.ZodType> {
    model: string;
    systemPrompt: string;
    userMessage: string;
    schema: T;
    maxRetries?: number;
    temperature?: number;
}

const tracer = trace.getTracer("ai-gateway");

export async function aiGateway<T extends z.ZodType>(
    config: GatewayConfig<T>
): Promise<z.infer<T>> {
    return tracer.startActiveSpan("ai_inference_cycle", async (span) => {
        const { 
            model, 
            systemPrompt, 
            userMessage, 
            schema, 
            maxRetries = 2, 
            temperature = 0.1 
        } = config;

        span.setAttributes({
            "ai.model": model,
            "ai.max_retries": maxRetries,
            "ai.temperature": temperature
        });

        let attempts = 0;
        let currentSystemPrompt = systemPrompt;

        while (attempts <= maxRetries) {
            attempts++;
            const attemptSpan = tracer.startSpan(`attempt_${attempts}`);
            try {
                const completion = await groq.chat.completions.create({
                    model,
                    messages: [
                        { role: "system", content: currentSystemPrompt },
                        { role: "user", content: userMessage }
                    ],
                    temperature,
                    response_format: { type: "json_object" }
                });

                const raw = completion.choices[0]?.message?.content?.trim() || "{}";
                const parsed = JSON.parse(raw);
                
                const validation = schema.safeParse(parsed);
                if (validation.success) {
                    attemptSpan.setStatus({ code: SpanStatusCode.OK });
                    attemptSpan.end();
                    span.setStatus({ code: SpanStatusCode.OK });
                    span.end();
                    return validation.data;
                }

                // If validation fails, update prompt for retry
                logger.warn(`[AI-GATEWAY] Validation failed (Attempt ${attempts})`, { 
                    error: validation.error.format() 
                });

                attemptSpan.setStatus({ 
                    code: SpanStatusCode.ERROR, 
                    message: "Validation failed" 
                });
                attemptSpan.setAttributes({ "ai.validation_error": JSON.stringify(validation.error.format()) });
                attemptSpan.end();

                currentSystemPrompt = `${systemPrompt}\n\nIMPORTANT: Your previous output failed validation. 
                Error: ${JSON.stringify(validation.error.format())}. 
                Please fix the structure and try again. 
                Required JSON Schema hints: ${JSON.stringify(schema.description || "Refer to original instructions")}`;

            } catch (err) {
                logger.error(`[AI-GATEWAY] Inference failed (Attempt ${attempts})`, { error: err });
                attemptSpan.recordException(err as Error);
                attemptSpan.setStatus({ code: SpanStatusCode.ERROR });
                attemptSpan.end();
            }
        }

        const finalError = new Error(`AI Gateway failed after ${maxRetries} attempts.`);
        span.recordException(finalError);
        span.setStatus({ code: SpanStatusCode.ERROR });
        span.end();
        throw finalError;
    });
}
