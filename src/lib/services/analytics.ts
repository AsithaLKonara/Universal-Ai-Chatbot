import { prisma } from "../prisma";

export interface CommerceStats {
    totalRevenue: number;
    conversionRate: number;
    abandonmentRate: number;
    orderCount: number;
    avgOrderValue: number;
    totalTokenSpend: number;
    costPerConversion: number;
    aiRoi: number;
}

export class AnalyticsService {
    public static async getProjectStats(projectId: string): Promise<CommerceStats> {
        const [checkouts, carts, usage] = await Promise.all([
            prisma.checkoutSession.findMany({ where: { projectId } }),
            prisma.cart.findMany({ where: { projectId }, include: { items: true } }),
            prisma.usage.findMany({ where: { projectId } })
        ]);

        const completed = checkouts.filter(c => c.status === "completed");
        const abandoned = checkouts.filter(c => c.status === "abandoned");
        
        const totalRevenue = carts
            .filter(c => c.status === "converted")
            .reduce((sum, c) => sum + c.subtotal, 0);

        const totalTokens = usage.reduce((sum, u) => sum + u.tokens, 0);
        const estimatedCost = (totalTokens / 1000) * 0.01; // $0.01 per 1k tokens avg

        const orderCount = completed.length;
        const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;
        const conversionRate = carts.length > 0 ? (orderCount / carts.length) * 100 : 0;
        const abandonmentRate = checkouts.length > 0 ? (abandoned.length / checkouts.length) * 100 : 0;
        
        const costPerConversion = orderCount > 0 ? estimatedCost / orderCount : 0;
        const aiRoi = estimatedCost > 0 ? (totalRevenue - estimatedCost) / estimatedCost : 0;

        return {
            totalRevenue,
            conversionRate,
            abandonmentRate,
            orderCount,
            avgOrderValue,
            totalTokenSpend: estimatedCost,
            costPerConversion,
            aiRoi
        };
    }
}
