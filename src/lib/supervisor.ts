import { logger } from "./logger";
import { PlanStep, ExecutionPlan } from "./planner";
import { validateAction, getRiskLevel, DEFAULT_POLICY, SafetyPolicy } from "./safety";
import { prisma, projectContext } from "./prisma";

export interface ValidationResult {
    approved: boolean;
    reason?: string;
    modifiedSteps?: PlanStep[];
}

export class ExecutionSupervisor {
    public static async validatePlan(plan: ExecutionPlan): Promise<ValidationResult> {
        logger.info(`[SUPERVISOR] Validating plan for goal: ${plan.goal}`, { 
            action: "validate_plan", 
            goal: plan.goal,
            steps: plan.steps.length 
        });

        const context = projectContext.getStore();
        const projectId = context?.projectId;
        let policy: SafetyPolicy = DEFAULT_POLICY;

        if (projectId) {
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
            if (project) policy = project as SafetyPolicy;
        }
        
        const modifiedSteps: PlanStep[] = [];

        for (const step of plan.steps) {
            const auditContext = {
                tool: step.tool,
                args: step.args,
                goal: plan.goal
            };

            const safety = await validateAction(step.tool, step.args, policy);
            if (!safety.valid) {
                logger.error(`[REASONING] ❌ BLOCKED: ${step.tool}`, { 
                    ...auditContext, 
                    reason: safety.reason 
                });
                return { approved: false, reason: safety.reason };
            }

            if (policy.confirmationRequired.includes(step.tool)) {
                if (!step.args.confirmed) {
                    logger.warn(`[REASONING] ⚠️ PENDING CONFIRMATION: ${step.tool}`, auditContext);
                    return { 
                        approved: false, 
                        reason: `User confirmation required for ${step.tool}. I must ask the user for explicit approval before proceeding with this action.` 
                    };
                }
            }

            const risk = getRiskLevel(step.tool);
            logger.info(`[REASONING] ✅ APPROVED: ${step.tool}`, { 
                ...auditContext, 
                risk 
            });

            modifiedSteps.push(step);
        }

        return { approved: true, modifiedSteps };
    }

    public static async verifyOutput(tool: string, output: any): Promise<boolean> {
        if (tool === "cart_add") {
            if (!output.cart) {
                logger.warn(`[SUPERVISOR] Output verification failed for ${tool}: Missing cart data.`);
                return false;
            }
            // Ensure added product exists and has a price
            if (output.cart.items?.some((i: any) => !i.productId || i.price === undefined)) {
                logger.error(`[SUPERVISOR] Output verification failed for ${tool}: Invalid cart items.`);
                return false;
            }
        }

        if (tool === "product_search" && output.products) {
            // Check for hallucinated products (e.g. products with no ID)
            if (output.products.some((p: any) => !p.id)) {
                logger.error(`[SUPERVISOR] Hallucinated product detected in search results.`);
                return false;
            }
        }

        return true;
    }
}
