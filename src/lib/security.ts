import { logger } from "./logger";

const INJECTION_PATTERNS = [
    /ignore previous instructions/i,
    /system prompt/i,
    /you are now a/i,
    /bypass/i,
    /developer mode/i
];

/**
 * Basic defense against prompt injection attacks.
 */
export function validateInput(text: string): { safe: boolean; reason?: string } {
    for (const pattern of INJECTION_PATTERNS) {
        if (pattern.test(text)) {
            logger.warn(`[SECURITY] Potential prompt injection detected`, { text });
            return { safe: false, reason: "Adversarial pattern detected" };
        }
    }
    return { safe: true };
}

/**
 * Sanitize AI output to prevent HTML injection or XSS if rendered directly.
 */
export function sanitizeOutput(text: string): string {
    return text
        .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
        .replace(/on\w+="[^"]*"/gim, "")
        .trim();
}
