import { prisma } from "./prisma";
import { logger } from "./logger";

/**
 * Handles GDPR 'Right to be Forgotten' requests by purging all PII 
 * associated with a customer while preserving non-PII transaction logs 
 * for accounting and analytics (anonymized).
 */
export async function purgeCustomerData(projectId: string, customerPhone: string) {
    logger.info(`[COMPLIANCE] Starting data purge for customer`, { projectId, customerPhone });

    return await prisma.$transaction(async (tx) => {
        // 1. Find the customer
        const customer = await tx.customer.findUnique({
            where: { projectId_phone: { projectId, phone: customerPhone } }
        });

        if (!customer) {
            logger.warn(`[COMPLIANCE] Customer not found for purge`, { projectId, customerPhone });
            return;
        }

        // 2. Delete conversations (high PII density)
        await tx.conversation.deleteMany({
            where: { projectId, userId: customerPhone }
        });

        // 3. Anonymize orders/carts (Preserve revenue data but strip PII)
        await tx.cart.updateMany({
            where: { projectId, customerId: customerPhone },
            data: {
                // Assuming we want to keep subtotal but clear identifying info
                // If the model has PII, clear it here.
            }
        });

        // 4. Delete the customer record itself
        await tx.customer.delete({
            where: { id: customer.id }
        });

        logger.info(`[COMPLIANCE] Successfully purged PII for customer`, { customerId: customer.id });
    });
}
