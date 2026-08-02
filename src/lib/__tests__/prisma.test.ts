import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { prisma, projectContext } from '../prisma';

describe('Prisma Multi-Tenant & Security Middleware', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
    });

    describe('Security Rules', () => {
        it('should block $queryRaw in production', async () => {
            vi.stubEnv('NODE_ENV', 'production');
            await expect(prisma.$queryRaw`SELECT * FROM users`).rejects.toThrow(
                '[SECURITY] Raw SQL queries are disabled in production to prevent multi-tenant scoping bypass.'
            );
        });

        it('should block $executeRaw in production', async () => {
            vi.stubEnv('NODE_ENV', 'production');
            await expect(prisma.$executeRaw`DELETE FROM users`).rejects.toThrow(
                '[SECURITY] Raw SQL execution is disabled in production to prevent multi-tenant scoping bypass.'
            );
        });
    });

    describe('Project Context (AsyncLocalStorage)', () => {
        it('should securely store and retrieve projectId across async boundaries', async () => {
            await projectContext.run({ projectId: 'tenant_abc' }, async () => {
                // Simulate some async work
                await new Promise(resolve => setTimeout(resolve, 10));
                const ctx = projectContext.getStore();
                expect(ctx?.projectId).toBe('tenant_abc');
            });
        });

        it('should be undefined outside of a run block', () => {
            const ctx = projectContext.getStore();
            expect(ctx).toBeUndefined();
        });
    });
});
