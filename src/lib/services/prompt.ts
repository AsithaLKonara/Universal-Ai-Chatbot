import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export interface PromptTemplate {
    id: string;
    name: string;
    version: number;
    content: string;
    isActive: boolean;
    metadata?: any;
}

/**
 * Manages versioned prompt templates to allow for safe updates,
 * A/B testing, and rapid rollbacks in production.
 */
export class PromptService {
    /**
     * Retrieves the active version of a prompt template.
     * Falls back to a hardcoded default if not found in DB.
     */
    public static async getPrompt(name: string, fallback: string): Promise<string> {
        try {
            // In a real system, this would be cached in Redis
            const template = await prisma.systemEvent.findFirst({
                where: { 
                    type: `prompt_template:${name}`,
                    payload: { path: ["isActive"], equals: true }
                },
                orderBy: { timestamp: "desc" }
            });

            if (template && typeof template.payload === "object" && template.payload !== null) {
                return (template.payload as any).content || fallback;
            }
        } catch (err) {
            logger.error(`[PROMPT] Failed to fetch template: ${name}`, err);
        }
        return fallback;
    }

    /**
     * Creates a new version of a prompt and optionally makes it active.
     */
    public static async savePrompt(name: string, content: string, activate = true) {
        if (activate) {
            // Deactivate old versions
            const oldVersions = await prisma.systemEvent.findMany({
                where: { type: `prompt_template:${name}` }
            });
            for (const old of oldVersions) {
                if (typeof old.payload === "object" && old.payload !== null) {
                    await prisma.systemEvent.update({
                        where: { id: old.id },
                        data: { payload: { ...(old.payload as any), isActive: false } }
                    });
                }
            }
        }

        return await prisma.systemEvent.create({
            data: {
                projectId: "system",
                type: `prompt_template:${name}`,
                payload: { content, isActive: activate, version: Date.now() }
            }
        });
    }
}
