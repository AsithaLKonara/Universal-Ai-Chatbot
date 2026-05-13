import { prisma, projectContext } from "../../prisma";
import { getCustomerProfile, getHistory } from "../../memory";
import { getCart } from "../../cart";
import { getOrCreateCheckout } from "../../checkout";
import { searchKnowledge } from "../../knowledge";
import { OrchestratorContext, ConversationContext } from "./types";

export class ContextAssembler {
    public static async assemble(ctx: OrchestratorContext): Promise<ConversationContext> {
        const { projectId, userId, sessionId, message } = ctx;

        return await projectContext.run({ projectId }, async () => {
            const project = await prisma.project.findUnique({ where: { id: projectId } });
            if (!project) throw new Error(`Project ${projectId} not found`);

            const [profile, history, cart, knowledge] = await Promise.all([
                getCustomerProfile(projectId, userId),
                getHistory(projectId, sessionId, userId),
                getCart(projectId, userId),
                searchKnowledge(message, projectId),
            ]);

            const checkout = await getOrCreateCheckout(projectId, userId, cart.id);

            return {
                profile,
                history,
                cart,
                checkout,
                knowledge,
                project
            };
        });
    }
}
