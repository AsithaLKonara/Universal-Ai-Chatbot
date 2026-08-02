import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExecutionSupervisor } from '../supervisor';
import { ExecutionPlan } from '../planner';
import { prisma, projectContext } from '../prisma';

// Mock dependencies
vi.mock('../prisma', () => ({
    prisma: {
        project: {
            findUnique: vi.fn(),
        },
    },
    projectContext: {
        getStore: vi.fn(),
    },
}));

vi.mock('../logger', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

describe('ExecutionSupervisor', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Default context
        (projectContext.getStore as any).mockReturnValue({ projectId: 'proj_123' });
    });

    it('should approve safe tools', async () => {
        const plan: ExecutionPlan = {
            goal: 'check balance',
            steps: [
                { tool: 'product_search', args: { query: 'laptop' } }
            ]
        };

        (prisma.project.findUnique as any).mockResolvedValue({
            maxDiscount: 10,
            maxQuantity: 5,
            requireApproval: false,
            confirmationRequired: ['checkout', 'refund'],
            restrictedTools: []
        });

        const result = await ExecutionSupervisor.validatePlan(plan);
        expect(result.approved).toBe(true);
        expect(result.modifiedSteps).toHaveLength(1);
    });

    it('should block tools exceeding max discount', async () => {
        const plan: ExecutionPlan = {
            goal: 'apply discount',
            steps: [
                { tool: 'apply_discount', args: { discount: 0.50 } } // Policy allows 0.20 (20%)
            ]
        };

        (prisma.project.findUnique as any).mockResolvedValue({
            maxDiscount: 0.20,
            maxQuantity: 5,
            requireApproval: false,
            confirmationRequired: [],
            restrictedTools: []
        });

        const result = await ExecutionSupervisor.validatePlan(plan);
        expect(result.approved).toBe(false);
        expect(result.reason).toContain('exceeds safety limit');
    });

    it('should require confirmation for sensitive tools', async () => {
        const plan: ExecutionPlan = {
            goal: 'process refund',
            steps: [
                { tool: 'refund', args: { amount: 100 } } // not confirmed
            ]
        };

        (prisma.project.findUnique as any).mockResolvedValue({
            maxDiscount: 10,
            maxQuantity: 5,
            requireApproval: false,
            confirmationRequired: ['checkout', 'refund'],
            restrictedTools: []
        });

        const result = await ExecutionSupervisor.validatePlan(plan);
        expect(result.approved).toBe(false);
        expect(result.reason).toContain('User confirmation required');
    });

    it('should approve sensitive tools if already confirmed', async () => {
        const plan: ExecutionPlan = {
            goal: 'process refund',
            steps: [
                { tool: 'refund', args: { amount: 100, confirmed: true } }
            ]
        };

        (prisma.project.findUnique as any).mockResolvedValue({
            maxDiscount: 10,
            maxQuantity: 5,
            requireApproval: false,
            confirmationRequired: ['checkout', 'refund'],
            restrictedTools: []
        });

        const result = await ExecutionSupervisor.validatePlan(plan);
        expect(result.approved).toBe(true);
    });

    describe('verifyOutput', () => {
        it('should detect missing cart items in cart_add', async () => {
            const result = await ExecutionSupervisor.verifyOutput('cart_add', {});
            expect(result).toBe(false);
        });

        it('should detect hallucinated products', async () => {
            const output = { products: [{ name: 'Fake Laptop' }] }; // missing id
            const result = await ExecutionSupervisor.verifyOutput('product_search', output);
            expect(result).toBe(false);
        });

        it('should approve valid outputs', async () => {
            const output = { products: [{ id: 'prod_1', name: 'Real Laptop' }] };
            const result = await ExecutionSupervisor.verifyOutput('product_search', output);
            expect(result).toBe(true);
        });
    });
});
