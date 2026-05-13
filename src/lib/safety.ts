import { prisma, projectContext } from "./prisma";

// Agent Safety & Policy Framework

export enum RiskLevel {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH"
}

export interface SafetyPolicy {
    maxDiscount: number;
    maxQuantity: number;
    requireApproval: boolean;
    confirmationRequired: string[];
    restrictedTools: string[];
}

export const DEFAULT_POLICY: SafetyPolicy = {
    maxDiscount: 0.20,
    maxQuantity: 10,
    requireApproval: false,
    confirmationRequired: ["checkout_start", "order_create", "apply_discount"],
    restrictedTools: ["delete_customer", "override_price"]
};

export function getRiskLevel(tool: string): RiskLevel {
    const riskMap: Record<string, RiskLevel> = {
        "product_search": RiskLevel.LOW,
        "cart_view": RiskLevel.LOW,
        "cart_add": RiskLevel.MEDIUM,
        "cart_clear": RiskLevel.MEDIUM,
        "checkout_start": RiskLevel.HIGH,
        "order_status": RiskLevel.MEDIUM,
        "courier_track": RiskLevel.LOW
    };
    return riskMap[tool] || RiskLevel.MEDIUM;
}

export async function validateAction(tool: string, args: any, customPolicy?: SafetyPolicy) {
    const context = projectContext.getStore();
    const projectId = context?.projectId;

    let policy = customPolicy || DEFAULT_POLICY;

    if (projectId) {
        try {
            const project = await prisma.project.findUnique({
                where: { id: projectId },
                select: {
                    maxDiscount: true,
                    maxQuantity: true,
                    requireApproval: true,
                    confirmationRequired: true,
                    restrictedTools: true
                }
            });
            if (project) {
                policy = project as SafetyPolicy;
            }
        } catch (err) {
            console.error("[SAFETY] Failed to fetch per-tenant policy, falling back to default.", err);
        }
    }

    if (policy.restrictedTools.includes(tool)) {
        return { valid: false, reason: "Tool is restricted under current policy." };
    }
    
    if (args.quantity && args.quantity > policy.maxQuantity) {
        return { valid: false, reason: `Quantity ${args.quantity} exceeds safety limit of ${policy.maxQuantity}.` };
    }

    if (tool === "apply_discount" && args.discount > policy.maxDiscount) {
        return { valid: false, reason: `Discount ${args.discount * 100}% exceeds safety limit of ${policy.maxDiscount * 100}%.` };
    }

    return { valid: true };
}
