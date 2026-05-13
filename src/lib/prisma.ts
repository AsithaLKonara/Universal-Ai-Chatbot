import { PrismaClient } from "@prisma/client";
import { AsyncLocalStorage } from "async_hooks";

// AsyncLocalStorage to hold the current project context for the duration of a request/execution
export const projectContext = new AsyncLocalStorage<{ projectId: string }>();

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prismaBase = globalForPrisma.prisma || new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaBase;

// Models that MUST be scoped by projectId
const SCOPED_MODELS = [
    "Customer",
    "Cart",
    "CheckoutSession",
    "Usage",
    "Knowledge",
    "Conversation",
];

export const prisma = prismaBase.$extends({
    query: {
        $allModels: {
            async $allOperations({ model, operation, args, query }) {
                if (SCOPED_MODELS.includes(model)) {
                    const context = projectContext.getStore();
                    const projectId = context?.projectId;

                    if (projectId) {
                        // Automatically inject projectId into where clause for read/update/delete
                        const a = args as any;
                        if (
                            operation === "findFirst" ||
                            operation === "findMany" ||
                            operation === "findUnique" ||
                            operation === "update" ||
                            operation === "updateMany" ||
                            operation === "delete" ||
                            operation === "deleteMany" ||
                            operation === "count"
                        ) {
                            a.where = { ...a.where, projectId };
                        }

                        // Automatically inject projectId into data for creates
                        if (operation === "create" || operation === "createMany") {
                            if (Array.isArray(a.data)) {
                                a.data = a.data.map((item: any) => ({ ...item, projectId }));
                            } else {
                                a.data = { ...a.data, projectId };
                            }
                        }

                        // Upsert handling
                        if (operation === "upsert") {
                            a.where = { ...a.where, projectId };
                            a.create = { ...a.create, projectId };
                            a.update = { ...a.update, projectId };
                        }
                    } else if (
                        process.env.NODE_ENV === "production" && 
                        !(args as any).ignoreProjectScope // Escape hatch for internal/admin ops
                    ) {
                        // In production, we should ideally block unscoped queries to these models
                        // unless explicitly allowed.
                        // For now, we'll log a warning.
                        console.warn(`[PRISMA] Unscoped query detected for model: ${model}`);
                    }
                }
                return query(args);
            },
        },
        $queryRaw({ query, args }) {
            if (process.env.NODE_ENV === "production") {
                throw new Error("[SECURITY] Raw SQL queries are disabled in production to prevent multi-tenant scoping bypass.");
            }
            return query(args);
        },
        $executeRaw({ query, args }) {
            if (process.env.NODE_ENV === "production") {
                throw new Error("[SECURITY] Raw SQL execution is disabled in production to prevent multi-tenant scoping bypass.");
            }
            return query(args);
        }
    },
});

export type ExtendedPrismaClient = typeof prisma;
