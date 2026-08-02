import { PrismaClient } from "@prisma/client";
import { AsyncLocalStorage } from "async_hooks";

// AsyncLocalStorage to hold the current project context for the duration of a request/execution
export const projectContext = new AsyncLocalStorage<{ projectId: string }>();

const globalForPrisma = global as unknown as { prisma: PrismaClient };

/**
 * Serverless-aware Prisma Client with connection pooling.
 * 
 * In serverless environments (Vercel Edge/Functions), each invocation can spawn
 * a new DB connection. Without pooling this exhausts PostgreSQL's max_connections.
 * 
 * Strategy:
 * - connection_limit=1 per serverless instance (each function handles 1 req at a time).
 * - pool_timeout=20s before connection attempt fails gracefully.
 * - If PRISMA_ACCELERATE_URL is set, route through Prisma Accelerate (managed pooler).
 */
const getDatabaseUrl = () => {
    // Prisma Accelerate URL takes priority (managed global connection pooler)
    if (process.env.PRISMA_ACCELERATE_URL) {
        return process.env.PRISMA_ACCELERATE_URL;
    }
    // Serverless: append pooling params to standard DATABASE_URL if not already present
    const url = process.env.DATABASE_URL || "";
    if (url && !url.includes("connection_limit") && !url.includes("pgbouncer")) {
        const separator = url.includes("?") ? "&" : "?";
        return `${url}${separator}connection_limit=1&pool_timeout=20`;
    }
    return url;
};

const prismaBase = globalForPrisma.prisma || new PrismaClient({
    datasources: {
        db: {
            url: getDatabaseUrl(),
        },
    },
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
